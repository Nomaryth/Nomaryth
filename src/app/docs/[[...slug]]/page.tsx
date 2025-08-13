import React from 'react';
import ReactMarkdown from 'react-markdown';
import { notFound, redirect } from 'next/navigation';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { adminDb } from '@/lib/firebase-admin';
import { BookX } from 'lucide-react';
import { BreadcrumbSchema } from '@/components/breadcrumb-schema';
import { remarkGithubAlerts, remarkCustomAnchors } from '@/lib/markdown-plugins';
import '@/styles/markdown-alerts.css';

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

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Documentation", url: "/docs" }
  ];

  if (slug && slug.length > 0) {
    const categoryName = slug[0].split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    breadcrumbItems.push({ name: categoryName, url: `/docs/${slug[0]}` });

    if (slug.length > 1) {
      const docName = slug[1].split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      breadcrumbItems.push({ name: docName, url: `/docs/${slug[0]}/${slug[1]}` });
    }
  }

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <article className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:text-accent prose-a:text-accent hover:prose-a:text-accent/80 prose-strong:text-foreground prose-blockquote:border-accent prose-code:text-accent prose-code:before:content-[''] prose-code:after:content-[''] prose-code:bg-muted prose-code:px-1.5 prose-code:py-1 prose-code:rounded-md">
          <h1 className="font-headline text-4xl font-bold mb-4 text-accent">{doc.title}</h1>
          <div className="markdown-content">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm, remarkGithubAlerts, remarkCustomAnchors]} 
              rehypePlugins={[
                rehypeRaw,
                rehypeSlug,
                [rehypeAutolinkHeadings, {
                  behavior: 'wrap',
                  properties: {
                    className: 'heading-anchor'
                  }
                }]
              ]}
              components={{
                h1: ({children, id}) => <h1 id={id} className="text-3xl font-bold mb-4 text-accent group">{children}</h1>,
                h2: ({children, id}) => <h2 id={id} className="text-2xl font-bold mb-3 text-accent group">{children}</h2>,
                h3: ({children, id}) => <h3 id={id} className="text-xl font-bold mb-2 text-accent group">{children}</h3>,
                h4: ({children, id}) => <h4 id={id} className="text-lg font-bold mb-2 text-accent group">{children}</h4>,
                h5: ({children, id}) => <h5 id={id} className="text-base font-bold mb-2 text-accent group">{children}</h5>,
                h6: ({children, id}) => <h6 id={id} className="text-sm font-bold mb-2 text-accent group">{children}</h6>,
                p: ({children}) => <p className="mb-4 text-foreground leading-relaxed">{children}</p>,
                strong: ({children}) => <strong className="font-bold text-foreground">{children}</strong>,
                em: ({children}) => <em className="italic text-foreground">{children}</em>,
                code: ({children}) => <code className="bg-muted px-2 py-1 rounded text-accent font-mono text-sm">{children}</code>,
                pre: ({children}) => <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4 border">{children}</pre>,
                blockquote: ({children, className}) => {
                  if (className?.includes('alert')) {
                    return <div className={className}>{children}</div>;
                  }
                  return <blockquote className="border-l-4 border-accent pl-4 italic text-muted-foreground mb-4 bg-muted/30 py-2 rounded-r">{children}</blockquote>;
                },
                ul: ({children}) => <ul className="list-disc list-inside mb-4 space-y-2 ml-4">{children}</ul>,
                ol: ({children}) => <ol className="list-decimal list-inside mb-4 space-y-2 ml-4">{children}</ol>,
                li: ({children}) => <li className="text-foreground leading-relaxed">{children}</li>,
                a: ({href, children}) => <a href={href} className="text-accent hover:text-accent/80 underline underline-offset-2 transition-colors">{children}</a>,
                table: ({children}) => <div className="overflow-x-auto mb-4"><table className="min-w-full border border-border rounded-lg">{children}</table></div>,
                thead: ({children}) => <thead className="bg-muted">{children}</thead>,
                tbody: ({children}) => <tbody>{children}</tbody>,
                tr: ({children}) => <tr className="border-b border-border">{children}</tr>,
                th: ({children}) => <th className="px-4 py-2 text-left font-semibold text-foreground">{children}</th>,
                td: ({children}) => <td className="px-4 py-2 text-foreground">{children}</td>,
                hr: () => <hr className="my-8 border-border" />,
                div: ({className, children}) => {
                  if (className?.includes('alert')) {
                    return <div className={className}>{children}</div>;
                  }
                  return <div className={className}>{children}</div>;
                }
              }}
            >
              {doc.content}
            </ReactMarkdown>
          </div>
      </article>
    </>
  );
}
