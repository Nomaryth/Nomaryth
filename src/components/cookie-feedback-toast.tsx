'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Info, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CookieFeedbackToastProps {
  type: 'accepted' | 'rejected' | 'customized' | null;
  onDismiss: () => void;
  onOpenSettings?: () => void;
}

export function CookieFeedbackToast({ type, onDismiss, onOpenSettings }: CookieFeedbackToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (type) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [type]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss();
    }, 300);
  };

  const getToastConfig = () => {
    switch (type) {
      case 'accepted':
        return {
          icon: <Check className="h-5 w-5 text-green-600" />,
          title: 'Obrigado!',
          message: 'Suas preferências de cookies foram salvas. Isso nos ajuda a melhorar sua experiência.',
          bgColor: 'bg-green-50 dark:bg-green-950/30',
          borderColor: 'border-green-200 dark:border-green-800',
          textColor: 'text-green-800 dark:text-green-200'
        };
      case 'rejected':
        return {
          icon: <Info className="h-5 w-5 text-blue-600" />,
          title: 'Preferências Respeitadas',
          message: 'Apenas cookies essenciais serão utilizados. Você pode alterar isso a qualquer momento.',
          bgColor: 'bg-blue-50 dark:bg-blue-950/30',
          borderColor: 'border-blue-200 dark:border-blue-800',
          textColor: 'text-blue-800 dark:text-blue-200'
        };
      case 'customized':
        return {
          icon: <Settings className="h-5 w-5 text-purple-600" />,
          title: 'Configuração Salva',
          message: 'Suas preferências personalizadas foram aplicadas com sucesso.',
          bgColor: 'bg-purple-50 dark:bg-purple-950/30',
          borderColor: 'border-purple-200 dark:border-purple-800',
          textColor: 'text-purple-800 dark:text-purple-200'
        };
      default:
        return null;
    }
  };

  const config = getToastConfig();
  if (!config || !type) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={`cookie-feedback-${type}`}
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-[10000] max-w-sm"
        >
          <div className={`
            relative overflow-hidden rounded-lg border-2 p-4 shadow-lg backdrop-blur-sm
            ${config.bgColor} ${config.borderColor}
          `}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {config.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold text-sm mb-1 ${config.textColor}`}>
                  {config.title}
                </h4>
                <p className={`text-xs leading-relaxed ${config.textColor} opacity-90`}>
                  {config.message}
                </p>
              </div>

              <div className="flex-shrink-0 flex gap-1">
                {type === 'rejected' && onOpenSettings && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onOpenSettings}
                    className={`h-7 w-7 p-0 ${config.textColor} hover:bg-black/5`}
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className={`h-7 w-7 p-0 ${config.textColor} hover:bg-black/5`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 5, ease: "linear" }}
              className={`absolute bottom-0 left-0 h-1 ${
                type === 'accepted' ? 'bg-green-400' :
                type === 'rejected' ? 'bg-blue-400' : 'bg-purple-400'
              } opacity-60`}
            />
            <div className={`absolute -top-1 -right-1 w-8 h-8 rounded-full blur-md opacity-20 ${
              type === 'accepted' ? 'bg-green-400' :
              type === 'rejected' ? 'bg-blue-400' : 'bg-purple-400'
            }`} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
