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

    const factionsSnapshot = await adminDb.collection('factions').get();
    
    const factions = factionsSnapshot.docs
      .filter(doc => {
        const factionData = doc.data();
        return factionData.status === 'active' || factionData.status === undefined;
      })
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'Sem nome',
          description: data.description || 'Sem descrição',
          leader: data.leader || 'Líder não definido',
          memberCount: data.memberCount || 0,
          createdAt: data.createdAt || null,
          status: data.status || 'active',
        };
      })
      .sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0));

    console.log(`[BOT API] Factions request from IP: ${clientIP} at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      count: factions.length,
      factions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching factions:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
