import { NextRequest, NextResponse } from 'next/server'
import { getSecondDb, getSecondRtdb } from '@/lib/firebase-admin-second'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const logRateLimit = new Map<string, { count: number; expires: number }>()

function isLogRateLimited(ip: string): boolean {
  const now = Date.now()
  let entry = logRateLimit.get(ip)
  if (!entry || entry.expires < now) {
    entry = { count: 1, expires: now + 60000 }
    logRateLimit.set(ip, entry)
    return false
  }
  entry.count++
  return entry.count > 30
}

setInterval(() => {
  const now = Date.now()
  for (const [key, value] of logRateLimit.entries()) {
    if (value.expires < now) logRateLimit.delete(key)
  }
}, 120000)

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               req.headers.get('x-real-ip') || 
               req.headers.get('cf-connecting-ip') || 
               'unknown'
    
    if (isLogRateLimited(ip)) {
      return NextResponse.json({ ok: false, reason: 'rate_limited' }, { status: 429 })
    }

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

