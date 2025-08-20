import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { rateLimiters } from '@/lib/rate-limiter'
import { timingSafeEqual } from 'crypto'

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || process.env.NOMARYTH_API_TOKEN

function constantTimeEquals(a: string, b: string): boolean {
  try {
    const aBuf = Buffer.from(a)
    const bBuf = Buffer.from(b)
    if (aBuf.length !== bBuf.length) return false
    return timingSafeEqual(aBuf, bBuf)
  } catch {
    return false
  }
}

function validateBotToken(request: NextRequest): boolean {
  if (!BOT_TOKEN) {
    console.warn('[BOT API] Missing bot token env (DISCORD_BOT_TOKEN/NOMARYTH_API_TOKEN)')
  }

  const authHeader = request.headers.get('authorization') || ''
  const altHeader = request.headers.get('x-bot-token') || request.headers.get('x-api-key')
  const host = request.headers.get('host') || ''
  const devBypass = process.env.NODE_ENV !== 'production' && process.env.ALLOW_DEV_BOT === 'true' && (host.includes('localhost') || host.startsWith('127.0.0.1'))

  if (devBypass) return true

  let token = ''
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.replace('Bearer ', '').trim()
  } else if (altHeader) {
    token = String(altHeader).trim()
  }

  if (BOT_TOKEN) {
    return !!token && constantTimeEquals(token, String(BOT_TOKEN))
  }
  return false
}

function computeDevBypass(request: NextRequest): boolean {
  const host = request.headers.get('host') || ''
  return process.env.NODE_ENV !== 'production' && process.env.ALLOW_DEV_BOT === 'true' && (host.includes('localhost') || host.startsWith('127.0.0.1'))
}

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
    if (rateLimiters.bot.isLimited(clientIP)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    if (!validateBotToken(request)) {
      const host = request.headers.get('host') || ''
      const isLocalDev = process.env.NODE_ENV !== 'production' && (host.includes('localhost') || host.startsWith('127.0.0.1'))
      if (isLocalDev) {
        const diag = {
          hasEnvToken: Boolean(BOT_TOKEN),
          authHeaderPresent: Boolean(request.headers.get('authorization')),
          altHeaderPresent: Boolean(request.headers.get('x-bot-token') || request.headers.get('x-api-key')),
          devBypass: computeDevBypass(request),
        }
        return NextResponse.json({ error: 'Unauthorized', diagnostics: diag }, { status: 401 })
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const action = request.nextUrl.searchParams.get('action') || 'status'

    if (action === 'status') {
      const data = await handleStatus()
      console.log(`[BOT API] Status request from IP: ${clientIP} at ${new Date().toISOString()}`)
      return NextResponse.json(data)
    }

    if (action === 'health') {
      const data = await handleHealth(request)
      console.log(`[BOT API] Health request from IP: ${clientIP} at ${new Date().toISOString()}`)
      return NextResponse.json(data)
    }

    if (action === 'content') {
      const data = await handleContent()
      console.log(`[BOT API] Content request from IP: ${clientIP} at ${new Date().toISOString()}`)
      return NextResponse.json(data)
    }

    if (action === 'characters') {
      const data = await handleCharacters()
      console.log(`[BOT API] Characters request from IP: ${clientIP} at ${new Date().toISOString()}`)
      return NextResponse.json(data)
    }

    if (action === 'factions') {
      const data = await handleFactions()
      console.log(`[BOT API] Factions request from IP: ${clientIP} at ${new Date().toISOString()}`)
      return NextResponse.json(data)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in bot unified API:', error)
    return NextResponse.json({ error: 'Internal server error', timestamp: new Date().toISOString() }, { status: 500 })
  }
}


