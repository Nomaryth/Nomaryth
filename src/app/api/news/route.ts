import { NextRequest, NextResponse } from 'next/server';
import { getNewsFromFirebase, createNews, updateNews } from '@/lib/news-manager';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { rateLimiters, getClientIP, createRateLimitResponse } from '@/lib/rate-limiter';
import { requireCSRFToken } from '@/lib/csrf-protection';

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    
    if (rateLimiters.admin.isLimited(ip)) {
      return createRateLimitResponse(rateLimiters.admin.getResetTime(ip));
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await adminAuth.verifyIdToken(idToken);
    const adminDoc = await adminDb.collection('admins').doc(decoded.uid).get();
    if (!adminDoc.exists) {
      return NextResponse.json({ error: 'Forbidden: User is not an admin' }, { status: 403 });
    }

    const news = await getNewsFromFirebase();
    return NextResponse.json(news);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' && error.code.startsWith('auth/')) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    
    if (rateLimiters.admin.isLimited(ip)) {
      return createRateLimitResponse(rateLimiters.admin.getResetTime(ip));
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await adminAuth.verifyIdToken(idToken);
    const adminDoc = await adminDb.collection('admins').doc(decoded.uid).get();
    if (!adminDoc.exists) {
      return NextResponse.json({ error: 'Forbidden: User is not an admin' }, { status: 403 });
    }

    if (!requireCSRFToken(request, decoded.uid)) {
      return NextResponse.json({ error: 'CSRF token required' }, { status: 403 });
    }

    const body = await request.json();
    const { firebaseId, ...newsContent } = body;

    if (firebaseId) {
      const result = await updateNews(firebaseId, newsContent);
      if (result.success) {
        const usersSnapshot = await adminDb.collection('users').get();
        const batch = adminDb.batch();
        
        usersSnapshot.docs.forEach(userDoc => {
          const notificationRef = userDoc.ref.collection('notifications').doc();
          batch.set(notificationRef, {
            title: 'Notícia Atualizada',
            message: `A notícia "${newsContent.title}" foi atualizada`,
            isRead: false,
            timestamp: new Date(),
            type: 'news',
            newsId: firebaseId,
            newsTitle: newsContent.title
          });
        });
        
        await batch.commit();
        return NextResponse.json({ success: true, message: 'News updated successfully' });
      } else {
        return NextResponse.json({ error: 'Failed to update news' }, { status: 500 });
      }
    } else {
      const result = await createNews(newsContent as { title: string; excerpt: string; content?: string; type: 'update' | 'event' | 'announcement'; featured: boolean; author?: string; tags?: string[]; published: boolean });
      if (result.success && result.newsId) {
        const usersSnapshot = await adminDb.collection('users').get();
        const batch = adminDb.batch();
        
        usersSnapshot.docs.forEach(userDoc => {
          const notificationRef = userDoc.ref.collection('notifications').doc();
          batch.set(notificationRef, {
            title: 'Nova Notícia',
            message: `Uma nova notícia foi publicada: "${newsContent.title}"`,
            isRead: false,
            timestamp: new Date(),
            type: 'news',
            newsId: result.newsId,
            newsTitle: newsContent.title
          });
        });
        
        await batch.commit();
        return NextResponse.json({ success: true, firebaseId: result.newsId });
      } else {
        return NextResponse.json({ error: 'Failed to create news' }, { status: 500 });
      }
    }
  } catch {
    return NextResponse.json({ error: 'Failed to process news' }, { status: 500 });
  }
} 