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

    const body = await req.json()
    
    const sanitizedEvent = {
      ip: String(body.ip || ip),
      userAgent: String(body.userAgent || '').substring(0, 500),
      path: String(body.path || '').substring(0, 200),
      method: String(body.method || 'GET').substring(0, 10),
      timestamp: new Date().toISOString(),
      isAuthenticated: Boolean(body.isAuthenticated || false),
      userId: body.userId && body.isAuthenticated ? String(body.userId).substring(0, 50) : null,
      email: null,
      referer: body.referer ? String(body.referer).substring(0, 200) : null,
      origin: body.origin ? String(body.origin).substring(0, 100) : null,
      agentHint: body.agentHint ? String(body.agentHint).substring(0, 200) : null,
      severity: body.type === 'unauthorized' || body.type === 'rate_limit' ? 'high' : 'medium',
      eventType: String(body.type || 'access').substring(0, 50)
    }

    const rtdb = getSecondRtdb()
    if (rtdb) {
      const ref = rtdb.ref('sec_events').push()
      await ref.set(sanitizedEvent)
      return NextResponse.json({ ok: true, id: ref.key })
    }
    
    const secondAdminDb = getSecondDb()
    if (!secondAdminDb) return NextResponse.json({ ok: false, reason: 'second_db_unavailable' }, { status: 503 })
    
    const col = secondAdminDb.collection('sec_events')
    const ref = await col.add(sanitizedEvent)
    return NextResponse.json({ ok: true, id: ref.id })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

