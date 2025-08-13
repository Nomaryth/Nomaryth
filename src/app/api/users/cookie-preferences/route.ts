import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
  acceptedAt: Date;
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    const cookiePreferences: CookiePreferences = await req.json();

    // Validate the preferences
    if (typeof cookiePreferences !== 'object' || !cookiePreferences.acceptedAt) {
      return NextResponse.json({ error: 'Invalid cookie preferences data' }, { status: 400 });
    }

    // Ensure necessary cookies are always true
    cookiePreferences.necessary = true;

    // Save to user's profile
    const userRef = adminDb.collection('users').doc(uid);
    await userRef.update({
      cookiePreferences: {
        ...cookiePreferences,
        acceptedAt: new Date(cookiePreferences.acceptedAt),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Cookie preferences saved successfully' 
    });

  } catch (error) {
    console.error('Error saving cookie preferences:', error);
    return NextResponse.json({ 
      error: 'Failed to save cookie preferences' 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    // Get user's cookie preferences
    const userDoc = await adminDb.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const cookiePreferences = userData?.cookiePreferences;

    if (!cookiePreferences) {
      return NextResponse.json({ preferences: null });
    }

    return NextResponse.json({ 
      preferences: cookiePreferences 
    });

  } catch (error) {
    console.error('Error getting cookie preferences:', error);
    return NextResponse.json({ 
      error: 'Failed to get cookie preferences' 
    }, { status: 500 });
  }
}
