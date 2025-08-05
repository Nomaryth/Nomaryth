'use client';

import type { UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { badgeRegistry, Badge as BadgeType } from '@/lib/badges';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/i18n-context';

export function PublicProfileClientPage({ profile }: { profile: UserProfile }) {
  const { t } = useTranslation();
  const unlockedBadgeIds = useMemo(() => new Set(profile.badges || []), [profile.badges]);

  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <div className="flex flex-col items-center text-center">
        <Avatar className="h-32 w-32 mb-4 border-4 border-primary/50">
          <AvatarImage src={profile.photoURL} alt={profile.displayName || 'User'} />
          <AvatarFallback>{profile.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-2">
            <h1 className="text-4xl font-bold font-headline">{profile.displayName}</h1>
             {profile.factionId && profile.factionTag && (
                <Link href={`/factions/${profile.factionId}`}>
                    <Badge variant="secondary" className="text-xl font-bold cursor-pointer hover:bg-primary/20">{profile.factionTag}</Badge>
                </Link>
             )}
        </div>

        {profile.role === 'admin' && (
          <Badge className="mt-2">{t('profile.admin.role')}</Badge>
        )}
        <p className="text-muted-foreground mt-4 max-w-md">
          {profile.bio || t('profile.public_bio_placeholder')}
        </p>
      </div>

      <div className="mt-12">
        <Card>
            <CardHeader>
                <CardTitle>{t('profile.badges_title')}</CardTitle>
                <CardDescription>{t('profile.public_badges_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <TooltipProvider>
                {Object.values(badgeRegistry).map((badge: BadgeType) => {
                  const isUnlocked = unlockedBadgeIds.has(badge.id);
                  if (badge.secret && !isUnlocked) return null;

                  return (
                    <Tooltip key={badge.id}>
                      <TooltipTrigger>
                        <div className={cn(
                          "p-3 rounded-md bg-secondary transition-all",
                          isUnlocked ? "text-primary ring-2 ring-primary/50" : "text-muted-foreground/30"
                        )}>
                          <badge.icon className="h-8 w-8" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-bold">{badge.title}</p>
                        <p>{badge.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
               </TooltipProvider>
                 {unlockedBadgeIds.size === 0 && (
                  <p className="text-muted-foreground text-sm">{t('profile.no_badges_yet')}</p>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
