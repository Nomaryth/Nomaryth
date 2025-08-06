'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X, Info } from 'lucide-react';

export function PrivacyNotice() {
  const [showNotice, setShowNotice] = useState(false);
  const [hasSeenNotice, setHasSeenNotice] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem('geolocation-notice-seen');
      if (!seen) {
        setShowNotice(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setShowNotice(false);
    setHasSeenNotice(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('geolocation-notice-seen', 'true');
    }
  };

  if (!isClient || !showNotice || hasSeenNotice) {
    return null;
  }

  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
      <Info className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          Este site usa seu IP para mostrar o clima da sua localização. 
          Apenas coordenadas aproximadas são coletadas, sem informações pessoais.
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="ml-2 h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
} 