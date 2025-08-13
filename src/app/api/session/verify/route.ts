import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const verifyRateLimit = new Map<string, { count: number; expires: number }>()

function isVerifyRateLimited(ip: string): boolean {
  const now = Date.now()
  let entry = verifyRateLimit.get(ip)
  if (!entry || entry.expires < now) {
    entry = { count: 1, expires: now + 60000 }
    verifyRateLimit.set(ip, entry)
    return false
  }
  entry.count++
  return entry.count > 100
}

setInterval(() => {
  const now = Date.now()
  for (const [key, value] of verifyRateLimit.entries()) {
    if (value.expires < now) verifyRateLimit.delete(key)
  }
}, 120000)

async function isUserAdmin(uid: string) {
  try {
    const snap = await adminDb.collection('admins').doc(uid).get()
    return snap.exists
  } catch {
    return false
  }
}

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               req.headers.get('x-real-ip') || 
               req.headers.get('cf-connecting-ip') || 
               'unknown'
    
    if (isVerifyRateLimited(ip)) {
      return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })
    }

    const cookie = req.cookies.get('__session')?.value || ''
    if (!cookie) return NextResponse.json({ ok: false }, { status: 401 })
    const decoded = await adminAuth.verifyIdToken(cookie)
    const admin = await isUserAdmin(decoded.uid)
    return NextResponse.json({ ok: true, uid: decoded.uid, email: decoded.email || null, isAdmin: admin })
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
}

