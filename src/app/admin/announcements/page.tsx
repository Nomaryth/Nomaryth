'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect, useCallback } from 'react';
import { Megaphone, Send, Users, User, Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/context/i18n-context';

interface UserForSearch {
  uid: string;
  displayName: string;
  photoURL: string;
}

export default function AnnouncementsPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState<'global' | 'specific'>('global');
  const [selectedUser, setSelectedUser] = useState<UserForSearch | null>(null);
  const [allUsers, setAllUsers] = useState<UserForSearch[]>([]);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const { user } = useAuth();

  useEffect(() => {
    async function fetchUsers() {
      if (user) {
        try {
          const token = await user.getIdToken();
          
          const response = await fetch('/api/users', {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (response.ok) {
            const data: UserForSearch[] = await response.json();
            setAllUsers(data);
          } else {
            const errorData = await response.json();
            throw new Error(t('admin.announcements.errors.fetch_users_failed'));
          }
        } catch (error) {
          console.error('Error fetching users:', error);
          toast({
            variant: 'destructive',
            title: t('common.error'),
            description: t('admin.announcements.errors.fetch_users_failed_desc'),
          });
        }
      }
    }
    fetchUsers();
  }, [user, toast, t]);

  const handleSend = async () => {
    if (!title || !message) {
      toast({
        variant: 'destructive',
        title: t('admin.announcements.errors.missing_fields_title'),
        description: t('admin.announcements.errors.missing_fields_desc'),
      });
      return;
    }
    if (target === 'specific' && !selectedUser) {
      toast({
        variant: 'destructive',
        title: t('admin.announcements.errors.no_user_selected_title'),
        description: t('admin.announcements.errors.no_user_selected_desc'),
      });
      return;
    }

    if (!user) {
      toast({
        variant: 'destructive',
        title: t('common.not_authenticated'),
        description: t('admin.announcements.errors.not_authenticated_desc'),
      });
      return;
    }

    setIsSending(true);
    try {
      const idToken = await user.getIdToken();
      
      const body = {
        title,
        message,
        target: target === 'global' ? 'global' : selectedUser?.uid,
      };
      
      const response = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t('admin.announcements.errors.send_failed'));
      }

      toast({
        title: t('common.success'),
        description: t('admin.announcements.success_desc'),
      });

      
      setTitle('');
      setMessage('');
      setTarget('global');
      setSelectedUser(null);
    } catch (error) {
      console.error('Error sending announcement:', error);
      toast({
        variant: 'destructive',
        title: t('admin.announcements.errors.send_failed_title'),
        description:
          error instanceof Error
            ? error.message
            : t('admin.announcements.errors.send_failed_desc'),
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('admin.announcements.title')}</CardTitle>
        <CardDescription>
          {t('admin.announcements.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">{t('admin.announcements.form.title_label')}</Label>
          <Input
            id="title"
            placeholder={t('admin.announcements.form.title_placeholder')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">{t('admin.announcements.form.message_label')}</Label>
          <Textarea
            id="message"
            placeholder={t('admin.announcements.form.message_placeholder')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSending}
            rows={5}
          />
        </div>
        <div className="space-y-4">
          <Label>{t('admin.announcements.form.target_label')}</Label>
          <RadioGroup
            value={target}
            onValueChange={(value: 'global' | 'specific') => setTarget(value)}
            className="flex items-center gap-4"
            disabled={isSending}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="global" id="global" />
              <Label htmlFor="global" className="flex items-center gap-2">
                <Users className="h-4 w-4" /> {t('admin.announcements.form.target_global')}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="specific" id="specific" />
              <Label htmlFor="specific" className="flex items-center gap-2">
                <User className="h-4 w-4" /> {t('admin.announcements.form.target_specific')}
              </Label>
            </div>
          </RadioGroup>

          {target === 'specific' && (
            <UserSelector
              users={allUsers}
              selectedUser={selectedUser}
              onSelectUser={setSelectedUser}
              disabled={isSending}
              t={t}
            />
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSend} disabled={isSending}>
          {isSending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          {isSending ? t('common.sending') : t('admin.announcements.form.send_button')}
        </Button>
      </CardFooter>
    </Card>
  );
}

function UserSelector({
  users,
  selectedUser,
  onSelectUser,
  disabled,
  t
}: {
  users: UserForSearch[];
  selectedUser: UserForSearch | null;
  onSelectUser: (user: UserForSearch | null) => void;
  disabled: boolean;
  t: (key: string) => string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedUser ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={selectedUser.photoURL} />
                <AvatarFallback>
                  {selectedUser.displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span>{selectedUser.displayName}</span>
            </div>
          ) : (
            t('admin.announcements.form.select_user_placeholder')
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder={t('admin.announcements.form.search_user_placeholder')} />
          <CommandList>
            <CommandEmpty>{t('admin.announcements.form.no_user_found')}</CommandEmpty>
            {users.map((user) => (
              <CommandItem
                key={user.uid}
                value={user.displayName}
                onSelect={() => {
                  onSelectUser(user);
                  setOpen(false);
                }}
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.photoURL} />
                    <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{user.displayName}</span>
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
