import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { isAdmin } from '@/lib/admin-utils';
import { rateLimiters } from '@/lib/rate-limiter';
import { adminAuth } from '@/lib/firebase-admin';

async function getUserIdFromToken(authHeader: string): Promise<string | null> {
  try {
    if (!authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.replace('Bearer ', '');
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

function validateCharacterData(data: any) {
  const errors: string[] = [];
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Nome é obrigatório');
  }
  
  if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
    errors.push('Descrição é obrigatória');
  }
  
  if (!data.image || typeof data.image !== 'string' || data.image.trim().length === 0) {
    errors.push('Imagem é obrigatória');
  }
  
  if (data.name && data.name.length > 50) {
    errors.push('Nome deve ter no máximo 50 caracteres');
  }
  
  if (data.description && data.description.length > 500) {
    errors.push('Descrição deve ter no máximo 500 caracteres');
  }
  
  if (data.role && data.role.length > 100) {
    errors.push('Role deve ter no máximo 100 caracteres');
  }
  
  if (data.faction && data.faction.length > 100) {
    errors.push('Faction deve ter no máximo 100 caracteres');
  }
  
  if (data.level !== undefined) {
    const level = parseInt(data.level);
    if (isNaN(level) || level < 1 || level > 100) {
      errors.push('Nível deve ser um número entre 1 e 100');
    }
  }
  
  if (data.image && !data.image.includes('res.cloudinary.com')) {
    errors.push('Imagem deve ser do Cloudinary (URL deve conter res.cloudinary.com)');
  }
  
  const sanitizedData = {
    name: data.name?.trim().slice(0, 50),
    description: data.description?.trim().slice(0, 500),
    image: data.image?.trim(),
    role: data.role?.trim().slice(0, 100),
    faction: data.faction?.trim().slice(0, 100),
    level: data.level ? parseInt(data.level) : undefined,
    updatedAt: new Date().toISOString(),
    updatedBy: 'admin'
  };
  
  return { errors, sanitizedData };
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      const charactersDoc = await adminDb.collection('characters').doc('showcase').get();
      const characters = charactersDoc.exists ? charactersDoc.data()?.characters || [] : [];
      
      return NextResponse.json({ 
        characters: characters.map((char: any) => ({
          id: char.id,
          name: char.name,
          description: char.description,
          image: char.image,
          role: char.role,
          faction: char.faction,
          level: char.level
        }))
      });
    }
    
    const uid = await getUserIdFromToken(authHeader);
    if (!uid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const adminStatus = await isAdmin(uid);
    if (!adminStatus) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const charactersDoc = await adminDb.collection('characters').doc('showcase').get();
    const data = charactersDoc.exists ? charactersDoc.data() : { characters: [] };
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching characters:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (rateLimiters.admin.isLimited(clientIP)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }
    
    const uid = await getUserIdFromToken(authHeader);
    if (!uid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const adminStatus = await isAdmin(uid);
    if (!adminStatus) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.text();
    if (body.length > 50000) {
      return NextResponse.json({ error: 'Request body too large' }, { status: 413 });
    }
    
    let data;
    try {
      data = JSON.parse(body);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    
    if (!data.characters || !Array.isArray(data.characters)) {
      return NextResponse.json({ error: 'Characters array is required' }, { status: 400 });
    }
    
    if (data.characters.length > 10) {
      return NextResponse.json({ error: 'Maximum 10 characters allowed' }, { status: 400 });
    }
    
    const validatedCharacters = [];
    for (let i = 0; i < data.characters.length; i++) {
      const character = data.characters[i];
      const { errors, sanitizedData } = validateCharacterData(character);
      
      if (errors.length > 0) {
        return NextResponse.json({ 
          error: `Validation errors for character ${i + 1}: ${errors.join(', ')}` 
        }, { status: 400 });
      }
      
      validatedCharacters.push({
        id: character.id || `char_${i + 1}`,
        ...sanitizedData
      });
    }
    
    await adminDb.collection('characters').doc('showcase').set({
      characters: validatedCharacters,
      updatedAt: new Date().toISOString(),
      updatedBy: uid
    });
    
    return NextResponse.json({ 
      success: true, 
      characters: validatedCharacters,
      message: 'Characters updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating characters:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
