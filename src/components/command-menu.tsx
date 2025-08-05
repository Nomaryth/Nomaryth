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
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

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
  const [docs, setDocs] = useState<Doc[]>([]);
  const [users, setUsers] = useState<UserForSearch[]>([]);

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

      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      } else if (e.key.toLowerCase() === 'k' && !isInputFocused) {
        e.preventDefault();
        setOpen((open) => !open);
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

  const mainNavItems = [
    { name: 'Home', href: '/', icon: <Home className="mr-2 h-4 w-4" /> },
    { name: 'Factions', href: '/factions', icon: <Swords className="mr-2 h-4 w-4" /> },
    {
      name: 'Projects',
      href: '/projects',
      icon: <Swords className="mr-2 h-4 w-4" />,
    },
    { name: 'Map', href: '/map', icon: <Map className="mr-2 h-4 w-4" /> },
  ];

  if (user) {
    mainNavItems.push({
      name: 'Profile',
      href: '/profile',
      icon: <User className="mr-2 h-4 w-4" />,
    });
  }
  
  if (isAdmin) {
    mainNavItems.push({
      name: 'Admin Dashboard',
      href: '/admin',
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
    });
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <DialogTitle className="sr-only">Command Menu</DialogTitle>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {mainNavItems.map((item) => (
            <CommandItem
              key={item.href}
              value={item.name}
              onSelect={() => runCommand(() => router.push(item.href))}
            >
              {item.icon}
              <span>{item.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        
        {users.length > 0 && <CommandSeparator />}
        
        {users.length > 0 && (
            <CommandGroup heading="Users">
            {users.slice(0, 5).map((u) => (
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
            {docs.slice(0, 5).map((doc) => (
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
