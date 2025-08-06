'use client';

import Link from "next/link";
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  BookOpen, 
  Swords, 
  Star, 
  Map, 
  Users, 
  Zap, 
  Shield, 
  Heart,
  CheckCircle,
  Circle,
  Clock,
  TrendingUp,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Keyboard,
  MousePointer,
  Zap as Lightning
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '@/context/i18n-context';

interface Doc {
  slug: string;
  title: string;
  content: string;
}

interface Category {
  categorySlug: string;
  categoryTitle: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  documents: Doc[];
}

interface DocsSidebarProps {
  docsData: Category[];
  loading: boolean;
}

const getCategoryIcon = (categorySlug: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'introduction': <BookOpen className="h-4 w-4" />,
    'core-concepts': <Swords className="h-4 w-4" />,
    'basic-topics': <Star className="h-4 w-4" />,
    'advanced-topics': <Zap className="h-4 w-4" />,
    'expert-topics': <Shield className="h-4 w-4" />,
    'factions': <Users className="h-4 w-4" />,
    'locations': <Map className="h-4 w-4" />,
    'magic': <Zap className="h-4 w-4" />,
    'lore': <Heart className="h-4 w-4" />
  };
  
  return iconMap[categorySlug] || <BookOpen className="h-4 w-4" />;
};

const getDifficultyByCategory = (category: Category): 'beginner' | 'intermediate' | 'advanced' => {
  return category.difficulty || 'intermediate';
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800';
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
    case 'advanced':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-800';
  }
};

const ProgressIndicator = ({ isRead }: { isRead: boolean }) => (
  <div className="flex items-center gap-2">
    {isRead ? (
      <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
    ) : (
      <Circle className="h-3 w-3 text-muted-foreground" />
    )}
  </div>
);

export function DocsSidebar({ docsData, loading }: DocsSidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [readDocs, setReadDocs] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'difficulty' | 'progress'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [lastInteraction, setLastInteraction] = useState<'search' | 'filter' | 'sort' | null>(null);

  useEffect(() => {
    const savedReadDocs = localStorage.getItem('nomaryth-read-docs');
    if (savedReadDocs) {
      try {
        const parsed = JSON.parse(savedReadDocs);
        setReadDocs(new Set(parsed));
      } catch (error) {
        console.error('Error parsing read docs:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (pathname.startsWith('/docs/') && pathname !== '/docs') {
      const docPath = pathname.replace('/docs/', '');
      setReadDocs(prev => {
        const newSet = new Set(prev);
        newSet.add(docPath);
        localStorage.setItem('nomaryth-read-docs', JSON.stringify([...newSet]));
        return newSet;
      });
    }
  }, [pathname]);

  const calculateProgress = () => {
    if (!docsData.length) return 0;
    
    const totalDocs = docsData.reduce((acc, cat) => acc + cat.documents.length, 0);
    const readCount = docsData.reduce((acc, cat) => {
      return acc + cat.documents.filter(doc => {
        const docPath = `${cat.categorySlug}/${doc.slug}`;
        return readDocs.has(docPath);
      }).length;
    }, 0);
    
    return totalDocs > 0 ? Math.round((readCount / totalDocs) * 100) : 0;
  };

  const progress = calculateProgress();

  const handleKeyboardShortcuts = useCallback((event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      const searchInput = document.querySelector('input[placeholder*="Buscar documentos"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
        setLastInteraction('search');
      }
    }
    
    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
      event.preventDefault();
      setFilterDifficulty(prev => 
        prev === 'all' ? 'beginner' : 
        prev === 'beginner' ? 'intermediate' : 
        prev === 'intermediate' ? 'advanced' : 'all'
      );
      setLastInteraction('filter');
    }
    
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
      setLastInteraction('sort');
    }
    
    if (event.key === 'Escape') {
      setSearchQuery('');
      setFilterDifficulty('all');
      setShowKeyboardShortcuts(false);
    }
    
    if (event.key === '?') {
      event.preventDefault();
      setShowKeyboardShortcuts(prev => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardShortcuts);
    return () => document.removeEventListener('keydown', handleKeyboardShortcuts);
  }, [handleKeyboardShortcuts]);

  useEffect(() => {
    if (lastInteraction) {
      const timer = setTimeout(() => setLastInteraction(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastInteraction]);

  const filteredAndSortedData = docsData
    .filter(category => {
      if (filterDifficulty !== 'all') {
        const categoryDifficulty = getDifficultyByCategory(category);
        if (categoryDifficulty !== filterDifficulty) return false;
      }
      
      if (searchQuery) {
        const matchesCategory = category.categoryTitle.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDocs = category.documents.some(doc => 
          doc.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (!matchesCategory && !matchesDocs) return false;
      }
      
      return true;
    })
    .map(category => ({
      ...category,
      documents: category.documents.filter(doc => {
        if (searchQuery) {
          return doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 category.categoryTitle.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
      })
    }))
    .filter(category => category.documents.length > 0)
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.categoryTitle.localeCompare(b.categoryTitle);
          break;
        case 'difficulty':
          const aDifficulty = getDifficultyByCategory(a);
          const bDifficulty = getDifficultyByCategory(b);
          const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
          comparison = difficultyOrder[aDifficulty] - difficultyOrder[bDifficulty];
          break;
        case 'progress':
          const aProgress = a.documents.filter((doc: Doc) => {
            const docPath = `${a.categorySlug}/${doc.slug}`;
            return readDocs.has(docPath);
          }).length / a.documents.length;
          const bProgress = b.documents.filter((doc: Doc) => {
            const docPath = `${b.categorySlug}/${doc.slug}`;
            return readDocs.has(docPath);
          }).length / b.documents.length;
          comparison = aProgress - bProgress;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-6 bg-muted rounded animate-pulse" />
            <div className="space-y-1">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-4 bg-muted rounded animate-pulse ml-4" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4 w-full">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-muted-foreground mb-2">{t('docs.sidebar.title')}</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <BookOpen className="h-3 w-3" />
          <span>{docsData.reduce((acc, cat) => acc + cat.documents.length, 0)} {t('docs.sidebar.documents_count')}</span>
        </div>
      </div>

       <div className="space-y-3 mb-4">
         <div className="relative">
           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input
             placeholder={t('docs.sidebar.search_placeholder')}
             value={searchQuery}
             onChange={(e) => {
               setSearchQuery(e.target.value);
               setLastInteraction('search');
             }}
             className="pl-9 h-8 text-sm transition-all duration-200"
             style={{
               boxShadow: lastInteraction === 'search' ? '0 0 0 2px hsl(var(--accent))' : 'none'
             }}
           />
         </div>
        
          <div className="flex items-center gap-1 md:gap-2 flex-wrap">
           <TooltipProvider>
             <Tooltip>
               <TooltipTrigger asChild>
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => {
                     setFilterDifficulty(filterDifficulty === 'all' ? 'beginner' : 
                       filterDifficulty === 'beginner' ? 'intermediate' : 
                       filterDifficulty === 'intermediate' ? 'advanced' : 'all');
                     setLastInteraction('filter');
                   }}
                   className={cn(
                     "h-7 px-1 md:px-2 text-xs transition-all duration-200",
                     lastInteraction === 'filter' && "ring-2 ring-accent ring-offset-1"
                   )}
                 >
                   <Filter className="h-3 w-3 mr-1" />
                   {filterDifficulty === 'all' ? t('docs.sidebar.filter_all') : 
                    filterDifficulty === 'beginner' ? t('docs.sidebar.filter_beginner') :
                    filterDifficulty === 'intermediate' ? t('docs.sidebar.filter_intermediate') : t('docs.sidebar.filter_advanced')}
                 </Button>
               </TooltipTrigger>
               <TooltipContent>
                 <p>{t('docs.sidebar.filter_tooltip')}</p>
               </TooltipContent>
             </Tooltip>
           </TooltipProvider>

           <TooltipProvider>
             <Tooltip>
               <TooltipTrigger asChild>
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => {
                     setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                     setLastInteraction('sort');
                   }}
                   className={cn(
                     "h-7 px-1 md:px-2 text-xs transition-all duration-200",
                     lastInteraction === 'sort' && "ring-2 ring-accent ring-offset-1"
                   )}
                 >
                   {sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />}
                 </Button>
               </TooltipTrigger>
               <TooltipContent>
                 <p>{t('docs.sidebar.sort_tooltip')}</p>
               </TooltipContent>
             </Tooltip>
           </TooltipProvider>

           <TooltipProvider>
             <Tooltip>
               <TooltipTrigger asChild>
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => setShowKeyboardShortcuts(prev => !prev)}
                   className="h-7 px-1 md:px-2 text-xs"
                 >
                   <Keyboard className="h-3 w-3" />
                 </Button>
               </TooltipTrigger>
               <TooltipContent>
                 <p>{t('docs.sidebar.keyboard_shortcuts_tooltip')}</p>
               </TooltipContent>
             </Tooltip>
           </TooltipProvider>
         </div>
             </div>

        {showKeyboardShortcuts && createPortal(
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" 
            style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0,
              zIndex: 9999
            }}
            onClick={() => setShowKeyboardShortcuts(false)}
          >
            <div 
              className="bg-card border rounded-lg p-4 md:p-6 max-w-md w-full max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="keyboard-shortcuts-title"
              style={{
                position: 'relative',
                zIndex: 10000
              }}
            >
                            <div className="flex items-center justify-between mb-4">
                 <h3 id="keyboard-shortcuts-title" className="text-lg font-semibold flex items-center gap-2">
                   <Keyboard className="h-5 w-5" />
                   {t('docs.sidebar.keyboard_shortcuts_title')}
                 </h3>
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => setShowKeyboardShortcuts(false)}
                 className="h-6 w-6 p-0"
               >
                 ×
               </Button>
             </div>
             <div className="space-y-3 text-sm">
               <div className="flex items-center justify-between">
                 <span>{t('docs.sidebar.shortcuts.search_documents')}</span>
                 <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+K</kbd>
               </div>
               <div className="flex items-center justify-between">
                 <span>{t('docs.sidebar.shortcuts.filter_difficulty')}</span>
                 <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+F</kbd>
               </div>
               <div className="flex items-center justify-between">
                 <span>{t('docs.sidebar.shortcuts.toggle_sort')}</span>
                 <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+S</kbd>
               </div>
               <div className="flex items-center justify-between">
                 <span>{t('docs.sidebar.shortcuts.clear_filters')}</span>
                 <kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd>
               </div>
               <div className="flex items-center justify-between">
                 <span>{t('docs.sidebar.shortcuts.show_shortcuts')}</span>
                 <kbd className="px-2 py-1 bg-muted rounded text-xs">?</kbd>
               </div>
             </div>
           </div>
         </div>,
         document.body
       )}

       <Accordion type="multiple" defaultValue={filteredAndSortedData.map(c => c.categorySlug)} className="w-full">
        {filteredAndSortedData.map(category => {
          const difficulty = getDifficultyByCategory(category);
          const difficultyColor = getDifficultyColor(difficulty);
          
          return (
            <AccordionItem key={category.categorySlug} value={category.categorySlug} className="border-none">
              <AccordionTrigger className="text-sm font-semibold hover:no-underline px-3 py-2 rounded-md hover:bg-accent/50 transition-colors group">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="text-muted-foreground group-hover:text-accent transition-colors flex-shrink-0">
                    {getCategoryIcon(category.categorySlug)}
                  </div>
                  <span className="flex-1 text-left truncate">{category.categoryTitle}</span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", difficultyColor)}
                    >
                      {difficulty}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {category.documents.length}
                    </Badge>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                                 <div className="pl-4 space-y-1 mt-2">
                   {category.documents.map((doc, index) => {
                    const href = `/docs/${category.categorySlug}/${doc.slug}`;
                    const isActive = pathname === href;
                    const docPath = `${category.categorySlug}/${doc.slug}`;
                    const isRead = readDocs.has(docPath);
                    
                    return (
                                             <Link
                         key={href}
                         href={href}
                         className={cn(
                           "flex items-center gap-2 rounded-md p-2 text-sm transition-all duration-300 group min-w-0 hover:scale-[1.02] hover:shadow-sm",
                           isActive 
                             ? "bg-accent text-accent-foreground shadow-sm scale-[1.02]" 
                             : "text-muted-foreground hover:text-accent-foreground hover:bg-accent/50"
                         )}
                         style={{
                           animationDelay: `${index * 50}ms`
                         }}
                       >
                         <ProgressIndicator isRead={isRead} />
                         <span className="flex-1 truncate">{doc.title}</span>
                         {isActive && (
                           <div className="w-1 h-1 bg-accent-foreground rounded-full flex-shrink-0 animate-pulse" />
                         )}
                       </Link>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      <div className="pt-4 mt-4 border-t">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>{t('docs.sidebar.progress')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{progress}% {t('docs.sidebar.complete')}</span>
            </div>
          </div>
          <Progress value={progress} className="h-1" />
          
          {(searchQuery || filterDifficulty !== 'all') && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Filter className="h-3 w-3" />
                <span>{t('docs.sidebar.active_filters')}</span>
              </div>
              <div className="flex items-center gap-1">
                {searchQuery && (
                  <Badge variant="outline" className="text-xs">
                    {t('docs.sidebar.search_filter')}
                  </Badge>
                )}
                {filterDifficulty !== 'all' && (
                  <Badge variant="outline" className="text-xs">
                    {filterDifficulty === 'beginner' ? t('docs.sidebar.filter_beginner') :
                     filterDifficulty === 'intermediate' ? t('docs.sidebar.filter_intermediate') : t('docs.sidebar.filter_advanced')}
                  </Badge>
                )}
              </div>
            </div>
          )}
          
           {filteredAndSortedData.length !== docsData.length && (
             <div className="text-xs text-muted-foreground">
               {t('docs.sidebar.showing_results')}
             </div>
           )}
           
           {lastInteraction && (
             <div className="flex items-center gap-2 text-xs text-accent animate-in slide-in-from-bottom-2">
               <Lightning className="h-3 w-3 animate-pulse" />
               <span>
                 {lastInteraction === 'search' && t('docs.sidebar.search_active')}
                 {lastInteraction === 'filter' && t('docs.sidebar.filter_applied')}
                 {lastInteraction === 'sort' && t('docs.sidebar.sort_changed')}
               </span>
             </div>
           )}
        </div>
      </div>
    </div>
  );
} 