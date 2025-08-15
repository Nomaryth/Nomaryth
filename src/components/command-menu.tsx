'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { DialogTitle } from '@/components/ui/dialog';
import {
  File,
  Book,
  Home,
  Map,
  Swords,
  User,
  LayoutDashboard,
  Search,
  Moon,
  Sun,
  Globe,
  Bell,
  LogOut,
  Sparkles,
  Shield,
  Gem,
  Settings,
  Zap
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from '@/context/i18n-context';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface Doc {
  slug: string;
  title: string;
}

interface Category {
  categorySlug: string;
  categoryTitle: string;
  documents: Doc[];
}

interface UserForSearch {
    uid: string;
    displayName: string;
    photoURL: string;
}

interface CommandMenuProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function CommandMenu({ open, setOpen }: CommandMenuProps) {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const { t, setLanguage, language } = useTranslation();
  const { setTheme, theme } = useTheme();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [users, setUsers] = useState<UserForSearch[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    
    fetch('/api/docs')
      .then((res) => res.json())
      .then((data: Category[]) => {
        if (Array.isArray(data)) {
            const flattenedDocs = data.flatMap((category) =>
            category.documents.map((doc) => ({
                ...doc,
                slug: `${category.categorySlug}/${doc.slug}`,
            }))
            );
            setDocs(flattenedDocs);
        } else {
            setDocs([]);
        }
      });
      
    
    if (user) {
        user.getIdToken().then(token => {
            fetch('/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.json())
            .then((data: UserForSearch[]) => {
                if(Array.isArray(data)) {
                    setUsers(data);
                } else {
                    setUsers([]);
                }
            })
        })
    } else {
      
      setUsers([]);
    }

  }, [open, user]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputFocused =
        target.isContentEditable ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA';

      const key = typeof e.key === 'string' ? e.key.toLowerCase() : '';
      if (key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      } else if (key === 'k' && !isInputFocused) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [setOpen]);

  const runCommand = useCallback(
    (command: () => unknown) => {
      setOpen(false);
      command();
    },
    [setOpen]
  );

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/');
  };

  if (!mounted) return null;

  const navigationCommands = [
    {
      icon: <Home className="mr-2 h-4 w-4" />,
      label: t('nav.home'),
      action: () => router.push("/"),
      shortcut: "⌘H"
    },
    {
      icon: <Book className="mr-2 h-4 w-4" />,
      label: t('nav.docs'),
      action: () => router.push("/docs"),
      shortcut: "⌘D"
    },
    {
      icon: <Map className="mr-2 h-4 w-4" />,
      label: t('nav.map'),
      action: () => router.push("/map"),
      shortcut: "⌘M"
    },
    {
      icon: <Swords className="mr-2 h-4 w-4" />,
      label: t('nav.projects'),
      action: () => router.push("/projects"),
      shortcut: "⌘R"
    },
    {
      icon: <Swords className="mr-2 h-4 w-4" />,
      label: t('factions.page_title'),
      action: () => router.push("/factions"),
      shortcut: "⌘F"
    }
  ];

  const quickActions = [
    {
      icon: <Search className="mr-2 h-4 w-4" />,
      label: t('header.search_docs'),
      action: () => {},
      shortcut: "/"
    },
    {
      icon: theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />,
      label: theme === 'dark' ? 'Light Mode' : 'Dark Mode',
      action: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
      shortcut: "⌘T"
    },
    {
      icon: <Globe className="mr-2 h-4 w-4" />,
      label: language === 'en' ? 'Português' : 'English',
      action: () => setLanguage(language === 'en' ? 'pt' : 'en'),
      shortcut: "⌘L"
    }
  ];

  const userCommands = user ? [
    {
      icon: <User className="mr-2 h-4 w-4" />,
      label: t('header.profile'),
      action: () => router.push("/profile"),
      shortcut: "⌘P"
    },
    {
      icon: <Settings className="mr-2 h-4 w-4" />,
      label: 'Settings',
      action: () => router.push("/profile"),
      shortcut: "⌘,"
    }
  ] : [];

  const adminCommands = isAdmin ? [
    {
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
      label: t('profile.admin.title'),
      action: () => router.push("/admin"),
      shortcut: "⌘A",
      badge: "Admin"
    },
    {
      icon: <User className="mr-2 h-4 w-4" />,
      label: 'Manage Users',
      action: () => router.push("/admin/users"),
      shortcut: "⌘U",
      badge: "Admin"
    }
  ] : [];

  const gameFeatures = [
    {
      icon: <Sparkles className="mr-2 h-4 w-4" />,
      label: t('features.magic.title'),
      action: () => router.push("/docs"),
      description: t('features.magic.description')
    },
    {
      icon: <Shield className="mr-2 h-4 w-4" />,
      label: t('features.factions.title'),
      action: () => router.push("/factions"),
      description: t('features.factions.description')
    },
    {
      icon: <Gem className="mr-2 h-4 w-4" />,
      label: t('features.aetherium.title'),
      action: () => router.push("/docs"),
      description: t('features.aetherium.description')
    }
  ];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <DialogTitle className="sr-only">Command Menu</DialogTitle>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Navigation">
          {navigationCommands.map((command) => (
            <CommandItem
              key={command.label}
              onSelect={() => runCommand(command.action)}
            >
              {command.icon}
              <span>{command.label}</span>
              <CommandShortcut>{command.shortcut}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading="Quick Actions">
          {quickActions.map((command) => (
            <CommandItem
              key={command.label}
              onSelect={() => runCommand(command.action)}
            >
              {command.icon}
              <span>{command.label}</span>
              <CommandShortcut>{command.shortcut}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        {userCommands.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Account">
              {userCommands.map((command) => (
                <CommandItem
                  key={command.label}
                  onSelect={() => runCommand(command.action)}
                >
                  {command.icon}
                  <span>{command.label}</span>
                  <CommandShortcut>{command.shortcut}</CommandShortcut>
                </CommandItem>
              ))}
              <CommandItem onSelect={() => runCommand(handleLogout)}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('header.logout')}</span>
                <CommandShortcut>⌘Q</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {adminCommands.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Admin">
              {adminCommands.map((command) => (
                <CommandItem
                  key={command.label}
                  onSelect={() => runCommand(command.action)}
                  className="text-amber-600 dark:text-amber-400"
                >
                  {command.icon}
                  <span>{command.label}</span>
                  <div className="ml-auto flex items-center gap-2">
                    {command.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {command.badge}
                      </Badge>
                    )}
                    <CommandShortcut>{command.shortcut}</CommandShortcut>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        
        <CommandGroup heading="Features">
          {gameFeatures.map((feature) => (
            <CommandItem
              key={feature.label}
              onSelect={() => runCommand(feature.action)}
            >
              <div className="flex items-start gap-3 w-full">
                {feature.icon}
                <div className="flex flex-col">
                  <span>{feature.label}</span>
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    {feature.description}
                  </span>
                </div>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
        
        {users.length > 0 && <CommandSeparator />}
        
        {users.length > 0 && (
            <CommandGroup heading="Users">
            {users.slice(0, 3).map((u) => (
                <CommandItem
                key={u.uid}
                value={u.displayName}
                onSelect={() => runCommand(() => router.push(`/users/${u.uid}`))}
                >
                <Avatar className="mr-2 h-5 w-5">
                    <AvatarImage src={u.photoURL} alt={u.displayName} />
                    <AvatarFallback>{u.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span>{u.displayName}</span>
                </CommandItem>
            ))}
            </CommandGroup>
        )}
        
        {docs.length > 0 && <CommandSeparator />}

        {docs.length > 0 && (
            <CommandGroup heading="Documentation">
            {docs.slice(0, 3).map((doc) => (
                <CommandItem
                key={doc.slug}
                value={doc.title}
                onSelect={() => runCommand(() => router.push(`/docs/${doc.slug}`))}
                >
                <Book className="mr-2 h-4 w-4" />
                <span>{doc.title}</span>
                </CommandItem>
            ))}
            </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
