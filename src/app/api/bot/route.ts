import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { rateLimiters } from '@/lib/rate-limiter'

const PUBLIC_RATE_LIMIT = {
  windowMs: 30000, // 30 segundos
  maxRequests: 3   // 3 requisições por 30s = 6 req/min
}

class PublicRateLimiter {
  private cache = new Map<string, { count: number; expires: number; lastRequest: number }>()

  isLimited(ip: string): boolean {
    const now = Date.now()
    let entry = this.cache.get(ip)
    
    if (!entry || entry.expires < now) {
      entry = { count: 1, expires: now + PUBLIC_RATE_LIMIT.windowMs, lastRequest: now }
      this.cache.set(ip, entry)
      return false
    }

    const timeSinceLastRequest = now - entry.lastRequest
    if (timeSinceLastRequest < 1000) return true // 1s cooldown mínimo

    entry.count++
    entry.lastRequest = now
    
    return entry.count > PUBLIC_RATE_LIMIT.maxRequests
  }

  getResetTime(ip: string): number {
    const entry = this.cache.get(ip)
    return entry ? entry.expires : Date.now()
  }

  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expires < now) {
        this.cache.delete(key)
      }
    }
  }
}

const publicRateLimiter = new PublicRateLimiter()

setInterval(() => {
  publicRateLimiter.cleanup()
}, 30000)

async function handleStatus() {
  const [usersSnapshot, factionsSnapshot, charactersSnapshot, contentSnapshot] = await Promise.all([
    adminDb.collection('users').get(),
    adminDb.collection('factions').get(),
    adminDb.collection('characters').doc('showcase').get(),
    adminDb.collection('content').doc('home').get(),
  ])

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const activeUsers = usersSnapshot.docs.filter(doc => {
    const userData = doc.data()
    const lastSeen = userData.lastSeen ? new Date(userData.lastSeen) : null
    return Boolean(lastSeen && lastSeen > thirtyDaysAgo)
  }).length

  const activeFactions = factionsSnapshot.docs.filter(doc => {
    const factionData = doc.data()
    return factionData.status === 'active' || factionData.status === undefined
  }).length

  const characters = charactersSnapshot.exists ? charactersSnapshot.data()?.characters || [] : []

  const homeContent: Record<string, any> = contentSnapshot.exists ? (contentSnapshot.data() as Record<string, any>) || {} : {}

  return {
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    statistics: {
      totalUsers: usersSnapshot.size,
      activeUsers,
      totalFactions: factionsSnapshot.size,
      activeFactions,
      characters: characters.length,
      documents: Object.keys(homeContent).length,
    },
    content: {
      exploreTitle: homeContent.explore_title || 'Explore Nomaryth',
      exploreSubtitle: homeContent.explore_subtitle || 'Descubra um mundo de possibilidades',
      testimonials: homeContent.testimonials || [],
    },
  }
}

async function handleContent() {
  const homeContentDoc = await adminDb.collection('content').doc('home').get()
  const homeContent = homeContentDoc.exists ? homeContentDoc.data() || {} : {}
  const publicContent = {
    explore: {
      title: (homeContent as any).explore_title || 'Explore Nomaryth',
      subtitle: (homeContent as any).explore_subtitle || 'Descubra um mundo de possibilidades',
    },
    testimonials: (homeContent as any).testimonials || [],
    lastUpdated: (homeContent as any).updatedAt || null,
  }

  return {
    success: true,
    content: publicContent,
    timestamp: new Date().toISOString(),
  }
}

async function handleCharacters() {
  const charactersDoc = await adminDb.collection('characters').doc('showcase').get()
  const characters = charactersDoc.exists ? charactersDoc.data()?.characters || [] : []
  const publicCharacters = (characters as any[]).map((char: any) => ({
    id: char.id,
    name: char.name,
    description: char.description,
    role: char.role,
    faction: char.faction,
    level: char.level,
    image: char.image,
  }))

  return {
    success: true,
    count: publicCharacters.length,
    characters: publicCharacters,
    timestamp: new Date().toISOString(),
  }
}

async function handleFactions() {
  const factionsSnapshot = await adminDb.collection('factions').get()
  const factions = factionsSnapshot.docs
    .filter(doc => {
      const data = doc.data()
      return data.status === 'active' || data.status === undefined
    })
    .map(doc => {
      const data = doc.data() as any
      return {
        id: doc.id,
        name: data.name || 'Sem nome',
        description: data.description || 'Sem descrição',
        leader: data.leader || 'Líder não definido',
        memberCount: data.memberCount || 0,
        createdAt: data.createdAt || null,
        status: data.status || 'active',
      }
    })
    .sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0))

  return {
    success: true,
    count: factions.length,
    factions,
    timestamp: new Date().toISOString(),
  }
}

async function handleHealth(request: NextRequest) {
  const started = Date.now()
  let apiSelfMs = null as null | number
  try {
    const origin = request.nextUrl.origin
    const t0 = Date.now()
    const res = await fetch(`${origin}/api/public/stats`, { cache: 'no-store' })
    await res.text()
    apiSelfMs = Date.now() - t0
  } catch {
    apiSelfMs = null
  }

  const mu = process.memoryUsage()
  const toMB = (n: number) => Math.round((n / 1024 / 1024) * 10) / 10

  return {
    ok: true,
    service: 'api',
    online: true,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    version: process.env.npm_package_version || '1.0.0',
    env: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    runtime: {
      node: process.version,
      vercel: Boolean(process.env.VERCEL) || false,
      region: process.env.VERCEL_REGION || null,
    },
    resources: {
      memoryMB: {
        rss: toMB(mu.rss),
        heapTotal: toMB(mu.heapTotal),
        heapUsed: toMB(mu.heapUsed),
        external: toMB(mu.external || 0),
        arrayBuffers: toMB((mu as any).arrayBuffers || 0),
      },
    },
    latencyMs: {
      apiSelf: apiSelfMs,
      handlerTotal: Date.now() - started,
    },
  }
}

export async function GET(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    
    if (publicRateLimiter.isLimited(clientIP)) {
      const resetTime = publicRateLimiter.getResetTime(clientIP)
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
          limit: '3 requests per 30 seconds'
        }, 
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Reset': resetTime.toString()
          }
        }
      )
    }

    const action = request.nextUrl.searchParams.get('action') || 'status'

    if (action === 'status') {
      const data = await handleStatus()
      console.log(`[PUBLIC BOT API] Status request from IP: ${clientIP} at ${new Date().toISOString()}`)
      return NextResponse.json(data)
    }

    if (action === 'health') {
      const data = await handleHealth(request)
      console.log(`[PUBLIC BOT API] Health request from IP: ${clientIP} at ${new Date().toISOString()}`)
      return NextResponse.json(data)
    }

    if (action === 'content') {
      const data = await handleContent()
      console.log(`[PUBLIC BOT API] Content request from IP: ${clientIP} at ${new Date().toISOString()}`)
      return NextResponse.json(data)
    }

    if (action === 'characters') {
      const data = await handleCharacters()
      console.log(`[PUBLIC BOT API] Characters request from IP: ${clientIP} at ${new Date().toISOString()}`)
      return NextResponse.json(data)
    }

    if (action === 'factions') {
      const data = await handleFactions()
      console.log(`[PUBLIC BOT API] Factions request from IP: ${clientIP} at ${new Date().toISOString()}`)
      return NextResponse.json(data)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in public bot API:', error)
    return NextResponse.json({ error: 'Internal server error', timestamp: new Date().toISOString() }, { status: 500 })
  }
}


