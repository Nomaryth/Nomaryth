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

    const charactersDoc = await adminDb.collection('characters').doc('showcase').get();
    
    const characters = charactersDoc.exists ? charactersDoc.data()?.characters || [] : [];

    const publicCharacters = characters.map((char: any) => ({
      id: char.id,
      name: char.name,
      description: char.description,
      role: char.role,
      faction: char.faction,
      level: char.level,
      image: char.image
    }));

    console.log(`[BOT API] Characters request from IP: ${clientIP} at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      count: publicCharacters.length,
      characters: publicCharacters,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching characters:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
