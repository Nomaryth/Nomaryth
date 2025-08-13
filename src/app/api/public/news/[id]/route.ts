import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getNewsFromGitHub } from '@/lib/github-api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doc = await adminDb.collection('news').doc(id).get();
    let data: any | null = null;
    if (doc.exists) {
      data = doc.data();
    } else {
      const snap = await adminDb.collection('news').where('firebaseId', '==', id).limit(1).get();
      if (!snap.empty) {
        data = snap.docs[0].data();
      }
    }

    if (!data || data.published === false) {
      const gh = await getNewsFromGitHub();
      const byId = gh.find(n => n.githubIssueId?.toString() === id || n.id === id);
      if (byId && byId.published) {
        return NextResponse.json({
          id: byId.githubIssueId?.toString?.() || byId.id,
          title: byId.title,
          excerpt: byId.excerpt,
          content: byId.content || '',
          date: (byId.date instanceof Date ? byId.date.toISOString() : new Date(byId.date).toISOString()),
          type: byId.type,
          featured: byId.featured,
          author: byId.author || 'GitHub',
          tags: byId.tags || [],
          published: byId.published,
          githubIssueId: byId.githubIssueId ?? null,
        });
      }
      return NextResponse.json({ error: 'News not found' }, { status: 404 });
    }

    const payload = {
      id: data.firebaseId || id,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content || '',
      date: data.date?._seconds ? new Date(data.date._seconds * 1000).toISOString() : (typeof data.date === 'string' ? data.date : new Date().toISOString()),
      type: data.type,
      featured: Boolean(data.featured),
      author: data.author || 'Nomaryth Team',
      tags: Array.isArray(data.tags) ? data.tags : [],
      published: Boolean(data.published),
      githubIssueId: data.githubIssueId ?? null,
    };

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}


