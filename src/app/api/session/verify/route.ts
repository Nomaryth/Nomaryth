import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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
    const cookie = req.cookies.get('__session')?.value || ''
    if (!cookie) return NextResponse.json({ ok: false }, { status: 401 })
    const decoded = await adminAuth.verifyIdToken(cookie)
    const admin = await isUserAdmin(decoded.uid)
    return NextResponse.json({ ok: true, uid: decoded.uid, email: decoded.email || null, isAdmin: admin })
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
}

