import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const revalidate = 60;

export async function GET() {
  try {
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
        onlineTime: '0 hrs',
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
    };
    return NextResponse.json(
      normalized,
      { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' } }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500, headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' } }
    );
  }
}