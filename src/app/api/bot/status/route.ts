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
