
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, Search, BookOpen, Swords, User, X, Languages, LogOut, Map as MapIcon, Bell, LayoutDashboard, Check, Trash2, Loader2 } from "lucide-react";
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
  { href: "/projects", labelKey: "nav.projects", icon: <Swords className="h-5 w-5" /> },
];

interface Notification {
    id: string;
    title: string;
    message: string;
    isRead: boolean;
    timestamp: { seconds: number; nanoseconds: number } | null;
    type: 'welcome' | 'badge' | 'system';
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
    const { t, language } = useTranslation();

    useEffect(() => {
        if (!user || !db) {
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
    }, [user]);

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
            if (!response.ok) throw new Error(result.error);
            toast({ title: t('header.notifications.clear_read'), description: t('header.notifications.clear_success_desc') });
        } catch (error) {
            toast({ variant: 'destructive', title: t('common.error'), description: t('header.notifications.clear_error_desc') });
        } finally {
            setIsClearing(false);
        }
    };

    const getRelativeTime = (seconds: number) => {
        const date = new Date(seconds * 1000);
        const locale = language === 'pt' ? ptBR : undefined;
        return formatDistanceToNow(date, { addSuffix: true, locale });
    }

    return (
        <DropdownMenu>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative">
                                <Bell className="h-5 w-5" />
                                {hasUnread && <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-primary" />}
                                <span className="sr-only">{t('header.notifications.tooltip')}</span>
                            </Button>
                        </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t('header.notifications.tooltip')}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <DropdownMenuContent align="end" className="w-80 p-0">
                <DropdownMenuLabel className="p-2">{t('header.notifications.title')}</DropdownMenuLabel>
                <DropdownMenuSeparator className="m-0" />
                <ScrollArea className="h-[300px]">
                    {notifications.length > 0 ? (
                        notifications.map(notif => (
                            <DropdownMenuItem key={notif.id} className="flex flex-col items-start gap-2 p-2" onSelect={(e) => e.preventDefault()}>
                                <div className="w-full">
                                    <p className="font-semibold">{notif.title}</p>
                                    <p className="text-sm text-muted-foreground">{notif.message}</p>
                                    {notif.timestamp && <p className="text-xs text-muted-foreground/80 mt-1">{getRelativeTime(notif.timestamp.seconds)}</p>}
                                </div>
                                {!notif.isRead && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full h-8"
                                        onClick={() => handleMarkAsRead(notif.id)}
                                    >
                                        <Check className="mr-2 h-4 w-4" />
                                        {t('header.notifications.mark_as_read')}
                                    </Button>
                                )}
                            </DropdownMenuItem>
                        ))
                    ) : (
                        <p className="p-4 text-sm text-center text-muted-foreground">{t('header.notifications.no_notifications')}</p>
                    )}
                </ScrollArea>
                {notifications.some(n => n.isRead) && (
                    <>
                        <DropdownMenuSeparator className="m-0"/>
                        <div className="p-1">
                            <Button variant="ghost" size="sm" className="w-full" onClick={handleClearAllRead} disabled={isClearing}>
                                {isClearing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Trash2 className="mr-2 h-4 w-4" />}
                                {isClearing ? t('header.notifications.clearing') : t('header.notifications.clear_read')}
                            </Button>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function Header() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [openCommandMenu, setOpenCommandMenu] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const NavLinks = ({ className }: { className?: string }) => (
    <nav className={cn("flex items-center gap-4 lg:gap-6", className)}>
      {navLinks.map(({ href, labelKey }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "transition-colors text-lg lg:text-sm hover:text-accent",
            pathname.startsWith(href) && href !== "/" || pathname === href ? "text-accent font-semibold" : "text-muted-foreground"
          )}
        >
          {t(labelKey)}
        </Link>
      ))}
    </nav>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
             <span className="font-bold font-headline text-lg hidden sm:inline-block">
                Nomaryth
            </span>
          </Link>
          <NavLinks className="hidden md:flex" />
        </div>

        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" className="gap-2 hidden sm:flex" onClick={() => setOpenCommandMenu(true)}>
             <Search className="h-4 w-4" />
             <span className="text-muted-foreground">{t('header.search_docs')}</span>
             <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
             </kbd>
           </Button>
            <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setOpenCommandMenu(true)}>
                <Search className="h-5 w-5" />
                <span className="sr-only">{t('header.search_docs')}</span>
            </Button>
            
          <NotificationBell />
          <LanguageSwitcher />
          <ThemeToggle />
          <UserNav />

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
       <Progress value={scrollProgress} className="absolute bottom-0 h-0.5 w-full bg-transparent rounded-none [&>div]:bg-primary" />
    </header>
  );
}
