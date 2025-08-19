import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { rateLimiters } from '@/lib/rate-limiter';

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || process.env.NOMARYTH_API_TOKEN;

function validateBotToken(authHeader: string): boolean {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.replace('Bearer ', '');
  return token === BOT_TOKEN;
}

export async function GET(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (rateLimiters.bot.isLimited(clientIP)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const authHeader = request.headers.get('authorization');
    if (!validateBotToken(authHeader || '')) {
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
