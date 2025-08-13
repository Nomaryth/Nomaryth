import { NextResponse, NextRequest } from 'next/server'

const ADMIN_PATH = /^\/admin(?:\/.*)?$/
const sessionCache = new Map<string, { isAdmin: boolean; expires: number }>()
const rateLimitMap = new Map<string, { count: number; expires: number }>()

setInterval(() => {
  const now = Date.now()
  for (const [key, value] of sessionCache.entries()) {
    if (value.expires < now) sessionCache.delete(key)
  }
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.expires < now) rateLimitMap.delete(key)
  }
}, 120000)

function getClientIP(req: NextRequest): string {
  const cfIP = req.headers.get('cf-connecting-ip')
  if (cfIP) return cfIP.trim()
  
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    const firstIP = forwarded.split(',')[0]?.trim()
    if (firstIP && firstIP !== 'unknown') return firstIP
  }
  
  const realIP = req.headers.get('x-real-ip')
  if (realIP && realIP !== 'unknown') return realIP.trim()
  
  return 'unknown'
}

function isRateLimited(ip: string, isAdminRoute: boolean): boolean {
  const now = Date.now()
  const limit = isAdminRoute ? 15 : 60
  const window = isAdminRoute ? 60000 : 60000
  
  let entry = rateLimitMap.get(ip)
  if (!entry || entry.expires < now) {
    entry = { count: 1, expires: now + window }
    rateLimitMap.set(ip, entry)
    return false
  }
  
  entry.count++
  return entry.count > limit
}

function validateRequest(req: NextRequest): boolean {
  const userAgent = req.headers.get('user-agent') || ''
  const origin = req.headers.get('origin') || ''
  const host = req.headers.get('host') || ''
  const referer = req.headers.get('referer') || ''

  if (!userAgent) return false
  
  const allowedHost = host.includes('gghorizon.com') || host.includes('localhost')
  if (!allowedHost) return false
  
  if (origin && !origin.includes('gghorizon.com') && !origin.includes('localhost')) return false
  
  if (referer && !referer.includes('gghorizon.com') && !referer.includes('localhost')) return false
  
  return true
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl
  const pathname = url.pathname
  if (!ADMIN_PATH.test(pathname)) return NextResponse.next()

  if (req.method !== 'GET') {
    return new NextResponse('Method Not Allowed', { status: 405 })
  }

  const ip = getClientIP(req)
  
  if (!validateRequest(req)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  if (isRateLimited(ip, true)) {
    fetch(new URL('/api/security-log', req.url), {
      method: 'POST',
      cache: 'no-store',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ip, userAgent: req.headers.get('user-agent') || '', path: pathname, type: 'rate_limit', route: 'admin' }),
    }).catch(() => {})
    return new NextResponse('Too Many Requests', { status: 429 })
  }

  const session = req.cookies.get('__session')?.value || ''
  if (!session) {
    fetch(new URL('/api/security-log', req.url), {
      method: 'POST',
      cache: 'no-store',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ip, userAgent: req.headers.get('user-agent') || '', path: pathname, type: 'no_session', route: 'admin' }),
    }).catch(() => {})
    return new NextResponse('Forbidden', { status: 403 })
  }

  let isAdmin = false
  try {
    const now = Date.now()
    const cached = sessionCache.get(session)
    if (cached && cached.expires > now) {
      isAdmin = cached.isAdmin
    } else {
      const verify = await fetch(new URL('/api/session/verify', req.url), { 
        cache: 'no-store', 
        headers: { cookie: req.headers.get('cookie') || '' } 
      })
      if (verify.ok) {
        const j = await verify.json()
        isAdmin = !!j.isAdmin
        sessionCache.set(session, { isAdmin, expires: now + 20000 })
      }
    }
  } catch {}

  if (isAdmin) return NextResponse.next()

  fetch(new URL('/api/security-log', req.url), {
    method: 'POST',
    cache: 'no-store',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ip, userAgent: req.headers.get('user-agent') || '', path: pathname, type: 'unauthorized', route: 'admin' }),
  }).catch(() => {})

  return new NextResponse('Forbidden', { status: 403 })
}

export const config = { matcher: ['/admin/:path*'] }