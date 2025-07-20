
'use client';

import Link from 'next/link';
import {
  Bell,
  Home,
  Users,
  FileText,
  Settings,
  PanelLeft,
  LogOut,
  User,
  PenSquare,
  Megaphone,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { useEffect, useState, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { StatusFooter } from '@/components/status-footer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

const navLinks = [
  { href: '/admin', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
  { href: '/admin/users', label: 'Users', icon: <Users className="h-5 w-5" /> },
  { href: '/admin/content', label: 'Content Guide', icon: <FileText className="h-5 w-5" /> },
  { href: '/admin/content-editor', label: 'Doc Editor', icon: <PenSquare className="h-5 w-5" /> },
  { href: '/admin/announcements', label: 'Announcements', icon: <Megaphone className="h-5 w-5" /> },
];

const systemLinks = [
  { href: '/admin/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
];


function UserNav() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/');
  };

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'Admin'} />
            <AvatarFallback>{user.displayName?.charAt(0).toUpperCase() ?? 'A'}</AvatarFallback>
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
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);
  
  const NavItem = ({ link, isCollapsed }: { link: { href: string; label: string; icon: React.ReactNode }, isCollapsed: boolean }) => (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              pathname === link.href && "bg-muted text-primary",
              isCollapsed && "justify-center"
            )}
          >
            {link.icon}
            <span className={cn("transition-opacity", isCollapsed ? "sr-only" : "opacity-100")}>{link.label}</span>
          </Link>
        </TooltipTrigger>
        {isCollapsed && <TooltipContent side="right">{link.label}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className={cn("grid min-h-screen w-full", isCollapsed ? "md:grid-cols-[5rem_1fr]" : "md:grid-cols-[16rem_1fr]")} style={{ transition: 'grid-template-columns 0.2s ease-in-out' }}>
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Logo />
              <span className={cn(isCollapsed && "sr-only")}>Nomaryth</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navLinks.map(link => <NavItem key={link.href} link={link} isCollapsed={isCollapsed} />)}
            </nav>
          </div>
          <div className="mt-auto p-4 border-t">
             <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
               {systemLinks.map(link => <NavItem key={link.href} link={link} isCollapsed={isCollapsed} />)}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
           <Button variant="outline" size="icon" className="h-8 w-8 shrink-0 md:hidden" onClick={toggleSidebar}>
              <PanelLeft className="h-4 w-4" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 hidden md:flex" onClick={toggleSidebar}>
              <PanelLeft className="h-4 w-4" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          
          <div className="w-full flex-1">
             {/* We can add a search bar here later if needed */}
          </div>
          
          <TooltipProvider>
             <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                        <Bell className="h-5 w-5" />
                        <span className="sr-only">Toggle notifications</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle Notifications</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <UserNav />
        </header>
        <main className="flex-1 overflow-auto bg-background p-6">
          {children}
        </main>
        <StatusFooter />
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [authReady, setAuthReady] = useState(false);
  const [sessionTooOld, setSessionTooOld] = useState(false);

  useEffect(() => {
    if (loading) {
      return;
    }
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!isAdmin) {
      router.push('/unauthorized');
      return;
    }

    // Check for session freshness as a security measure
    const lastLoginTime = user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).getTime() : 0;
    const eightHours = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
    
    if (Date.now() - lastLoginTime > eightHours) {
        setSessionTooOld(true);
    } else {
        setSessionTooOld(false);
        setAuthReady(true);
    }

  }, [user, loading, isAdmin, router]);

  if (loading || !authReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading & Verifying Access...</p>
        </div>
      </div>
    );
  }

  if (sessionTooOld) {
      return (
          <div className="flex items-center justify-center h-screen bg-background p-4">
              <Alert variant="destructive" className="max-w-md">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Re-authentication Required</AlertTitle>
                <AlertDescription>
                    For your security, your admin session has expired. Please log out and log back in to continue.
                </AlertDescription>
                 <div className="mt-4 flex justify-end">
                    <Button variant="destructive" onClick={() => signOut(auth).then(() => router.push('/login'))}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Log Out
                    </Button>
                </div>
              </Alert>
          </div>
      )
  }

  return <AdminLayoutContent>{children}</AdminLayoutContent>;
}
