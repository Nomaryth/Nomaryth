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

    const homeContentDoc = await adminDb.collection('content').doc('home').get();
    
    const homeContent = homeContentDoc.exists ? homeContentDoc.data() || {} : {};

    const publicContent = {
      explore: {
        title: homeContent.explore_title || 'Explore Nomaryth',
        subtitle: homeContent.explore_subtitle || 'Descubra um mundo de possibilidades'
      },
      testimonials: homeContent.testimonials || [],
      lastUpdated: homeContent.updatedAt || null
    };

    console.log(`[BOT API] Content request from IP: ${clientIP} at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      content: publicContent,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
