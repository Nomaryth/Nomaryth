import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getNewsFromGitHub } from '@/lib/github-api';

export async function GET() {
  try {
    // Evita necessidade de índice composto: filtra published e ordena em memória
    const snapshot = await adminDb
      .collection('news')
      .where('published', '==', true)
      .limit(50)
      .get();

    const firebaseItems = snapshot.docs.map((doc) => {
      const d = doc.data() as any;
      return {
        id: d.firebaseId || doc.id,
        title: d.title,
        excerpt: d.excerpt,
        date: d.date?._seconds ? new Date(d.date._seconds * 1000).toISOString() : (typeof d.date === 'string' ? d.date : new Date().toISOString()),
        type: d.type,
        featured: Boolean(d.featured),
        author: d.author || 'Nomaryth Team',
        tags: Array.isArray(d.tags) ? d.tags : [],
        published: Boolean(d.published),
        githubIssueId: d.githubIssueId ?? null,
      };
    });

    const githubItemsRaw = await getNewsFromGitHub();
    const githubItems = (githubItemsRaw || []).map((n) => ({
      id: n.githubIssueId?.toString?.() || n.id,
      title: n.title,
      excerpt: n.excerpt,
      date: (n.date instanceof Date ? n.date.toISOString() : new Date(n.date).toISOString()),
      type: n.type,
      featured: n.featured,
      author: n.author || 'GitHub',
      tags: n.tags || [],
      published: n.published,
      githubIssueId: (n as any).githubIssueId ?? null,
    }));

    // Deduplicação preferindo Firebase quando ele já aponta para um GitHub issue
    const firebaseGhIds = new Set<string>(
      firebaseItems
        .map(it => (it.githubIssueId != null ? String(it.githubIssueId) : null))
        .filter((v): v is string => Boolean(v))
    );

    const prunedGithub = githubItems.filter(it => {
      const ghId = it.githubIssueId != null ? String(it.githubIssueId) : null;
      if (ghId && firebaseGhIds.has(ghId)) return false;
      return true;
    });

    // Deduplicação adicional por título normalizado (para casos sem link explícito)
    const normalize = (s: string) => s.trim().toLowerCase();
    const seenTitles = new Set<string>();
    const merged = [...firebaseItems, ...prunedGithub]
      .filter(i => i.published !== false)
      .filter(item => {
        const key = normalize(item.title);
        if (seenTitles.has(key)) return false;
        seenTitles.add(key);
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 25);

    return NextResponse.json(merged);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}


