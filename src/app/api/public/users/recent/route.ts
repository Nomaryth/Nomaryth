import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const revalidate = 60;

export async function GET() {
  try {
    const snap = await adminDb
      .collection('users')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();

    const users = snap.docs.map((doc) => {
      const data = doc.data() as any;
      return {
        photoURL: typeof (data.photoURL ?? data.photoUrl) === 'string' ? (data.photoURL ?? data.photoUrl) : null,
      };
    });

    return NextResponse.json(
      { users },
      { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' } }
    );
  } catch {
    return NextResponse.json(
      { users: [] },
      { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' } }
    );
  }
}


