import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await adminAuth.verifyIdToken(idToken);
    const adminDoc = await adminDb.collection('admins').doc(decoded.uid).get();
    if (!adminDoc.exists) {
      return NextResponse.json({ error: 'Forbidden: User is not an admin' }, { status: 403 });
    }

    const statsDoc = await adminDb.collection('stats').doc('world').get();
    
    if (!statsDoc.exists) {
      return NextResponse.json({
        totalUsers: 0,
        activeFactions: 0,
        totalNews: 0,
        worldProgress: 0,
        monthlyGrowth: 0,
        targetAchieved: 0,
        onlineTime: '0 hrs'
      });
    }
    
    const data = statsDoc.data() as any;

    const toNumber = (v: any, fallback = 0) => {
      const n = typeof v === 'string' ? Number(v) : v;
      return Number.isFinite(n) ? n : fallback;
    };

    const normalized = {
      totalUsers: toNumber(data.totalUsers ?? data.explorers, 0),
      activeFactions: toNumber(data.activeFactions ?? data.documents, 0),
      totalNews: toNumber(data.totalNews ?? data.locations, 0),
      worldProgress: toNumber(data.worldProgress ?? data.events, 0),
      monthlyGrowth: toNumber(data.monthlyGrowth, 0),
      targetAchieved: toNumber(data.targetAchieved, 0),
      onlineTime: typeof data.onlineTime === 'string' ? data.onlineTime : '0 hrs',
      lastUpdated: data.lastUpdated ?? null,
    };
    return NextResponse.json(normalized);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // Check if user is admin
    const adminDoc = await adminDb.collection('admins').doc(decodedToken.uid).get();
    if (!adminDoc.exists) {
      return NextResponse.json({ error: 'Forbidden: User is not an admin' }, { status: 403 });
    }
    
    const stats = await request.json();
    const payload = {
      ...stats,
      lastUpdated: new Date().toISOString(),
    };
    await adminDb.collection('stats').doc('world').set(payload, { merge: true });
    
    return NextResponse.json({ success: true, message: 'Stats updated successfully' });
  } catch (error: any) {
    console.error('Error updating stats:', error);
    if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error' || error.code === 'auth/id-token-revoked') {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to update stats' }, { status: 500 });
  }
} 