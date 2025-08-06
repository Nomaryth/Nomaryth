'use client';

import { cn } from '@/lib/utils';

interface SectionDividerProps {
  variant?: 'arknights' | 'tech' | 'hologram' | 'neon' | 'cyber';
  className?: string;
}

export function SectionDivider({ variant = 'arknights', className }: SectionDividerProps) {
  const variants = {
    arknights: (
      <div className={cn(
        "h-20 relative overflow-hidden",
        className
      )}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
        
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
          <div className="h-px bg-gradient-to-r from-transparent via-amber-400/60 via-yellow-500/40 to-transparent" />
          <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full shadow-lg shadow-amber-400/20" />
        </div>
        
        <div className="absolute inset-0 opacity-40">
          <div className="absolute left-1/4 top-1/3 w-1 h-1 bg-amber-400 rounded-full animate-pulse" />
          <div className="absolute right-1/4 top-2/3 w-1 h-1 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
        
        <div className="absolute inset-x-0 top-1/4">
          <div className="h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
        </div>
        <div className="absolute inset-x-0 bottom-1/4">
          <div className="h-px bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent" />
        </div>
      </div>
    ),
    
    tech: (
      <div className={cn(
        "h-16 relative overflow-hidden",
        className
      )}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-50/10 dark:via-amber-900/5 to-transparent" />
        
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
          <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-300/60 dark:via-amber-400/40 to-transparent" />
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-1 bg-amber-300 dark:bg-amber-400 rounded-full" />
            <div className="w-2 h-2 bg-gradient-to-br from-amber-300 to-amber-500 dark:from-amber-400 dark:to-amber-600 rotate-45" />
            <div className="w-1 h-1 bg-amber-300 dark:bg-amber-400 rounded-full" />
          </div>
        </div>
        
        <div className="absolute left-1/4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-amber-300/30 dark:via-amber-400/20 to-transparent" />
        <div className="absolute right-1/4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-amber-300/30 dark:via-amber-400/20 to-transparent" />
      </div>
    ),
    
    hologram: (
      <div className={cn(
        "h-24 relative overflow-hidden",
        className
      )}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent" />
        
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
          <div className="h-px bg-gradient-to-r from-transparent via-amber-400/80 to-transparent shadow-lg shadow-amber-400/20" />
        </div>
        
        <div className="absolute inset-0">
          <div className="absolute left-1/3 top-1/4 w-2 h-2 bg-amber-400/60 rounded-full animate-pulse" />
          <div className="absolute right-1/3 top-3/4 w-1 h-1 bg-amber-300/80 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-amber-500/40 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
        </div>
        
        <div className="absolute inset-x-0 top-1/4">
          <div className="h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
        </div>
        <div className="absolute inset-x-0 bottom-1/4">
          <div className="h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
        </div>
      </div>
    ),
    
    neon: (
      <div className={cn(
        "h-20 relative overflow-hidden",
        className
      )}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-900/20 to-transparent" />
        
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
          <div className="h-px bg-gradient-to-r from-transparent via-amber-400/80 to-transparent shadow-lg shadow-amber-400/30" />
        </div>
        
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-amber-400 rounded-full shadow-lg shadow-amber-400/50" />
        
        <div className="absolute inset-0">
          <div className="absolute left-1/4 top-1/3 w-1 h-1 bg-amber-400/80 rounded-full animate-pulse" />
          <div className="absolute right-1/4 top-2/3 w-1 h-1 bg-amber-300/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
        
        <div className="absolute inset-x-0 top-1/4">
          <div className="h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
        </div>
        <div className="absolute inset-x-0 bottom-1/4">
          <div className="h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
        </div>
      </div>
    ),
    
    cyber: (
      <div className={cn(
        "h-16 relative overflow-hidden",
        className
      )}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-800/10 to-transparent" />
        
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
          <div className="h-px bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <div className="w-1 h-1 bg-amber-400 rounded-full" />
            <div className="w-2 h-2 bg-gradient-to-br from-amber-400 to-amber-600 rotate-45" />
            <div className="w-1 h-1 bg-amber-400 rounded-full" />
          </div>
        </div>
        
        <div className="absolute left-1/3 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-amber-400/40 to-transparent" />
        <div className="absolute right-1/3 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-amber-400/40 to-transparent" />
      </div>
    )
  };

  return variants[variant];
} 