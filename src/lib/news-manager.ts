import { adminDb } from '@/lib/firebase-admin';
import { createNewsIssue, closeGitHubIssue, getNewsFromGitHub } from '@/lib/github-api';

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  date: Date;
  type: 'update' | 'event' | 'announcement';
  featured: boolean;
  author?: string;
  tags?: string[];
  published: boolean;
  githubIssueId?: number;
  firebaseId: string;
}

export interface FirebaseNewsItem {
  firebaseId: string;
  title: string;
  excerpt: string;
  content?: string;
  date: Date;
  type: 'update' | 'event' | 'announcement';
  featured: boolean;
  author?: string;
  tags?: string[];
  published: boolean;
  githubIssueId?: number;
  createdAt: Date;
  updatedAt: Date;
}

function generateNewsId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `news_${timestamp}_${random}`;
}

export async function migrateNewsFromGitHub(): Promise<NewsItem[]> {
  try {
    const githubNews = await getNewsFromGitHub();
    const migratedNews: NewsItem[] = [];

    for (const news of githubNews) {
      const firebaseId = generateNewsId();
      const now = new Date();

      const firebaseNewsData: FirebaseNewsItem = {
        firebaseId,
        title: news.title,
        excerpt: news.excerpt,
        content: news.content,
        date: news.date,
        type: news.type,
        featured: news.featured,
        author: news.author,
        tags: news.tags,
        published: true,
        githubIssueId: news.id ? parseInt(news.id) : undefined,
        createdAt: now,
        updatedAt: now
      };

      await adminDb.collection('news').doc(firebaseId).set(firebaseNewsData);
      migratedNews.push({ ...news, id: firebaseId, firebaseId });
    }

    return migratedNews;
  } catch (error) {
    console.error('Error migrating news from GitHub:', error);
    return [];
  }
}

export async function testFirebaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const testQuery = adminDb.collection('news').limit(1);
    await testQuery.get();
    return { success: true, message: 'Firebase connection successful' };
  } catch (error) {
    return { success: false, message: 'Firebase connection failed' };
  }
}

export async function getNewsFromFirebaseWithIndex(): Promise<NewsItem[]> {
  try {
    const snapshot = await adminDb.collection('news')
      .where('published', '==', true)
      .orderBy('date', 'desc')
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data() as FirebaseNewsItem;
      return {
        id: data.firebaseId,
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        date: data.date,
        type: data.type,
        featured: data.featured,
        author: data.author,
        tags: data.tags,
        published: data.published,
        githubIssueId: data.githubIssueId,
        firebaseId: data.firebaseId
      };
    });
  } catch (error) {
    console.error('Error fetching news with index:', error);
    return [];
  }
}

export async function getNewsFromFirebase(): Promise<NewsItem[]> {
  try {
    const connectionTest = await testFirebaseConnection();
    
    if (!connectionTest.success) {
      console.error('Firebase connection failed:', connectionTest.message);
      return [];
    }

    const snapshot = await adminDb.collection('news')
      .where('published', '==', true)
      .get();

    if (snapshot.empty) {
      return [];
    }

    const news: NewsItem[] = snapshot.docs.map(doc => {
      const data = doc.data() as FirebaseNewsItem;
      
      let dateObj: Date;
      if (data.date instanceof Date) {
        dateObj = data.date;
      } else if (typeof data.date === 'string') {
        dateObj = new Date(data.date);
      } else if (data.date && typeof data.date === 'object' && (data.date as any)._seconds) {
        dateObj = new Date((data.date as any)._seconds * 1000);
      } else {
        dateObj = new Date();
      }
      
      return {
        id: data.firebaseId,
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        date: dateObj,
        type: data.type,
        featured: data.featured,
        author: data.author,
        tags: data.tags,
        published: data.published,
        githubIssueId: data.githubIssueId,
        firebaseId: data.firebaseId
      };
    });

    return news.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error fetching news from Firebase:', error);
    return [];
  }
}

export async function createNews(newsData: Omit<NewsItem, 'id' | 'date' | 'firebaseId'>): Promise<{ success: boolean; newsId?: string }> {
  try {
    const firebaseId = generateNewsId();
    const now = new Date();

    const githubResult = await createNewsIssue(newsData);
    
    if (!githubResult.success) {
      return { success: false };
    }

    const firebaseNewsData: FirebaseNewsItem = {
      firebaseId,
      title: newsData.title,
      excerpt: newsData.excerpt,
      content: newsData.content,
      date: now,
      type: newsData.type,
      featured: newsData.featured,
      author: newsData.author || 'Nomaryth Team',
      tags: newsData.tags,
      published: true,
      githubIssueId: parseInt(githubResult.newIssueId!),
      createdAt: now,
      updatedAt: now
    };

    await adminDb.collection('news').doc(firebaseId).set(firebaseNewsData);

    return { success: true, newsId: firebaseId };
  } catch (error) {
    console.error('Error creating news:', error);
    return { success: false };
  }
}

export async function updateNews(firebaseId: string, newsData: Partial<NewsItem>): Promise<{ success: boolean }> {
  try {
    const newsDoc = await adminDb.collection('news').doc(firebaseId).get();
    
    if (!newsDoc.exists) {
      return { success: false };
    }

    const currentNews = newsDoc.data() as FirebaseNewsItem;
    const now = new Date();

    if (currentNews.githubIssueId) {
      await closeGitHubIssue(currentNews.githubIssueId);
      
      const githubResult = await createNewsIssue({
        title: newsData.title || currentNews.title,
        excerpt: newsData.excerpt || currentNews.excerpt,
        content: newsData.content || currentNews.content,
        type: newsData.type || currentNews.type,
        featured: newsData.featured ?? currentNews.featured,
        author: newsData.author || currentNews.author,
        tags: newsData.tags || currentNews.tags,
        published: newsData.published ?? currentNews.published
      });

      if (!githubResult.success) {
        return { success: false };
      }

      await adminDb.collection('news').doc(firebaseId).update({
        title: newsData.title || currentNews.title,
        excerpt: newsData.excerpt || currentNews.excerpt,
        content: newsData.content || currentNews.content,
        type: newsData.type || currentNews.type,
        featured: newsData.featured ?? currentNews.featured,
        author: newsData.author || currentNews.author,
        tags: newsData.tags || currentNews.tags,
        published: newsData.published ?? currentNews.published,
        githubIssueId: parseInt(githubResult.newIssueId!),
        updatedAt: now
      });

    } else {
      await adminDb.collection('news').doc(firebaseId).update({
        title: newsData.title || currentNews.title,
        excerpt: newsData.excerpt || currentNews.excerpt,
        content: newsData.content || currentNews.content,
        type: newsData.type || currentNews.type,
        featured: newsData.featured ?? currentNews.featured,
        author: newsData.author || currentNews.author,
        tags: newsData.tags || currentNews.tags,
        published: newsData.published ?? currentNews.published,
        updatedAt: now
      });

    }

    return { success: true };
  } catch (error) {
    console.error('Error updating news:', error);
    return { success: false };
  }
}

export async function deleteNews(firebaseId: string): Promise<{ success: boolean }> {
  try {
    const newsDoc = await adminDb.collection('news').doc(firebaseId).get();
    
    if (!newsDoc.exists) {
      return { success: false };
    }

    const currentNews = newsDoc.data() as FirebaseNewsItem;

    if (currentNews.githubIssueId) {
      await closeGitHubIssue(currentNews.githubIssueId);
    }

    await adminDb.collection('news').doc(firebaseId).delete();

    return { success: true };
  } catch (error) {
    console.error('Error deleting news:', error);
    return { success: false };
  }
}

export async function getNewsById(firebaseId: string): Promise<NewsItem | null> {
  try {
    const doc = await adminDb.collection('news').doc(firebaseId).get();
    
    if (!doc.exists) {
      return null;
    }

    const data = doc.data() as FirebaseNewsItem;
    
    let convertedDate: Date;
    if (data.date instanceof Date) {
      convertedDate = data.date;
    } else if (data.date && typeof data.date === 'object' && (data.date as any)._seconds) {
      convertedDate = new Date((data.date as any)._seconds * 1000);
    } else if (data.date && typeof data.date === 'string') {
      convertedDate = new Date(data.date);
    } else {
      convertedDate = new Date();
    }
    
    return {
      id: data.firebaseId,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      date: convertedDate,
      type: data.type,
      featured: data.featured,
      author: data.author,
      tags: data.tags,
      published: data.published,
      githubIssueId: data.githubIssueId,
      firebaseId: data.firebaseId
    };
  } catch (error) {
    console.error('Error fetching news by ID:', error);
    return null;
  }
} 