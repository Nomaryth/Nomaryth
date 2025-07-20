
import { type NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

// GET handler to retrieve all users for search
export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
        }
        const idToken = authHeader.split('Bearer ')[1];
        await adminAuth.verifyIdToken(idToken);
    } catch (error) {
        return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    try {
        // Query users collection, filtering out admins.
        const usersSnapshot = await adminDb.collection('users').where('role', '!=', 'admin').get();
        
        const users = usersSnapshot.docs.map(doc => {
            const data = doc.data();
            // Return only public-safe data
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
