import { NextRequest, NextResponse } from 'next/server'
import { getSecondDb, getSecondRtdb } from '@/lib/firebase-admin-second'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const rtdb = getSecondRtdb()
    if (rtdb) {
      const now = new Date()
      const body = await req.json()
      const ref = rtdb.ref('sec_events').push()
      await ref.set({
        ip: String(body.ip || ''),
        userAgent: String(body.userAgent || ''),
        path: String(body.path || ''),
        method: String(body.method || ''),
        timestamp: now.toISOString(),
        isAuthenticated: Boolean(body.isAuthenticated || false),
        userId: body.userId ? String(body.userId) : null,
        email: body.email ? String(body.email) : null,
        referer: body.referer ? String(body.referer) : null,
        origin: body.origin ? String(body.origin) : null,
        agentHint: body.agentHint ? String(body.agentHint) : null,
      })
      return NextResponse.json({ ok: true, id: ref.key })
    }
    const secondAdminDb = getSecondDb()
    if (!secondAdminDb) return NextResponse.json({ ok: false, reason: 'second_db_unavailable' }, { status: 503 })
    const doc = {
      ip: String((await req.json()).ip || ''),
    }
    const col = secondAdminDb.collection('sec_events')
    const ref = await col.add(doc)
    return NextResponse.json({ ok: true, id: ref.id })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

