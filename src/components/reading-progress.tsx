'use client';

import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Clock, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReadingProgressProps {
  className?: string;
}

export function ReadingProgress({ className }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setProgress(Math.min(scrollPercent, 100));
    };

    const updateTimeSpent = () => {
      setTimeSpent(prev => prev + 1);
    };

    window.addEventListener('scroll', updateProgress);
    
    const timeInterval = setInterval(updateTimeSpent, 1000);

    const content = document.querySelector('article');
    if (content) {
      const wordCount = content.textContent?.split(/\s+/).length || 0;
      const wordsPerMinute = 200;
      const estimatedMinutes = Math.ceil(wordCount / wordsPerMinute);
      setEstimatedTime(estimatedMinutes);
    }

    return () => {
      window.removeEventListener('scroll', updateProgress);
      clearInterval(timeInterval);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatEstimatedTime = (minutes: number) => {
    if (minutes < 1) return '< 1 min';
    if (minutes === 1) return '1 min';
    return `${minutes} min`;
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <BookOpen className="h-3 w-3" />
          <span>{Math.round(progress)}% lido</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{formatTime(timeSpent)} / {formatEstimatedTime(estimatedTime)}</span>
        </div>
      </div>
      <Progress value={progress} className="h-1" />
    </div>
  );
} 