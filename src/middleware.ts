import { NextResponse, type NextRequest } from 'next/server';
import { SECURITY_CONFIG, shouldLog } from '@/lib/security-config';

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let str = '';
  for (let i = 0; i < bytes.length; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  // Edge runtime possui btoa
  return btoa(str);
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  return forwarded?.split(',')[0] || realIP || cfConnectingIP || 'unknown';
}

function isRateLimited(ip: string, isAdmin: boolean = false): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  const cfg = isAdmin
    ? { window: SECURITY_CONFIG.RATE_LIMIT.ADMIN_WINDOW_MS, max: SECURITY_CONFIG.RATE_LIMIT.ADMIN_MAX_REQUESTS }
    : { window: SECURITY_CONFIG.RATE_LIMIT.WINDOW_MS, max: SECURITY_CONFIG.RATE_LIMIT.MAX_REQUESTS };

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + cfg.window });
    return false;
  }
  if (record.count >= cfg.max) {
    if (shouldLog('rate_limit')) console.warn(`Rate limit exceeded for IP: ${ip}`);
    return true;
  }
  record.count++;
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets
  if (pathname.startsWith('/_next/') || pathname === '/favicon.ico') {
    return NextResponse.next();
  }

  // API rate limit
  if (pathname.startsWith('/api/')) {
    const clientIP = getClientIP(request);
    const admin = pathname.startsWith('/api/admin/');
    if (isRateLimited(clientIP, admin)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }
  }

  // CSP with nonce
  const nonce = generateNonce();
  const connectSrc = [
    "'self'",
    'https://www.googleapis.com',
    'https://apis.google.com',
    'https://accounts.google.com',
    'https://identitytoolkit.googleapis.com',
    'https://securetoken.googleapis.com',
    'https://firestore.googleapis.com',
    'https://storage.googleapis.com',
    'https://api.github.com',
    'https://raw.githubusercontent.com',
    'https://api.open-meteo.com',
    'https://geocoding-api.open-meteo.com',
    'https://va.vercel-scripts.com',
    'https://analytics.umami.is',
    'https://us.umami.is',
    'https://static.cloudflareinsights.com',
  ].join(' ');

  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    "'unsafe-inline'",
    "'unsafe-eval'",
    'https://apis.google.com',
    'https://www.gstatic.com',
    'https://accounts.google.com',
    'https://va.vercel-scripts.com',
    'https://analytics.umami.is',
    'https://us.umami.is',
    'https://static.cloudflareinsights.com',
  ].join(' ');

  const csp = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    `connect-src ${connectSrc}`,
    "frame-src 'self' https://www.google.com https://accounts.google.com https://nomarythweb.firebaseapp.com https://*.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('x-csp-nonce', nonce);
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  if (pathname.startsWith('/api')) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  }

  return response;
}

export const config = {
  matcher: '/:path*',
}; 