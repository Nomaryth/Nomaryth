'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Sidebar, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReadingModeToggleProps {
  onModeChange: (isReadingMode: boolean) => void;
  className?: string;
}

export function ReadingModeToggle({ onModeChange, className }: ReadingModeToggleProps) {
  const [isReadingMode, setIsReadingMode] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('nomaryth-reading-mode');
    if (savedMode) {
      const mode = JSON.parse(savedMode);
      setIsReadingMode(mode);
      onModeChange(mode);
    }
  }, [onModeChange]);

  const toggleReadingMode = () => {
    const newMode = !isReadingMode;
    setIsReadingMode(newMode);
    localStorage.setItem('nomaryth-reading-mode', JSON.stringify(newMode));
    onModeChange(newMode);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleReadingMode}
      className={cn(
        "flex items-center gap-2 transition-all duration-200",
        isReadingMode && "bg-accent text-accent-foreground",
        className
      )}
      title={isReadingMode ? "Sair do modo foco" : "Ativar modo foco"}
    >
      {isReadingMode ? (
        <>
          <EyeOff className="h-4 w-4" />
          <span className="hidden sm:inline">Modo Foco</span>
        </>
      ) : (
        <>
          <Eye className="h-4 w-4" />
          <span className="hidden sm:inline">Modo Foco</span>
        </>
      )}
    </Button>
  );
} 