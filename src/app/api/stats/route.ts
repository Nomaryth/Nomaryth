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

    let activeFactionsCount = 0;
    let totalUsersCount = 0;
    try {
      // @ts-ignore
      const agg = await adminDb.collection('factions').count().get();
      // @ts-ignore
      activeFactionsCount = typeof agg.data === 'function' ? agg.data().count || 0 : (agg.count || 0);
      if (!Number.isFinite(activeFactionsCount)) activeFactionsCount = 0;
    } catch {
      const snap = await adminDb.collection('factions').get();
      activeFactionsCount = snap.size;
    }

    try {
      // @ts-ignore
      const aggUsers = await adminDb.collection('users').count().get();
      // @ts-ignore
      totalUsersCount = typeof aggUsers.data === 'function' ? aggUsers.data().count || 0 : (aggUsers.count || 0);
      if (!Number.isFinite(totalUsersCount)) totalUsersCount = 0;
    } catch {
      const userSnap = await adminDb.collection('users').get();
      totalUsersCount = userSnap.size;
    }
    
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

    let totalNewsCount = 0;
    try {
      // @ts-ignore
      const aggNews = await adminDb.collection('news').where('published','==',true).count().get();
      // @ts-ignore
      totalNewsCount = typeof aggNews.data === 'function' ? aggNews.data().count || 0 : (aggNews.count || 0);
      if (!Number.isFinite(totalNewsCount)) totalNewsCount = 0;
    } catch {
      const newsSnap = await adminDb.collection('news').where('published','==',true).get();
      totalNewsCount = newsSnap.size;
    }

    const normalized = {
      totalUsers: totalUsersCount,
      activeFactions: activeFactionsCount,
      totalNews: totalNewsCount,
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
    
    const adminDoc = await adminDb.collection('admins').doc(decodedToken.uid).get();
    if (!adminDoc.exists) {
      return NextResponse.json({ error: 'Forbidden: User is not an admin' }, { status: 403 });
    }
    
    const stats = await request.json();
    const { activeFactions: _ignoreActiveFactions, totalUsers: _ignoreTotalUsers, totalNews: _ignoreTotalNews, ...rest } = stats || {};
    const payload = {
      ...rest,
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