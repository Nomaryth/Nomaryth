'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/context/auth-context';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Faction } from '@/lib/types';
import { useTranslation } from '@/context/i18n-context';

const createFactionSchema = (t: (key: string) => string) => z.object({
  name: z.string()
    .min(3, t('factions.create_form.validation.name_min'))
    .max(20, t('factions.create_form.validation.name_max')),
  tag: z.string()
    .min(2, t('factions.create_form.validation.tag_min'))
    .max(4, t('factions.create_form.validation.tag_max'))
    .regex(/^[a-zA-Z0-9]+$/, t('factions.create_form.validation.tag_regex')),
  description: z.string()
    .max(150, t('factions.create_form.validation.desc_max'))
    .optional(),
});


interface CreateFactionDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onFactionCreated: (faction: Faction) => void;
}

export function CreateFactionDialog({ isOpen, onOpenChange, onFactionCreated }: CreateFactionDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<ReturnType<typeof createFactionSchema>>>({
    resolver: zodResolver(createFactionSchema(t)),
    defaultValues: {
      name: '',
      tag: '',
      description: '',
    },
  });

  const onSubmit = async (values: z.infer<ReturnType<typeof createFactionSchema>>) => {
    if (!user) {
        toast({ variant: 'destructive', title: t('common.not_authenticated'), description: t('factions.errors.login_required_create')});
        return;
    }
    setIsSubmitting(true);
    
    try {
        const idToken = await user.getIdToken();
        const response = await fetch('/api/factions', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({
                name: values.name,
                tag: values.tag.toUpperCase(),
                description: values.description,
            }),
        });
        
        const result = await response.json();

        if (!response.ok) {
            if (response.status === 409) {
                throw new Error(result.error);
            }
            throw new Error(t('factions.errors.generic_create_failed'));
        }

        toast({
            title: t('factions.create_success_title'),
            description: t('factions.create_success_desc'),
        });
        onFactionCreated(result.faction);
        onOpenChange(false);
        form.reset();

    } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: t('factions.errors.create_failed_title'),
            description: error instanceof Error ? error.message : t('factions.errors.generic_create_failed'),
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('factions.create_form.title')}</DialogTitle>
          <DialogDescription>
            {t('factions.create_form.description')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('factions.create_form.name_label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('factions.create_form.name_placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('factions.create_form.tag_label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('factions.create_form.tag_placeholder')} {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('factions.create_form.desc_label')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('factions.create_form.desc_placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? t('factions.create_form.submitting_button') : t('factions.create_button')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
