'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Sidebar, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/context/i18n-context';

interface ReadingModeToggleProps {
  onModeChange: (isReadingMode: boolean) => void;
  className?: string;
}

export function ReadingModeToggle({ onModeChange, className }: ReadingModeToggleProps) {
  const [isReadingMode, setIsReadingMode] = useState(false);
  const { t } = useTranslation();

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
} 