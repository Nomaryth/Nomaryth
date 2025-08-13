import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

const docsRateLimit = new Map<string, { count: number; expires: number }>()

function isDocsRateLimited(ip: string): boolean {
  const now = Date.now()
  let entry = docsRateLimit.get(ip)
  if (!entry || entry.expires < now) {
    entry = { count: 1, expires: now + 60000 }
    docsRateLimit.set(ip, entry)
    return false
  }
  entry.count++
  return entry.count > 30
}

setInterval(() => {
  const now = Date.now()
  for (const [key, value] of docsRateLimit.entries()) {
    if (value.expires < now) docsRateLimit.delete(key)
  }
}, 120000)

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               req.headers.get('x-real-ip') || 
               req.headers.get('cf-connecting-ip') || 
               'unknown'
    
    if (isDocsRateLimited(ip)) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
    }

    const docRef = adminDb.collection('docs').doc('content');
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      const data = docSnap.data();
      const content = data?.content;
      return NextResponse.json(Array.isArray(content) ? content : []);
    }

    return NextResponse.json([]);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch docs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               req.headers.get('x-real-ip') || 
               req.headers.get('cf-connecting-ip') || 
               'unknown'
    
    if (isDocsRateLimited(ip)) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await adminAuth.verifyIdToken(idToken);
    const adminDoc = await adminDb.collection('admins').doc(decoded.uid).get();
    
    if (!adminDoc.exists) {
      return NextResponse.json({ error: 'Forbidden: User is not an admin' }, { status: 403 });
    }

    const docsData = await req.json();
    
    await adminDb.collection('docs').doc('content').set({
      content: docsData,
      updatedAt: new Date(),
      updatedBy: decoded.uid
    });

    return NextResponse.json({ success: true, message: 'Documentation updated successfully' });
  } catch {
    return NextResponse.json({ error: 'Failed to update documentation' }, { status: 500 });
  }
}
