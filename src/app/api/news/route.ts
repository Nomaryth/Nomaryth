import { NextRequest, NextResponse } from 'next/server';
import { getNewsFromFirebase, createNews, updateNews } from '@/lib/news-manager';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const news = await getNewsFromFirebase();
    return NextResponse.json(news);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const newsData = await request.json();
    const { firebaseId, ...newsContent } = newsData;

    if (firebaseId) {
      const result = await updateNews(firebaseId, newsContent);
      if (result.success) {
        const usersSnapshot = await adminDb.collection('users').get();
        const batch = adminDb.batch();
        
        usersSnapshot.docs.forEach(userDoc => {
          const notificationRef = userDoc.ref.collection('notifications').doc();
          batch.set(notificationRef, {
            title: 'Notícia Atualizada',
            message: `A notícia "${newsData.title}" foi atualizada`,
            isRead: false,
            timestamp: new Date(),
            type: 'news',
            newsId: firebaseId,
            newsTitle: newsData.title
          });
        });
        
        await batch.commit();
        return NextResponse.json({ success: true, message: 'News updated successfully' });
      } else {
        return NextResponse.json({ error: 'Failed to update news' }, { status: 500 });
      }
    } else {
      const result = await createNews(newsContent);
      if (result.success && result.newsId) {
        const usersSnapshot = await adminDb.collection('users').get();
        const batch = adminDb.batch();
        
        usersSnapshot.docs.forEach(userDoc => {
          const notificationRef = userDoc.ref.collection('notifications').doc();
          batch.set(notificationRef, {
            title: 'Nova Notícia',
            message: `Uma nova notícia foi publicada: "${newsData.title}"`,
            isRead: false,
            timestamp: new Date(),
            type: 'news',
            newsId: result.newsId,
            newsTitle: newsData.title
          });
        });
        
        await batch.commit();
        return NextResponse.json({ success: true, firebaseId: result.newsId });
      } else {
        return NextResponse.json({ error: 'Failed to create news' }, { status: 500 });
      }
    }
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to process news' }, { status: 500 });
  }
} 