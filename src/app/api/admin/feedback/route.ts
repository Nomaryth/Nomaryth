import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { rateLimiters, getClientIP, createRateLimitResponse } from '@/lib/rate-limiter';

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    if (rateLimiters.admin.isLimited(ip)) {
      const resetTime = rateLimiters.admin.getResetTime(ip);
      return createRateLimitResponse(resetTime);
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decodedToken;
    
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const adminDoc = await adminDb.collection('admins').doc(decodedToken.uid).get();
    if (!adminDoc.exists) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const feedbacksSnapshot = await adminDb
      .collection('feedback')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    const feedbacks = feedbacksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
    }));

    return NextResponse.json({
      feedbacks,
      total: feedbacksSnapshot.size
    });

  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    if (rateLimiters.admin.isLimited(ip)) {
      const resetTime = rateLimiters.admin.getResetTime(ip);
      return createRateLimitResponse(resetTime);
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decodedToken;
    
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const adminDoc = await adminDb.collection('admins').doc(decodedToken.uid).get();
    if (!adminDoc.exists) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { feedbackId, updates } = await request.json();
    
    if (!feedbackId) {
      return NextResponse.json({ error: 'Feedback ID required' }, { status: 400 });
    }

    const allowedFields = ['status', 'adminResponse', 'assignedTo', 'priority'];
    const filteredUpdates: any = {};
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = value;
      }
    }

    filteredUpdates.updatedAt = new Date();
    filteredUpdates.lastUpdatedBy = decodedToken.uid;

    await adminDb.collection('feedback').doc(feedbackId).update(filteredUpdates);

    const updatedDoc = await adminDb.collection('feedback').doc(feedbackId).get();
    const updatedFeedback = {
      id: updatedDoc.id,
      ...updatedDoc.data(),
      createdAt: updatedDoc.data()?.createdAt?.toDate?.() || updatedDoc.data()?.createdAt,
      updatedAt: updatedDoc.data()?.updatedAt?.toDate?.() || updatedDoc.data()?.updatedAt
    };

    return NextResponse.json({
      success: true,
      feedback: updatedFeedback
    });

  } catch (error) {
    console.error('Error updating feedback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}