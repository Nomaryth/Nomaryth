import { type NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';


async function isUserAdmin(uid: string): Promise<boolean> {
  try {
    if (!adminDb) {
      console.warn("Firebase Admin DB not available");
      return false;
    }

    const adminDoc = await adminDb.collection('admins').doc(uid).get();
    const data = adminDoc.data();
    return adminDoc.exists && Boolean(data);
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    
    const isAdmin = await isUserAdmin(decodedToken.uid);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: User is not an admin' },
        { status: 403 }
      );
    }

    
    const { title, message, target } = await req.json();

    if (!title || !message || !target) {
      return NextResponse.json(
        { error: 'Missing required fields: title, message, target' },
        { status: 400 }
      );
    }
    
    const notificationPayload = {
        title,
        message,
        type: 'system',
        isRead: false,
        timestamp: FieldValue.serverTimestamp(),
    };

    
    if (target === 'global') {
        
        const usersSnapshot = await adminDb.collection('users').get();
        
        if (usersSnapshot.empty) {
            return NextResponse.json({ message: 'No users to notify.' });
        }
        
        const batch = adminDb.batch();
        usersSnapshot.docs.forEach(userDoc => {
            const userNotifsRef = userDoc.ref.collection('notifications').doc();
            batch.set(userNotifsRef, notificationPayload);
        });
        
        await batch.commit();
        
        return NextResponse.json({ message: `Announcement sent to ${usersSnapshot.size} users.` });

    } else {
        
        const userDocRef = adminDb.collection('users').doc(target);
        const userNotifsRef = userDocRef.collection('notifications').doc();
        
        await userNotifsRef.set(notificationPayload);

        return NextResponse.json({ message: `Announcement sent to user ${target}.` });
    }

  } catch (error: any) {
    console.error('Error in POST /api/admin/announcements:', error);
    if (error.code?.startsWith('auth/')) {
        return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
