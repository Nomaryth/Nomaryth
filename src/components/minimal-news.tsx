'use client';

import { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Clock } from "lucide-react";
import { useTranslation } from "@/context/i18n-context";
import { useAuth } from '@/context/auth-context';
import { NewsDetailPopover } from "./news-detail-popover";

interface PublicNewsItem {
  id: string;
  title: string;
  excerpt: string;
  date: Date | string;
  type: 'update' | 'event' | 'announcement';
  featured: boolean;
  author?: string;
  tags?: string[];
  published: boolean;
  githubIssueId?: number | null;
}

interface MinimalNewsProps {
  className?: string;
}

export function MinimalNews({ className }: MinimalNewsProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [selectedType, setSelectedType] = useState<'all' | 'update' | 'event' | 'announcement'>('all');
  const [newsItems, setNewsItems] = useState<PublicNewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/public/news');
        if (response.ok) {
          const news = await response.json();
          setNewsItems(news);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [isClient, user]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'update': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'event': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'announcement': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'update': return 'Atualização';
      case 'event': return 'Evento';
      case 'announcement': return 'Anúncio';
      default: return 'Outro';
    }
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'Data não disponível';
    
    let dateObj: Date;
    
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return 'Data inválida';
    }
    
    if (isNaN(dateObj.getTime())) {
      return 'Data inválida';
    }
    
    return dateObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short'
    });
  };

  const filteredNews = newsItems
    .filter(item => item.published !== false)
    .filter(item => selectedType === 'all' || item.type === selectedType);

  if (!isClient) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <section className={`py-12 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold font-headline text-primary mb-2">
            {t('home.news.title')}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t('home.news.subtitle')}
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {[
            { key: 'all', label: t('home.news.filters.all') },
            { key: 'update', label: t('home.news.filters.updates') },
            { key: 'event', label: t('home.news.filters.events') },
            { key: 'announcement', label: t('home.news.filters.announcements') }
          ].map(filter => (
            <Button
              key={filter.key}
              variant={selectedType === filter.key ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedType(filter.key as any)}
              className="text-xs h-8 px-3 transition-all duration-300"
            >
              {filter.label}
            </Button>
          ))}
        </div>

        <div className="max-w-4xl mx-auto space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="bg-card/50 border border-border/50 rounded-lg p-4 animate-pulse"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-4 bg-muted rounded w-16"></div>
                      <div className="h-4 bg-muted rounded w-20 ml-auto"></div>
                    </div>
                    <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="h-6 w-6 bg-muted rounded"></div>
                    <div className="h-6 w-6 bg-muted rounded"></div>
                  </div>
                </div>
              </div>
            ))
          ) : filteredNews.length > 0 ? (
            filteredNews.map((item, index) => (
              <div
                key={item.id}
                className={`bg-card/50 border border-border/50 rounded-lg p-4 hover:border-accent transition-all duration-300 transform hover:scale-[1.02] ${
                  item.featured ? 'ring-1 ring-accent/50' : ''
                }`}
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  animationDuration: '0.6s',
                  animationTimingFunction: 'ease-out',
                  animationFillMode: 'forwards',
                  animationName: 'fadeIn'
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getTypeColor(item.type)}`}
                      >
                        {getTypeLabel(item.type)}
                      </Badge>
                      {item.featured && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          {t('home.news.featured')}
                        </Badge>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(item.date)}</span>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                      {item.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-xs line-clamp-2">
                      {item.excerpt}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <NewsDetailPopover newsId={item.id}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                        title="Ver detalhes"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </NewsDetailPopover>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>{t('home.news.no_news')}</p>
            </div>
          )}
        </div>

        <div className="text-center mt-8">
          
        </div>
      </div>
    </section>
  );
} 