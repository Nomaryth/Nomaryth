import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SECURITY_CONFIG, getSecurityHeaders, shouldLog } from '@/lib/security-config';

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  return forwarded?.split(',')[0] || realIP || cfConnectingIP || 'unknown';
}

function isRateLimited(ip: string, isAdmin: boolean = false): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  
  const config = isAdmin ? {
    window: SECURITY_CONFIG.RATE_LIMIT.ADMIN_WINDOW_MS,
    max: SECURITY_CONFIG.RATE_LIMIT.ADMIN_MAX_REQUESTS
  } : {
    window: SECURITY_CONFIG.RATE_LIMIT.WINDOW_MS,
    max: SECURITY_CONFIG.RATE_LIMIT.MAX_REQUESTS
  };
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + config.window });
    return false;
  }
  
  if (record.count >= config.max) {
    if (shouldLog('rate_limit')) {
      console.warn(`Rate limit exceeded for IP: ${ip}`);
    }
    return true;
  }
  
  record.count++;
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (pathname.startsWith('/_next/') || 
      pathname.startsWith('/favicon.ico') ||
      pathname.startsWith('/api/geolocation') ||
      pathname.startsWith('/api/weather')) {
    return NextResponse.next();
  }
  
  if (pathname.startsWith('/api/')) {
    const clientIP = getClientIP(request);
    const isAdmin = pathname.startsWith('/api/admin/');
    
    if (isRateLimited(clientIP, isAdmin)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
  }
  
  const response = NextResponse.next();
  const securityHeaders = getSecurityHeaders();
  
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  if (pathname.startsWith('/api/admin')) {
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    response.headers.set('X-RateLimit-Limit', '10');
    response.headers.set('X-RateLimit-Remaining', '9');
    response.headers.set('X-RateLimit-Reset', Math.floor(Date.now() / 1000 + 3600).toString());
  }
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 