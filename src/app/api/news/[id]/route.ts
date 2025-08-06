import { NextRequest, NextResponse } from 'next/server';
import { getNewsById, deleteNews } from '@/lib/news-manager';

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