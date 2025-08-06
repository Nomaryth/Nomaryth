'use client';

import { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Clock, Star, ExternalLink, Loader2 } from "lucide-react";
import { useTranslation } from "@/context/i18n-context";
import type { NewsItem } from "@/lib/news-manager";

interface NewsDetailPopoverProps {
  newsId: string;
  children: React.ReactNode;
}

export function NewsDetailPopover({ newsId, children }: NewsDetailPopoverProps) {
  const { t } = useTranslation();
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen && newsId) {
      fetchNewsDetails();
    }
  }, [isOpen, newsId]);

  const fetchNewsDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/news/${newsId}`);
      if (response.ok) {
        const data = await response.json();
        setNewsItem(data);
      }
    } catch (error) {
      console.error('Error fetching news details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'event':
        return 'bg-green-100 text-green-800';
      case 'announcement':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'update':
        return t('home.news.types.update');
      case 'event':
        return t('home.news.types.event');
      case 'announcement':
        return t('home.news.types.announcement');
      default:
        return type;
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
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewOnGitHub = () => {
    if (newsItem?.githubIssueId) {
      window.open(`https://github.com/Nomaryth/Nomaryth/issues/${newsItem.githubIssueId}`, '_blank');
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-[600px] max-h-[500px] p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getTypeColor(newsItem?.type || 'announcement')}>
                    {getTypeLabel(newsItem?.type || 'announcement')}
                  </Badge>
                  {newsItem?.featured && (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  )}
                </div>
                <CardTitle className="text-lg leading-tight">
                  {isLoading ? (
                    <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    newsItem?.title || 'Carregando...'
                  )}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
              </div>
            ) : newsItem ? (
              <div className="lg:grid lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">{t('home.news.detail.excerpt')}</h4>
                      <p className="text-sm text-muted-foreground">{newsItem.excerpt}</p>
                    </div>
                    
                    {newsItem.content && (
                      <div>
                        <h4 className="font-semibold mb-2">{t('home.news.detail.content')}</h4>
                        <div className="max-h-[300px] overflow-y-auto pr-2">
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {newsItem.content}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">{t('home.news.detail.metadata')}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(newsItem.date)}</span>
                      </div>
                      
                      {newsItem.author && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Por:</span>
                          <span>{newsItem.author}</span>
                        </div>
                      )}
                      
                      {newsItem.tags && newsItem.tags.length > 0 && (
                        <div>
                          <span className="text-muted-foreground">Tags:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {newsItem.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {newsItem.githubIssueId && (
                    <div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleViewOnGitHub}
                        className="w-full"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {t('home.news.detail.view_on_github')}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{t('home.news.detail.not_found')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
} 