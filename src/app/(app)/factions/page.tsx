'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2, Users, Shield, Crown } from 'lucide-react';
import { Particles } from '@/components/particles';
import { useAuth } from '@/context/auth-context';
import type { Faction } from '@/lib/types';
import { CreateFactionDialog } from '@/components/create-faction-dialog';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useTranslation } from '@/context/i18n-context';

const FactionListSkeleton = () => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
             <Card key={i} className="bg-card/50 border-border/30 backdrop-blur-sm animate-pulse">
                <CardHeader>
                    <div className="h-6 w-3/4 bg-muted rounded"></div>
                    <div className="h-4 w-1/2 bg-muted rounded mt-2"></div>
                </CardHeader>
                <CardContent>
                    <div className="h-10 w-full bg-muted rounded"></div>
                     <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                           <div className="h-4 w-4 bg-muted rounded-full"></div>
                           <div className="h-4 w-10 bg-muted rounded"></div>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="h-4 w-4 bg-muted rounded-full"></div>
                           <div className="h-4 w-16 bg-muted rounded"></div>
                        </div>
                    </div>
                </CardContent>
             </Card>
        ))}
    </div>
)


export default function FactionsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const [factions, setFactions] = useState<Faction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchFactions = useCallback(async () => {
    setLoading(true);
    try {
        const response = await fetch('/api/factions');
        if (!response.ok) throw new Error('Failed to fetch factions');
        const data = await response.json();
        setFactions(data);
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFactions();
  }, [fetchFactions]);

  const handleFactionCreated = (newFaction: Faction) => {
    
    fetchFactions(); 
  };

  return (
    <>
    <div className="relative container mx-auto py-12 px-4 min-h-[calc(100vh-8rem)]">
        <Particles
            className="absolute inset-0 -z-10"
            quantity={100}
            color="hsl(var(--primary))"
            ease={80}
        />
        
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-4xl font-bold font-headline text-primary">{t('factions.page_title')}</h1>
                <p className="text-muted-foreground mt-1">{t('factions.page_subtitle')}</p>
            </div>
            <Button onClick={() => setIsCreateOpen(true)} disabled={authLoading || !user || !!profile?.factionId}>
                <PlusCircle className="mr-2 h-5 w-5" />
                {t('factions.create_button')}
            </Button>
        </div>

        {loading ? (
            <FactionListSkeleton />
        ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {factions.map(faction => (
                    <Link key={faction.id} href={`/factions/${faction.id}`} className="block hover:scale-105 transition-transform duration-200">
                        <Card className="bg-card/50 border-border/30 backdrop-blur-sm flex flex-col h-full cursor-pointer">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xl font-headline text-primary">{faction.name}</CardTitle>
                                    <Badge variant="secondary" className="text-base font-bold">{faction.tag}</Badge>
                                </div>
                                <CardDescription className="h-10 line-clamp-2">{faction.description || t('factions.no_description')}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow flex flex-col justify-end">
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2" title={t('factions.members')}>
                                        <Users className="h-4 w-4" />
                                        <span>{faction.memberCount} {t('factions.members_count')}</span>
                                    </div>
                                    <div className="flex items-center gap-2" title={t('factions.founder')}>
                                        <Crown className="h-4 w-4 text-amber-400" />
                                        <span>{faction.ownerName}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
                 {factions.length === 0 && (
                    <div className="col-span-full text-center py-16 bg-card/30 rounded-lg">
                        <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">{t('factions.no_factions_title')}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{t('factions.no_factions_desc')}</p>
                    </div>
                )}
            </div>
        )}
    </div>
    
    <CreateFactionDialog 
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onFactionCreated={handleFactionCreated}
    />
    </>
  );
}
