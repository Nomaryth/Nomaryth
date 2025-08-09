import { NextResponse, NextRequest } from 'next/server'

const ADMIN_PATH = /^\/admin(?:\/.*)?$/

export async function middleware(req: NextRequest) {
  const url = req.nextUrl
  const pathname = url.pathname
  if (!ADMIN_PATH.test(pathname)) return NextResponse.next()

  const session = req.cookies.get('__session')?.value || ''
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || ''
  const userAgent = req.headers.get('user-agent') || ''
  const method = req.method
  let isAdmin = false
  let isAuthenticated = false
  let uid: string | undefined
  let email: string | undefined

  try {
    if (session) {
      const verify = await fetch(new URL('/api/session/verify', req.url), { cache: 'no-store', headers: { cookie: req.headers.get('cookie') || '' } })
      if (verify.ok) {
        const j = await verify.json()
        isAuthenticated = !!j.ok
        isAdmin = !!j.isAdmin
        uid = j.uid || undefined
        email = j.email || undefined
      }
    }
  } catch {}

  if (isAdmin) return NextResponse.next()

  try {
    await fetch(new URL('/api/security-log', req.url), {
      method: 'POST',
      cache: 'no-store',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ip,
        userAgent,
        path: pathname,
        method,
        isAuthenticated,
        userId: uid,
        email,
        referer: req.headers.get('referer') || '',
        origin: req.headers.get('origin') || '',
        agentHint: req.headers.get('sec-ch-ua') || '',
      }),
    })
  } catch {}

  url.pathname = '/unauthorized'
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/admin/:path*'],
}


