import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'
import { getSecondDb, getSecondRtdb } from '@/lib/firebase-admin-second'

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
    const rtdb = getSecondRtdb()
    if (rtdb) {
      const { searchParams } = new URL(req.url)
      const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200)
      const snap = await rtdb.ref('sec_events').limitToLast(limit).get()
      const val = snap.val() || {}
      const arr = Object.entries(val).map(([id, v]: any) => ({ id, ...v }))
      arr.sort((a: any, b: any) => (a.timestamp > b.timestamp ? -1 : 1))
      return NextResponse.json({ data: arr, nextCursor: '' })
    }
    const secondAdminDb = getSecondDb()
    if (!secondAdminDb) return NextResponse.json({ error: 'second_db_unavailable' }, { status: 503 })
    const authHeader = req.headers.get('authorization') || ''
    if (!authHeader.startsWith('Bearer ')) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    const idToken = authHeader.slice(7)
    const decoded = await adminAuth.verifyIdToken(idToken)
    const ok = await isUserAdmin(decoded.uid)
    if (!ok) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200)
    const cursor = searchParams.get('cursor') || ''
    let query = secondAdminDb.collection('sec_events').orderBy('timestamp', 'desc').limit(limit)
    if (cursor) query = query.startAfter(cursor)
    const snap = await query.get()
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    const nextCursor = data.length > 0 ? String(data[data.length - 1].timestamp) : ''
    return NextResponse.json({ data, nextCursor })
  } catch {
    return NextResponse.json({ error: 'error' }, { status: 500 })
  }
}

