import { NextRequest, NextResponse } from 'next/server';
import { getNewsById, deleteNews } from '@/lib/news-manager';
import { adminAuth } from '@/lib/firebase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const news = await getNewsById(id);
    
    if (!news) {
      return NextResponse.json({ error: 'News not found' }, { status: 404 });
    }
    
    return NextResponse.json(news);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    await adminAuth.verifyIdToken(idToken);

    const { id } = await params;
    const result = await deleteNews(id);
    
    if (result.success) {
      return NextResponse.json({ success: true, message: 'Notícia deletada com sucesso' });
    } else {
      return NextResponse.json({ error: 'Falha ao deletar notícia' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Falha ao deletar notícia' }, { status: 500 });
  }
} 