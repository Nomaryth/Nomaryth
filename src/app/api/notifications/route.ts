import { type NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const notificationsRef = adminDb.collection('users').doc(uid).collection('notifications');
    const readNotificationsQuery = notificationsRef.where('isRead', '==', true);
    
    const snapshot = await readNotificationsQuery.get();

    if (snapshot.empty) {
        return NextResponse.json({ message: 'No read notifications to delete.' });
    }

    const batch = adminDb.batch();
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });

    await batch.commit();

    return NextResponse.json({ message: `${snapshot.size} notifications cleared.` });

  } catch (error: any) {
    console.error('Error in DELETE /api/notifications:', error);
    if (error.code?.startsWith('auth/')) {
        return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
