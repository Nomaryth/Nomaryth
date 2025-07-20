
import { type NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

const DOCS_COLLECTION = 'system';
const DOCS_DOCUMENT = 'docs';

// Helper to read the docs data from Firestore
async function getDocsData() {
  const docRef = adminDb.collection(DOCS_COLLECTION).doc(DOCS_DOCUMENT);
  const docSnap = await docRef.get();

  if (docSnap.exists) {
    return docSnap.data()?.content || [];
  } else {
    // If the document doesn't exist, create it with a default structure
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
}

// Helper to write to the docs data to Firestore
async function saveDocsData(data: any) {
  const docRef = adminDb.collection(DOCS_COLLECTION).doc(DOCS_DOCUMENT);
  await docRef.set({ content: data });
}

// GET handler to retrieve docs data
export async function GET(req: NextRequest) {
  try {
    const data = await getDocsData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to read docs data from Firestore:', error);
    return NextResponse.json({ error: 'Failed to read documentation data' }, { status: 500 });
  }
}

// POST handler to update docs data
export async function POST(req: NextRequest) {
  try {
    // Initialize Firebase Admin to verify the user's token
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }
    
    const idToken = authHeader.split('Bearer ')[1];

    if(!idToken) {
       return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }
    
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Check if the user is an admin
    if (!decodedToken.admin) {
      return NextResponse.json({ error: 'Forbidden: User is not an admin' }, { status: 403 });
    }
    
    // User is an admin, proceed to update the document in Firestore
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
