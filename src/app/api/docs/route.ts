import { type NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

const DOCS_COLLECTION = 'docs';
const DOCS_DOCUMENT = 'content';

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

async function getDocsData() {
  try {
    
    if (!adminDb) {
      console.warn("Firebase Admin DB not available");
      return [];
    }

    const docRef = adminDb.collection(DOCS_COLLECTION).doc(DOCS_DOCUMENT);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return docSnap.data()?.content || [];
    } else {
      
      const defaultData = [
        {
          categorySlug: "introduction",
          categoryTitle: "Introduction",
          documents: [
            {
              slug: "welcome-to-nomaryth",
              title: "Welcome to Nomaryth",
              content: "# A World of Magic and Conflict\n\nWelcome to the official documentation for the world of Nomaryth. Here you will find information about its history, its inhabitants, and the forces that shape this universe."
            }
          ]
        }
      ];
      await docRef.set({ content: defaultData });
      return defaultData;
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error reading docs data:", error);
    }
    return [];
  }
}


async function saveDocsData(data: any) {
  const docRef = adminDb.collection(DOCS_COLLECTION).doc(DOCS_DOCUMENT);
  await docRef.set({ content: data });
}

export async function GET(req: NextRequest) {
  try {
    const data = await getDocsData();
    return NextResponse.json(data);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to read docs data from Firestore:', error);
    }
    return NextResponse.json({ error: 'Failed to read documentation data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }
    
    const idToken = authHeader.split('Bearer ')[1];

    if(!idToken) {
       return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }
    
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    const isAdmin = await isUserAdmin(decodedToken.uid);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: User is not an admin' }, { status: 403 });
    }
    
    const newData = await req.json();
    await saveDocsData(newData);
    
    return NextResponse.json({ message: 'Documentation updated successfully' });

  } catch (error: any) {
    console.error('Error in POST /api/docs:', error);
    if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error' || error.code === 'auth/id-token-revoked') {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}
