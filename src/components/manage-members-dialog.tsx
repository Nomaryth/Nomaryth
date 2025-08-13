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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/context/auth-context';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Crown, X, Check, ThumbsUp, ThumbsDown } from 'lucide-react';
import type { Faction, FactionMemberProfile, FactionApplication } from '@/lib/types';
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from './ui/separator';
import { useTranslation } from '@/context/i18n-context';

interface ManageMembersDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    faction: Faction & { members: FactionMemberProfile[], applications?: FactionApplication[] };
    onUpdate: () => void;
}

export function ManageMembersDialog({ isOpen, onOpenChange, faction, onUpdate }: ManageMembersDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loadingAction, setLoadingAction] = useState<string | null>(null); 

  const handleOwnerAction = async (action: 'kick' | 'transfer_ownership' | 'set_recruitment_mode', payload: { targetUid?: string, value?: any }) => {
    if (!user || user.uid !== faction.ownerUid) {
      toast({ variant: 'destructive', title: t('common.not_authorized') });
      return;
    }
    const loadingKey = payload.targetUid ? `${action}-${payload.targetUid}` : action;
    setLoadingAction(loadingKey);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`/api/factions/${faction.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
        body: JSON.stringify({ action, ...payload }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || t('factions.errors.generic_action_failed'));
      toast({ title: t('common.success'), description: result.message });
      onUpdate();
    } catch (error) {
      toast({ variant: 'destructive', title: t('common.error'), description: error instanceof Error ? error.message : t('factions.errors.generic_action_failed') });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleApplicationAction = async (action: 'approve_application' | 'reject_application', targetUid: string) => {
     if (!user || user.uid !== faction.ownerUid) {
      toast({ variant: 'destructive', title: t('common.not_authorized') });
      return;
    }
    const loadingKey = `${action}-${targetUid}`;
    setLoadingAction(loadingKey);
    try {
        const idToken = await user.getIdToken();
        const response = await fetch(`/api/factions/${faction.id}/applications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}`},
            body: JSON.stringify({ action, targetUid }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        toast({ title: t('common.success'), description: result.message });
        onUpdate();
    } catch (error) {
        toast({ variant: 'destructive', title: t('common.error'), description: error instanceof Error ? error.message : t('factions.errors.generic_action_failed') });
    } finally {
        setLoadingAction(null);
    }
  }

  const membersToManage = faction.members.filter(m => m.uid !== faction.ownerUid);
  const applications = faction.applications || [];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('factions.manage_dialog.title')}</DialogTitle>
          <DialogDescription>
            {t('factions.manage_dialog.description')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto -mx-6 px-6 space-y-6 pt-4">
            
            {applications.length > 0 && (
                <div className="space-y-3">
                     <h4 className="font-semibold text-foreground">{t('factions.manage_dialog.pending_applications', { count: applications.length })}</h4>
                      {applications.map(app => (
                        <div key={app.uid} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={app.photoURL || ''} alt={app.displayName || 'User'} />
                                    <AvatarFallback>{(app.displayName || 'U').charAt(0)}</AvatarFallback>
                                </Avatar>
                                <p className="font-semibold">{app.displayName || 'Unknown'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="ghost" className="text-green-500 hover:text-green-500 hover:bg-green-500/10" disabled={!!loadingAction} onClick={() => handleApplicationAction('approve_application', app.uid)}>
                                    <ThumbsUp className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-500 hover:bg-red-500/10" disabled={!!loadingAction} onClick={() => handleApplicationAction('reject_application', app.uid)}>
                                    <ThumbsDown className="h-4 w-4" />
                                </Button>
                                 {loadingAction && (loadingAction.endsWith(app.uid)) && <Loader2 className="h-4 w-4 animate-spin"/>}
                            </div>
                        </div>
                    ))}
                    <Separator />
                </div>
            )}
            
            <div className="space-y-3">
                <h4 className="font-semibold text-foreground">{t('factions.manage_dialog.members_title', { count: membersToManage.length })}</h4>
                {membersToManage.length > 0 ? membersToManage.map(member => (
                    <div key={member.uid} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={member.photoURL} alt={member.displayName} />
                                <AvatarFallback>{member.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{member.displayName}</p>
                                <span className="text-xs text-muted-foreground capitalize">{member.role}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button size="icon" variant="ghost" className="h-8 w-8" disabled={!!loadingAction}>
                                        <Crown className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                     <AlertDialogHeader>
                                     <AlertDialogTitle>{t('factions.manage_dialog.transfer_confirm_title')}</AlertDialogTitle>
                                     <AlertDialogDescription>
                                       <span dangerouslySetInnerHTML={{ __html: t('factions.manage_dialog.transfer_confirm_desc', { memberName: member.displayName }) }} />
                                     </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleOwnerAction('transfer_ownership', { targetUid: member.uid })}>{t('factions.manage_dialog.confirm_transfer_button')}</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8" disabled={!!loadingAction}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                     <AlertDialogHeader>
                                     <AlertDialogTitle>{t('factions.manage_dialog.kick_confirm_title', { memberName: member.displayName })}</AlertDialogTitle>
                                     <AlertDialogDescription>
                                       <span dangerouslySetInnerHTML={{ __html: t('factions.manage_dialog.kick_confirm_desc', { memberName: member.displayName }) }} />
                                     </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleOwnerAction('kick', { targetUid: member.uid })} className="bg-destructive hover:bg-destructive/80">{t('factions.manage_dialog.confirm_kick_button')}</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            {loadingAction && (loadingAction.endsWith(member.uid)) && <Loader2 className="h-4 w-4 animate-spin"/>}
                        </div>
                    </div>
                )) : (
                    <p className="text-center text-muted-foreground pt-4">{t('factions.manage_dialog.no_other_members')}</p>
                )}
                <Separator />
            </div>

            <div className="space-y-4">
                <h4 className="font-semibold text-foreground">{t('factions.manage_dialog.recruitment_title')}</h4>
                <div className="flex items-center space-x-2">
                    <Switch
                        id="recruitment-mode"
                        checked={faction.recruitmentMode === 'application'}
                        onCheckedChange={(checked) => handleOwnerAction('set_recruitment_mode', { value: checked })}
                        disabled={loadingAction === 'set_recruitment_mode'}
                    />
                    <Label htmlFor="recruitment-mode">{t('factions.manage_dialog.recruitment_by_application')}</Label>
                    {loadingAction === 'set_recruitment_mode' && <Loader2 className="h-4 w-4 animate-spin"/>}
                </div>
                <p className="text-sm text-muted-foreground">
                    {t('factions.manage_dialog.recruitment_desc')}
                </p>
            </div>
        </div>
        <DialogFooter className="mt-auto pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
