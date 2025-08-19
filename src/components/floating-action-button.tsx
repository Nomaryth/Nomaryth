'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  MessageCircle, 
  HelpCircle, 
  Zap, 
  ArrowUp,
  Command,
  Search,
  Settings,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FABAction {
  icon: React.ReactNode;
  label: string;
  action: () => void;
  color?: string;
  requiresAuth?: boolean;
  adminOnly?: boolean;
}

interface FloatingActionButtonProps {
  onCommandMenuOpen?: () => void;
}

export function FloatingActionButton({ onCommandMenuOpen }: FloatingActionButtonProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  const openCommandMenu = () => {
    if (onCommandMenuOpen) {
      onCommandMenuOpen();
    } else {
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        metaKey: true,
        bubbles: true
      });
      document.dispatchEvent(event);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const actions: FABAction[] = [
    {
      icon: <Command className="h-4 w-4" />,
      label: 'Command Menu (⌘K)',
      action: openCommandMenu,
      color: 'bg-blue-500 hover:bg-blue-600 text-white'
    },
    {
      icon: <Search className="h-4 w-4" />,
      label: 'Quick Search',
      action: openCommandMenu,
      color: 'bg-emerald-500 hover:bg-emerald-600 text-white'
    },
    {
      icon: <Plus className="h-4 w-4" />,
      label: 'Create Faction',
      action: () => router.push('/factions'),
      color: 'bg-amber-500 hover:bg-amber-600 text-white',
      requiresAuth: true
    },
    {
      icon: <MessageCircle className="h-4 w-4" />,
      label: 'Feedback',
      action: () => router.push('/feedback'),
      color: 'bg-purple-500 hover:bg-purple-600 text-white'
    },
    {
      icon: <Settings className="h-4 w-4" />,
      label: 'Admin Panel',
      action: () => router.push('/admin'),
      color: 'bg-red-500 hover:bg-red-600 text-white',
      adminOnly: true
    }
  ];

  const filteredActions = actions.filter(action => {
    if (action.requiresAuth && !user) return false;
    if (action.adminOnly && !isAdmin) return false;
    return true;
  });

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {showScrollTop && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                onClick={scrollToTop}
                className={cn(
                  "h-12 w-12 rounded-full shadow-lg transition-all duration-300 transform",
                  "bg-gradient-to-br from-accent/90 to-primary/90 hover:from-accent hover:to-primary text-white border border-accent/30 hover:scale-110 hover:shadow-xl hover:shadow-accent/25",
                  "animate-in slide-in-from-bottom-5 fade-in-0"
                )}
              >
                <ArrowUp className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Scroll to top</p>
            </TooltipContent>
          </Tooltip>
        )}

        {isOpen && (
          <div className="flex flex-col gap-3 animate-in slide-in-from-bottom-5 fade-in-0 duration-300">
            {filteredActions.map((action, index) => (
              <Tooltip key={action.label}>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    onClick={() => {
                      action.action();
                      setIsOpen(false);
                    }}
                    className={cn(
                      "h-12 w-12 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110",
                      action.color || "bg-primary hover:bg-primary/90",
                      "animate-in slide-in-from-bottom-5 fade-in-0"
                    )}
                    style={{
                      animationDelay: `${index * 50}ms`
                    }}
                  >
                    {action.icon}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>{action.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "h-14 w-14 rounded-full shadow-xl transition-all duration-300 transform hover:scale-110",
                "bg-gradient-to-r from-accent via-primary to-accent bg-size-200 bg-pos-0 hover:bg-pos-100",
                "border-2 border-background shadow-accent/25",
                isOpen && "rotate-45"
              )}
            >
              {isOpen ? (
                <X className="h-6 w-6 text-white" />
              ) : (
                <Zap className="h-6 w-6 text-white animate-pulse" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>{isOpen ? 'Close menu' : 'Quick actions'}</p>
          </TooltipContent>
        </Tooltip>

        {isOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10 animate-in fade-in-0 duration-300"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    </TooltipProvider>
  );
}