import { adminDb } from './firebase-admin';
import type { WorldStats } from './admin-utils';

export async function updateWorldStats(stats: Partial<WorldStats>): Promise<void> {
  const docRef = adminDb.collection('worldStats').doc('current');
  await docRef.set({
    ...stats,
    lastUpdated: new Date().toISOString()
  }, { merge: true });
}

export async function getWorldStats(): Promise<WorldStats | null> {
  try {
    const doc = await adminDb.collection('worldStats').doc('current').get();
    return doc.exists ? doc.data() as WorldStats : null;
  } catch (error) {
    console.error('Error fetching world stats:', error);
    return null;
  }
}

export async function initializeWorldStats(): Promise<void> {
  const existingStats = await getWorldStats();
  if (!existingStats) {
    await updateWorldStats({
      id: 'current',
      explorers: 1250,
      documents: 89,
      locations: 156,
      events: 42,
      monthlyGrowth: 23,
      targetAchieved: 78,
      onlineTime: '1.2k hrs',
      lastUpdated: new Date().toISOString()
    });
  }
} 