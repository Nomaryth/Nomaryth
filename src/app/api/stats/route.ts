import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const statsDoc = await adminDb.collection('stats').doc('world').get();
    
    if (!statsDoc.exists) {
      return NextResponse.json({
        totalUsers: 0,
        activeFactions: 0,
        totalNews: 0,
        worldProgress: 0
      });
    }
    
    return NextResponse.json(statsDoc.data());
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const stats = await request.json();
    
    await adminDb.collection('stats').doc('world').set(stats, { merge: true });
    
    return NextResponse.json({ success: true, message: 'Stats updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update stats' }, { status: 500 });
  }
} 