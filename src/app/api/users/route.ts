import { type NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';


async function isUserAdmin(uid: string): Promise<boolean> {
  try {
    if (!adminDb) {
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


export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
        }
        
        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        
        
        const isAdmin = await isUserAdmin(decodedToken.uid);
        if (!isAdmin) {
            return NextResponse.json({ error: 'Forbidden: User is not an admin' }, { status: 403 });
        }

        
        const usersSnapshot = await adminDb.collection('users').get();
        
        const users = usersSnapshot.docs.map(doc => {
            const data = doc.data();
            
            return {
                uid: doc.id,
                displayName: data.displayName || 'Unnamed User',
                photoURL: data.photoURL || '',
            };
        });
        
        return NextResponse.json(users);
        
    } catch (error) {
        console.error('Failed to read users from Firestore:', error);
        return NextResponse.json({ error: 'Failed to read user data' }, { status: 500 });
    }
}
