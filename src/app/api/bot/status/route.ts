import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { adminDb } from '@/lib/firebase-admin';
import { rateLimiters } from '@/lib/rate-limiter';

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || process.env.NOMARYTH_API_TOKEN;

function constantTimeEquals(a: string, b: string): boolean {
  try {
    const aBuf = Buffer.from(a);
    const bBuf = Buffer.from(b);
    if (aBuf.length !== bBuf.length) return false;
    return timingSafeEqual(aBuf, bBuf);
  } catch {
    return false;
  }
}

function validateBotToken(authHeader: string, altHeader: string | null, devBypass: boolean): boolean {
  if (!BOT_TOKEN) {
    console.warn('[BOT API] Missing bot token env (DISCORD_BOT_TOKEN/NOMARYTH_API_TOKEN)');
  }

  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.replace('Bearer ', '').trim();
  } else if (altHeader) {
    token = String(altHeader).trim();
  }

  if (BOT_TOKEN) {
    return !!token && constantTimeEquals(token, String(BOT_TOKEN));
  }

  if (devBypass) return true;
  return false;
}

export async function GET(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (rateLimiters.bot.isLimited(clientIP)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const authHeader = request.headers.get('authorization') || '';
    const altHeader = request.headers.get('x-bot-token') || request.headers.get('x-api-key');
    const host = request.headers.get('host') || '';
    const devBypass = process.env.NODE_ENV !== 'production'
      && process.env.ALLOW_DEV_BOT === 'true'
      && (host.includes('localhost') || host.startsWith('127.0.0.1'));

    if (!validateBotToken(authHeader, altHeader, devBypass)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      usersSnapshot,
      factionsSnapshot,
      charactersSnapshot,
      contentSnapshot
    ] = await Promise.all([
      adminDb.collection('users').get(),
      adminDb.collection('factions').get(),
      adminDb.collection('characters').doc('showcase').get(),
      adminDb.collection('content').doc('home').get()
    ]);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsers = usersSnapshot.docs.filter(doc => {
      const userData = doc.data();
      const lastSeen = userData.lastSeen ? new Date(userData.lastSeen) : null;
      return lastSeen && lastSeen > thirtyDaysAgo;
    }).length;

    const activeFactions = factionsSnapshot.docs.filter(doc => {
      const factionData = doc.data();
      return factionData.status === 'active' || factionData.status === undefined;
    }).length;

    const characters = charactersSnapshot.exists ? charactersSnapshot.data()?.characters || [] : [];

    const homeContent: Record<string, any> = contentSnapshot.exists
      ? ((contentSnapshot.data() as Record<string, any>) || {})
      : {};

    const statusData = {
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
        documents: Object.keys(homeContent).length
      },
      content: {
        exploreTitle: homeContent.explore_title || 'Explore Nomaryth',
        exploreSubtitle: homeContent.explore_subtitle || 'Descubra um mundo de possibilidades',
        testimonials: homeContent.testimonials || []
      }
    };

    console.log(`[BOT API] Status request from IP: ${clientIP} at ${new Date().toISOString()}`);

    return NextResponse.json(statusData);

  } catch (error) {
    console.error('Error fetching bot status:', error);
    return NextResponse.json({ 
      status: 'error',
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
