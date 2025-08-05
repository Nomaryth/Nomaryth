'use client';

import { useState, useEffect, useCallback } from 'react';
import { notFound, useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import type { Faction, FactionMemberProfile, FactionApplication } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, Loader2, Shield, Users, LogIn, LogOut, ShieldX, UserCog } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { ManageMembersDialog } from '@/components/manage-members-dialog';
import { useTranslation } from '@/context/i18n-context';

interface FactionDetails extends Faction {
  members: FactionMemberProfile[];
  applications?: FactionApplication[];
}

const FactionDetailsSkeleton = () => (
    <div className="container mx-auto py-12 px-4 animate-pulse">
        <div className="h-10 w-3/4 bg-muted rounded mb-2"></div>
        <div className="h-6 w-1/2 bg-muted rounded mb-8"></div>
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
                <Card>
                    <CardHeader><div className="h-6 w-32 bg-muted rounded"></div></CardHeader>
                    <CardContent><div className="h-20 w-full bg-muted rounded"></div></CardContent>
                </Card>
                 <Card>
                    <CardHeader><div className="h-6 w-40 bg-muted rounded"></div></CardHeader>
                    <CardContent className="space-y-4">
                        {[...Array(3)].map((_, i) => <div key={i} className="h-12 w-full bg-muted rounded"></div>)}
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-1 space-y-6">
                 <Card>
                    <CardHeader><div className="h-6 w-24 bg-muted rounded"></div></CardHeader>
                    <CardContent><div className="h-10 w-full bg-muted rounded"></div></CardContent>
                </Card>
            </div>
        </div>
    </div>
);


export default function FactionDetailPage() {
  const params = useParams();
  const factionId = params.id as string;
  const { user, profile, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();

  const [faction, setFaction] = useState<FactionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);

  const fetchFactionDetails = useCallback(async () => {
    if (!factionId) return;
    try {
      const fetchOptions: RequestInit = {};
      if (user) {
        const idToken = await user.getIdToken();
        fetchOptions.headers = { 'Authorization': `Bearer ${idToken}` };
      }
      
      const response = await fetch(`/api/factions/${factionId}`, fetchOptions);
      if (!response.ok) {
        if (response.status === 404) {
            toast({ variant: 'destructive', title: t('factions.not_found_title'), description: t('factions.not_found_desc') });
            router.push('/factions');
            return;
        };
        throw new Error(t('factions.errors.fetch_details_failed'));
      }
      const data = await response.json();
      setFaction(data);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: t('factions.errors.error_title'), description: t('factions.errors.fetch_details_failed') });
    } finally {
      setLoading(false);
    }
  }, [factionId, toast, router, user, t]);

  useEffect(() => {
    fetchFactionDetails();
  }, [fetchFactionDetails]);

  const handleJoinOrApply = async () => {
    if (!user) return;

    setActionLoading(true);
    try {
        const idToken = await user.getIdToken();
        const response = await fetch(`/api/factions/${factionId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${idToken}` }
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        toast({ title: result.title, description: result.description});
        await fetchFactionDetails(); 
    } catch (error) {
        const actionType = faction?.recruitmentMode === 'application' ? t('factions.apply') : t('factions.join');
        toast({ variant: 'destructive', title: t('factions.errors.action_failed_title'), description: error instanceof Error ? error.message : t('factions.errors.action_failed_desc') });
    } finally {
        setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
        const idToken = await user.getIdToken();
        const response = await fetch(`/api/factions/${factionId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${idToken}` }
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        toast({ title: t('factions.leave_success_title'), description: t('factions.leave_success_desc')});
        await fetchFactionDetails(); 
    } catch (error) {
        toast({ variant: 'destructive', title: t('factions.errors.leave_failed_title'), description: error instanceof Error ? error.message : t('factions.errors.leave_failed_desc') });
    } finally {
        setActionLoading(false);
    }
  }
  
  const handleDisband = async () => {
     if (!user || user.uid !== faction?.ownerUid) return;
     setActionLoading(true);
     try {
        const idToken = await user.getIdToken();
        const response = await fetch(`/api/factions/${factionId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${idToken}` }
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        toast({ title: t('factions.disband_success_title'), description: t('factions.disband_success_desc')});
        router.push('/factions');
     } catch(error) {
        toast({ variant: 'destructive', title: t('factions.errors.disband_failed_title'), description: error instanceof Error ? error.message : t('factions.errors.disband_failed_desc') });
     } finally {
        setActionLoading(false);
     }
  }
  
  const handleMemberUpdate = useCallback(() => {
    fetchFactionDetails();
    const stillOwner = faction?.ownerUid === user?.uid;
    if (!stillOwner) {
      setIsManageMembersOpen(false);
    }
  }, [fetchFactionDetails, faction?.ownerUid, user?.uid]);

  if (loading || authLoading) {
    return <FactionDetailsSkeleton />;
  }

  if (!faction) {
    
    return null;
  }

  const isOwner = user?.uid === faction.ownerUid;
  const isMember = faction.members.some(m => m.uid === user?.uid);
  const hasPendingApplication = faction.applications?.some(app => app.uid === user?.uid);
  const canJoinOrApply = user && !profile?.factionId && !hasPendingApplication;

  const joinButtonText = faction.recruitmentMode === 'application' ? t('factions.apply_button') : t('factions.join_button');
  const roleTranslations: { [key: string]: string } = {
    owner: t('factions.roles.owner'),
    member: t('factions.roles.member'),
    officer: t('factions.roles.officer')
  }

  return (
    <>
    <div className="container mx-auto py-12 px-4">
        <div className="mb-8">
            <div className="flex items-center gap-4">
                <Badge variant="secondary" className="text-2xl font-bold py-1">{faction.tag}</Badge>
                <h1 className="text-5xl font-bold font-headline text-primary">{faction.name}</h1>
            </div>
             <p className="text-lg text-muted-foreground mt-2 max-w-2xl">{faction.description || t('factions.no_description')}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="text-primary"/> {t('factions.members')} ({faction.memberCount})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {faction.members.map(member => (
                                <Link key={member.uid} href={`/users/${member.uid}`} className="block">
                                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                                    <Avatar>
                                        <AvatarImage src={member.photoURL} alt={member.displayName} />
                                        <AvatarFallback>{member.displayName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-sm">{member.displayName}</p>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                         {member.role === 'owner' && <Crown className="h-3 w-3 text-amber-400" />}
                                         <span>{roleTranslations[member.role] || member.role}</span>
                                        </div>
                                    </div>
                                </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
             <div className="md:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Shield className="text-primary" /> {t('factions.actions_title')}</CardTitle>
                    </CardHeader>
                     <CardContent className="space-y-4">
                       {user && (
                         <>
                            {isMember && !isOwner ? (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="secondary" className="w-full" disabled={actionLoading}>
                                            <LogOut className="mr-2" /> {t('factions.leave_faction_button')}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>{t('factions.leave_confirm_title')}</AlertDialogTitle>
                                        <AlertDialogDescription>
                                           {t('factions.leave_confirm_desc')}
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleLeave} disabled={actionLoading}>
                                            {actionLoading && <Loader2 className="mr-2 animate-spin" />}
                                            {t('factions.confirm_leave_button')}
                                        </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            ) : canJoinOrApply ? (
                                <Button className="w-full" onClick={handleJoinOrApply} disabled={actionLoading}>
                                     {actionLoading && <Loader2 className="mr-2 animate-spin" />}
                                    <LogIn className="mr-2" /> {joinButtonText}
                                </Button>
                            ) : hasPendingApplication ? (
                                <Button className="w-full" disabled>{t('factions.application_sent_button')}</Button>
                            ) : !isOwner && (
                                <Button className="w-full" disabled>{t('factions.already_in_faction_button')}</Button>
                            )}
                         </>
                       )}
                       {!user && (
                            <Button className="w-full" asChild>
                                <Link href="/login">{t('factions.login_to_interact')}</Link>
                            </Button>
                       )}

                       {isOwner && (
                        <div className="pt-4 border-t space-y-2">
                             <Button variant="outline" className="w-full" onClick={() => setIsManageMembersOpen(true)}>
                                <UserCog className="mr-2" /> {t('factions.manage_faction_button')}
                             </Button>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="w-full" disabled={actionLoading}>
                                        <ShieldX className="mr-2" /> {t('factions.disband_faction_button')}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>{t('factions.disband_confirm_title')}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {t('factions.disband_confirm_desc')}
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDisband} disabled={actionLoading} className="bg-destructive hover:bg-destructive/80">
                                         {actionLoading && <Loader2 className="mr-2 animate-spin" />}
                                        {t('factions.confirm_disband_button')}
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                       )}
                    </CardContent>
                </Card>
             </div>
        </div>
    </div>
    
    {isOwner && faction && (
        <ManageMembersDialog 
            isOpen={isManageMembersOpen}
            onOpenChange={setIsManageMembersOpen}
            faction={faction}
            onUpdate={handleMemberUpdate}
        />
    )}
    </>
  );
}
