"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, Search, BookOpen, Swords, User, X, Languages, LogOut, Map as MapIcon, Bell, LayoutDashboard, Check, Trash2, Loader2, MessageCircle } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/context/i18n-context";
import { useAuth } from "@/context/auth-context";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { CommandMenu } from "../command-menu";
import { Progress } from "../ui/progress";
import { collection, onSnapshot, query, orderBy, limit, updateDoc, doc } from "firebase/firestore";
import { Badge } from "../ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ScrollArea } from "../ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

const navLinks = [
  { href: "/", labelKey: "nav.home", icon: <Swords className="h-5 w-5" /> },
  { href: "/docs", labelKey: "nav.docs", icon: <BookOpen className="h-5 w-5" /> },
  { href: "/map", labelKey: "nav.map", icon: <MapIcon className="h-5 w-5" /> },
  { href: "/feedback", labelKey: "Feedback", icon: <MessageCircle className="h-5 w-5" /> },
  { href: "/projects", labelKey: "nav.projects", icon: <Swords className="h-5 w-5" /> },
];

interface Notification {
    id: string;
    title: string;
    message: string;
    isRead: boolean;
    timestamp: { seconds: number; nanoseconds: number } | null;
    type: 'welcome' | 'badge' | 'system' | 'news';
    newsId?: string;
    newsTitle?: string;
}

function LanguageSwitcher() {
  const { setLanguage, language, t } = useTranslation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Languages className="h-5 w-5" />
          <span className="sr-only">{t('header.language_switcher_alt')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage('en')} className={cn(language === 'en' && "bg-accent")}>
          {t('profile.languages.en')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('pt')} className={cn(language === 'pt' && "bg-accent")}>
          {t('profile.languages.pt')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserNav() {
  const { user, loading, isAdmin } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/');
  };

  if (loading) {
    return <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />;
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
           <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.photoURL || `https://avatar.vercel.sh/${user.uid}.png`} alt={user.displayName || 'User'} />
              <AvatarFallback>{user.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>{t('header.profile')}</span>
            </DropdownMenuItem>
            {isAdmin && (
               <DropdownMenuItem onClick={() => router.push('/admin')}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>{t('profile.admin.title')}</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('header.logout')}</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
     <Button asChild>
      <Link href="/login">
        {t('login.title')}
      </Link>
    </Button>
  )
}

function NotificationBell() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [hasUnread, setHasUnread] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const { t, language } = useTranslation();
    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient || !user || !db) {
            setNotifications([]);
            return;
        };

        const notificationsRef = collection(db, 'users', user.uid, 'notifications');
        const q = query(notificationsRef, orderBy('timestamp', 'desc'), limit(15));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const newNotifications = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
            setNotifications(newNotifications);
            setHasUnread(newNotifications.some(n => !n.isRead));
        });

        return () => unsubscribe();
    }, [user, isClient]);

    const handleMarkAsRead = async (notificationId: string) => {
        if (!user || !db) return;
        const notificationRef = doc(db, 'users', user.uid, 'notifications', notificationId);
        await updateDoc(notificationRef, { isRead: true });
    };

    const handleClearAllRead = async () => {
        if (!user) return;
        setIsClearing(true);
        try {
            const idToken = await user.getIdToken();
            const response = await fetch('/api/notifications', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${idToken}` },
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Failed to clear notifications');
            }
            
            toast({ 
                title: t('header.notifications.clear_read'), 
                description: t('header.notifications.clear_success_desc') 
            });
        } catch (error) {
            console.error('Error clearing notifications:', error);
            toast({ 
                variant: 'destructive', 
                title: t('common.error'), 
                description: t('header.notifications.clear_error_desc') 
            });
        } finally {
            setIsClearing(false);
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (!isClient) return;
        if (!notification.isRead) {
            await handleMarkAsRead(notification.id);
        }

        if (notification.type === 'news' && notification.newsId) {
            router.push('/');
            toast({
                title: t('header.notifications.navigating_to_news'),
                description: `${t('header.notifications.redirecting_to_news')} "${notification.newsTitle}"`,
            });
        }
    };

    const getRelativeTime = (seconds: number) => {
        const date = new Date(seconds * 1000);
        const locale = language === 'pt' ? ptBR : undefined;
        return formatDistanceToNow(date, { addSuffix: true, locale });
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'news':
                return <Bell className="h-4 w-4 text-amber-500 dark:text-amber-400" />;
            case 'system':
                return <LayoutDashboard className="h-4 w-4 text-amber-400 dark:text-amber-300" />;
            case 'badge':
                return <Swords className="h-4 w-4 text-amber-300 dark:text-amber-200" />;
            default:
                return <Bell className="h-4 w-4 text-muted-foreground" />;
        }
    };

    const getNotificationBadge = (type: string) => {
        switch (type) {
            case 'news':
                return <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200 border-amber-200 dark:border-amber-800/50">Notícia</Badge>;
            case 'system':
                return <Badge variant="outline" className="text-xs border-amber-200 text-amber-700 dark:border-amber-800/50 dark:text-amber-300">Sistema</Badge>;
            case 'badge':
                return <Badge variant="default" className="text-xs bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-800 dark:hover:bg-amber-700">Conquista</Badge>;
            default:
                return null;
        }
    };

    if (!isClient) {
        return (
            <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="sr-only">{t('header.notifications.tooltip')}</span>
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative">
                                <Bell className="h-5 w-5" />
                                {hasUnread && (
                                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
                                )}
                                <span className="sr-only">{t('header.notifications.tooltip')}</span>
                            </Button>
                        </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t('header.notifications.tooltip')}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <DropdownMenuContent align="end" className="w-96 p-0">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold text-lg">{t('header.notifications.title')}</h3>
                    {hasUnread && (
                        <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200 border-amber-200 dark:border-amber-800/50">
                            {notifications.filter(n => !n.isRead).length} nova{notifications.filter(n => !n.isRead).length !== 1 ? 's' : ''}
                        </Badge>
                    )}
                </div>
                <ScrollArea className="h-[400px]">
                    {notifications.length > 0 ? (
                        <div className="p-2 space-y-2">
                            {notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    className={`relative p-3 rounded-lg border transition-all cursor-pointer ${
                                        !notif.isRead ? 'bg-amber-50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-800/30' : 'bg-card'
                                    } hover:bg-amber-50 dark:hover:bg-muted/20 hover:border-amber-200 dark:hover:border-border/30`}
                                    onClick={() => handleNotificationClick(notif)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getNotificationIcon(notif.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className={`font-medium text-sm ${!notif.isRead ? 'text-amber-900 dark:text-amber-200' : ''}`}>
                                                    {notif.title}
                                                </p>
                                                {getNotificationBadge(notif.type)}
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                                {notif.message}
                                            </p>
                                            {notif.timestamp && (
                                                <p className="text-xs text-muted-foreground/60">
                                                    {getRelativeTime(notif.timestamp.seconds)}
                                                </p>
                                            )}
                                        </div>
                                        {!notif.isRead && (
                                            <div className="flex-shrink-0">
                                                <span className="h-2 w-2 rounded-full bg-amber-500 dark:bg-amber-400" />
                                            </div>
                                        )}
                                    </div>
                                    
                                    {notif.type === 'news' && notif.newsId && (
                                        <div className="mt-2 pt-2 border-t border-border/50">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 text-xs text-amber-600 dark:text-amber-300 hover:text-amber-700 dark:hover:text-foreground hover:bg-amber-100 dark:hover:bg-muted/20"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleNotificationClick(notif);
                                                }}
                                            >
                                                {t('header.notifications.view_news')} →
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <Bell className="h-12 w-12 mx-auto mb-4 text-amber-500/50 dark:text-amber-400/30" />
                            <p className="text-sm text-muted-foreground">{t('header.notifications.no_notifications')}</p>
                        </div>
                    )}
                </ScrollArea>
                {(() => {
                    const hasReadNotifications = notifications.some(n => n.isRead);
                    return hasReadNotifications && (
                        <>
                            <div className="border-t p-2">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="w-full justify-start text-muted-foreground hover:text-amber-600 dark:hover:text-foreground hover:bg-amber-100 dark:hover:bg-muted/20" 
                                    onClick={handleClearAllRead} 
                                    disabled={isClearing}
                                >
                                    {isClearing ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    ) : (
                                        <Trash2 className="mr-2 h-4 w-4" />
                                    )}
                                    {isClearing ? t('header.notifications.clearing') : t('header.notifications.clear_read')}
                                </Button>
                            </div>
                        </>
                    );
                })()}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function Header() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [openCommandMenu, setOpenCommandMenu] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(16);

  useEffect(() => {
    if (pathname.startsWith('/docs')) {
      setScrollProgress(0);
      return;
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = (scrollY / totalHeight) * 100;
      setScrollProgress(progress);
      
      const scrolled = scrollY > 50;
      setIsScrolled(scrolled);
      setHeaderHeight(scrolled ? 14 : 16);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const getContextualTheme = () => {
    if (pathname.startsWith('/docs')) return { accent: 'from-blue-500 to-indigo-500', bg: 'bg-blue-500/5' };
    if (pathname.startsWith('/factions')) return { accent: 'from-purple-500 to-pink-500', bg: 'bg-purple-500/5' };
    if (pathname.startsWith('/map')) return { accent: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-500/5' };
    if (pathname.startsWith('/admin')) return { accent: 'from-red-500 to-orange-500', bg: 'bg-red-500/5' };
    return { accent: 'from-accent to-primary', bg: 'bg-accent/5' };
  };

  const theme = getContextualTheme();

  const NavLinks = ({ className }: { className?: string }) => (
    <nav className={cn("flex items-center gap-1", className)}>
      {navLinks.map(({ href, labelKey }) => {
        const isActive = pathname.startsWith(href) && href !== "/" || pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300",
              "hover:bg-accent/10 hover:text-accent hover:scale-105",
              isActive 
                ? "text-accent bg-accent/10 scale-105" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t(labelKey)}
            {isActive && (
              <div className={cn(
                "absolute bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-0.5 rounded-full bg-gradient-to-r",
                theme.accent,
                "animate-pulse"
              )} />
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-500",
        isScrolled 
          ? "bg-card/95 backdrop-blur-xl shadow-lg" 
          : "bg-card/80 backdrop-blur-xl shadow-sm",
        theme.bg
      )}
      style={{ height: `${headerHeight * 0.25}rem` }}
    >
      <div className={cn(
        "absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent transition-opacity duration-500",
        isScrolled ? "opacity-100" : "opacity-60"
      )} />
      
      <div className={cn(
        "absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r transition-opacity duration-500",
        theme.accent,
        pathname === '/' ? "opacity-0" : "opacity-30"
      )} />
      
      <div className={cn(
        "container flex items-center justify-between px-4 transition-all duration-500",
        `h-${headerHeight}`
      )}>
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Logo />
              <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 via-primary/20 to-accent/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
            </div>
            <span className="font-bold font-headline text-lg hidden sm:inline-block group-hover:text-accent transition-colors duration-200">
              Nomaryth
            </span>
          </Link>
          
          <div className="hidden md:flex items-center">
            <NavLinks className="flex" />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="relative group hidden sm:block">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/50 via-primary/50 to-accent/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
            <Button 
              variant="outline" 
              size="sm" 
              className="relative gap-2 bg-card/50 backdrop-blur-sm border-border/50 hover:bg-accent/10 hover:border-accent/50 transition-all duration-200" 
              onClick={() => setOpenCommandMenu(true)}
            >
              <Search className="h-4 w-4" />
              <span className="text-muted-foreground">{t('header.search_docs')}</span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>

          <Button variant="ghost" size="icon" className="sm:hidden hover:bg-accent/10 transition-colors" onClick={() => setOpenCommandMenu(true)}>
            <Search className="h-5 w-5" />
            <span className="sr-only">{t('header.search_docs')}</span>
          </Button>
          
          <div className="flex items-center gap-1">
            <NotificationBell />
            <LanguageSwitcher />
            <ThemeToggle />
            <UserNav />
          </div>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">{t('header.menu_alt')}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetTitle className="sr-only">{t('header.menu_alt')}</SheetTitle>
                <div className="p-4">
                  <Link href="/" className="mb-8 flex items-center gap-2">
                    <Logo />
                  </Link>
                  <div className="flex flex-col gap-y-4">
                    <NavLinks className="flex-col items-start gap-4" />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
       <CommandMenu open={openCommandMenu} setOpen={setOpenCommandMenu} />
       {!pathname.startsWith('/docs') && (
         <Progress value={scrollProgress} className="absolute bottom-0 h-0.5 w-full bg-transparent rounded-none [&>div]:bg-primary" />
       )}
    </header>
  );
}