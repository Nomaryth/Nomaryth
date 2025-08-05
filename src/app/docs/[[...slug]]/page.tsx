import React from 'react';
import ReactMarkdown from 'react-markdown';
import { notFound, redirect } from 'next/navigation';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { adminDb } from '@/lib/firebase-admin';
import { BookX } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Doc {
  slug: string;
  title: string;
  content: string;
}

interface Category {
  categorySlug: string;
  categoryTitle: string;
  documents: Doc[];
}

const DOCS_COLLECTION = 'docs';
const DOCS_DOCUMENT = 'content';

async function getDocsFromFirestore(): Promise<Category[]> {
  try {
    
    if (!adminDb) {
      console.warn("Firebase Admin DB not available");
      return [];
    }

    const docRef = adminDb.collection(DOCS_COLLECTION).doc(DOCS_DOCUMENT);
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
        const data = docSnap.data();
        const content = data?.content;
        return Array.isArray(content) ? content : [];
    }
    return [];
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Could not read docs from Firestore", error);
    }
    return [];
  }
}

async function getAllDocs(): Promise<Doc[]> {
  const docsData = await getDocsFromFirestore();
  
  if (!Array.isArray(docsData)) {
    return [];
  }
  
  return docsData.flatMap(category => 
    category.documents.map(doc => ({
      ...doc,
      slug: `${category.categorySlug}/${doc.slug}`
    }))
  );
}

async function getDocBySlug(slug: string): Promise<Doc | undefined> {
  const allDocs = await getAllDocs();
  return allDocs.find(doc => doc.slug === slug);
}


export default async function DocPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const slugString = slug?.join('/');
  
  if (!slugString) {
    const docsData = await getDocsFromFirestore();
    const firstCategory = docsData?.[0];
    const firstDoc = firstCategory?.documents?.[0];

    if (firstDoc && firstCategory) {
      redirect(`/docs/${firstCategory.categorySlug}/${firstDoc.slug}`);
    }

    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
            <BookX className="w-16 h-16 mb-4 text-accent" />
            <h1 className="text-2xl font-bold font-headline text-foreground">Documentation Coming Soon</h1>
            <p>There are currently no documents to display. Please check back later.</p>
        </div>
    );
  }

  const doc = await getDocBySlug(slugString);

  if (!doc) {
    notFound();
  }

  return (
    <article className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:text-accent prose-a:text-accent hover:prose-a:text-accent/80 prose-strong:text-foreground prose-blockquote:border-accent prose-code:text-accent prose-code:before:content-[''] prose-code:after:content-[''] prose-code:bg-muted prose-code:px-1.5 prose-code:py-1 prose-code:rounded-md">
        <h1 className="font-headline text-4xl font-bold mb-4 text-accent">{doc.title}</h1>
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{doc.content}</ReactMarkdown>
    </article>
  );
}
