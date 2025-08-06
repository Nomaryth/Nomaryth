'use client';

import Link from 'next/link';
import { ArrowRight, ExternalLink, BookOpen, Users, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RelatedDoc {
  title: string;
  href: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface Category {
  categorySlug: string;
  categoryTitle: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  documents: {
    slug: string;
    title: string;
    content: string;
  }[];
}

interface ContextualNavigationProps {
  currentDoc: string;
  docsData: Category[];
  className?: string;
}

export function ContextualNavigation({ currentDoc, docsData, className }: ContextualNavigationProps) {
  const generateRelatedDocs = (): RelatedDoc[] => {
    const relatedDocs: RelatedDoc[] = [];
    
    const currentPath = currentDoc.replace('/docs/', '');
    const pathParts = currentPath.split('/');
    const currentCategory = pathParts[0];
    const currentDocSlug = pathParts[1];
    
    if (!currentCategory || !currentDocSlug) {
      docsData.forEach(category => {
        category.documents.slice(0, 3 - relatedDocs.length).forEach(doc => {
          relatedDocs.push({
            title: doc.title,
            href: `/docs/${category.categorySlug}/${doc.slug}`,
            description: generateDescription(doc.content),
            category: category.categoryTitle,
            difficulty: getDifficultyByCategory(category)
          });
        });
      });
      return relatedDocs.slice(0, 3);
    }
    
    const currentCategoryData = docsData.find(cat => cat.categorySlug === currentCategory);
    
    if (currentCategoryData) {
      currentCategoryData.documents.forEach(doc => {
        if (doc.slug !== currentDocSlug) {
          relatedDocs.push({
            title: doc.title,
            href: `/docs/${currentCategoryData.categorySlug}/${doc.slug}`,
            description: generateDescription(doc.content),
            category: currentCategoryData.categoryTitle,
            difficulty: getDifficultyByCategory(currentCategoryData)
          });
        }
      });
    }
    
    docsData.forEach(category => {
      if (category.categorySlug !== currentCategory && relatedDocs.length < 3) {
        const availableDocs = category.documents.filter(doc => 
          !relatedDocs.some(related => related.href.includes(doc.slug))
        );
        
        availableDocs.slice(0, 3 - relatedDocs.length).forEach(doc => {
          relatedDocs.push({
            title: doc.title,
            href: `/docs/${category.categorySlug}/${doc.slug}`,
            description: generateDescription(doc.content),
            category: category.categoryTitle,
            difficulty: getDifficultyByCategory(category)
          });
        });
      }
    });
    
    return relatedDocs.slice(0, 3);
  };
  
  const generateDescription = (content: string): string => {
    const plainText = content
      .replace(/[#*`]/g, '')
      .replace(/\n+/g, ' ')
      .trim();
    
    return plainText.length > 100 
      ? plainText.substring(0, 100) + '...'
      : plainText;
  };
  
  const getDifficultyByCategory = (category: Category): 'beginner' | 'intermediate' | 'advanced' => {
    return category.difficulty || 'intermediate';
  };
  
  const relatedDocs = generateRelatedDocs();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-accent" />
        <h3 className="text-lg font-semibold">Continue Explorando</h3>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {relatedDocs.map((doc, index) => (
          <Link
            key={doc.href}
            href={doc.href}
            className="group block p-4 rounded-lg border border-border hover:border-accent transition-all duration-200 hover:shadow-md"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground group-hover:text-accent transition-colors">
                    {doc.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {doc.description}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {doc.category}
                </span>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  getDifficultyColor(doc.difficulty)
                )}>
                  {doc.difficulty}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-center pt-4">
        <Link
          href="/docs"
          className="flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors"
        >
          <Users className="h-4 w-4" />
          Ver toda a documentação
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
} 