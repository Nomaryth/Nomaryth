import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const idToken = String(body.idToken || '')
    if (!idToken) return NextResponse.json({ ok: false }, { status: 400 })
    const decoded = await adminAuth.verifyIdToken(idToken)
    const maxAge = 60 * 60 * 2
    const res = NextResponse.json({ ok: true })
    res.cookies.set('__session', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax',
      path: '/',
      maxAge,
    })
    res.headers.set('x-uid', decoded.uid)
    return res
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('__session', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return res
}

