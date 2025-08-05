'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/context/i18n-context";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { signOut, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, onSnapshot, Unsubscribe, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AvatarSelector } from "@/components/avatar-selector";
import { Pen, LayoutDashboard, Swords } from "lucide-react";
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { badgeRegistry, Badge as BadgeType, getAutomaticallyUnlockedBadges } from "@/lib/badges";
import type { UserProfile } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { locations } from "@/lib/locations";


function ProfilePageContent() {
  const { t, setLanguage, language } = useTranslation();
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  const [profile, setProfile] = useState<UserProfile>({
    uid: '',
    displayName: '',
    bio: '',
    location: '',
    photoURL: '',
    theme: 'dark',
    language: 'en',
    email: '',
    badges: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const profileUnsubscribe = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    if (user && db) {
      if (profileUnsubscribe.current) {
        profileUnsubscribe.current();
      }

      const unsub = onSnapshot(doc(db, "users", user.uid), async (docSnapshot) => {
         let currentProfile: UserProfile;

         if (docSnapshot.exists()) {
             const data = docSnapshot.data() as Omit<UserProfile, 'uid'>;
             currentProfile = {
                uid: user.uid,
                displayName: data.displayName || user.displayName || '',
                bio: data.bio || '',
                location: data.location || '',
                photoURL: data.photoURL || `https://avatar.vercel.sh/${user.uid}.png`,
                theme: data.theme || 'dark',
                language: data.language || 'en',
                email: data.email || user.email || '',
                role: data.role,
                badges: data.badges || [],
                createdAt: data.createdAt,
                factionId: data.factionId,
                factionTag: data.factionTag,
             };
         } else {
             currentProfile = {
                uid: user.uid,
                displayName: user.displayName || '',
                bio: '',
                location: '',
                photoURL: user.photoURL || `https://avatar.vercel.sh/${user.uid}.png`,
                theme: 'dark',
                language: 'en',
                email: user.email || '',
                role: 'user',
                badges: [],
             };
         }

         const autoBadges = getAutomaticallyUnlockedBadges(currentProfile, user);
         const currentBadges = new Set(currentProfile.badges);
         const newBadges = autoBadges.filter(b => !currentBadges.has(b));

         if (newBadges.length > 0) {
            const updatedBadges = [...currentBadges, ...newBadges];
            currentProfile.badges = updatedBadges;
            
            if (db) {
                await setDoc(doc(db, "users", user.uid), { badges: updatedBadges }, { merge: true });
                
                const notificationsRef = collection(db, 'users', user.uid, 'notifications');
                for (const badgeId of newBadges) {
                    const badge = badgeRegistry[badgeId];
                    if (badge) {
                        await addDoc(notificationsRef, {
                            title: t('notifications.badge_unlocked', { badgeName: badge.title }),
                            message: badge.description,
                            type: 'badge',
                            isRead: false,
                            timestamp: serverTimestamp(),
                        });
                    }
                }
            }
         }
         
         setProfile(currentProfile);
      });

      profileUnsubscribe.current = unsub;
      return () => unsub();
    }
  }, [user, toast, t]);

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/');
  };

  const handleProfileChange = (field: keyof Omit<UserProfile, 'photoURL' | 'theme' | 'language' | 'email' | 'role' | 'uid' | 'badges' | 'createdAt' | 'lastLoginAt' | 'location' | 'factionId' | 'factionTag'>, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSettingsChange = (field: 'theme' | 'language' | 'location', value: string) => {
      if (field === 'theme') {
          setTheme(value as 'light' | 'dark' | 'system');
      }
      if (field === 'language') {
          setLanguage(value as 'en' | 'pt');
      }
      setProfile(prev => ({...prev, [field]: value as any}));
  }

  const handleAvatarSelect = async (url: string) => {
     if (!auth.currentUser || !db) return;
     try {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const updateData = { photoURL: url };
        
        await setDoc(userRef, updateData, { merge: true });
        await updateProfile(auth.currentUser, { photoURL: url });

        setProfile(prev => ({...prev, photoURL: url}));
        toast({
            title: t('profile.avatar_success_title'),
            description: t('profile.avatar_success_description'),
        });
     } catch (error) {
        console.error("Error saving avatar:", error);
        toast({
            variant: "destructive",
            title: t('profile.save_error_title'),
            description: t('profile.save_error_description'),
        });
     }
  }

  const handleSave = async () => {
    if (!auth.currentUser || !db) return;
    setIsSaving(true);
    try {
        const userRef = doc(db, "users", auth.currentUser.uid);

        if (auth.currentUser.displayName !== profile.displayName) {
            await updateProfile(auth.currentUser, { 
              displayName: profile.displayName
            });
        }
        
        const updateData = {
            displayName: profile.displayName,
            bio: profile.bio,
            location: profile.location,
            theme: profile.theme,
            language: profile.language,
        };
        
        await setDoc(userRef, updateData, { merge: true });
        
        toast({
            title: t('profile.save_success_title'),
            description: t('profile.save_success_description'),
        });

    } catch (error) {
        console.error("Error saving profile:", error);
        const errorMessage = error instanceof Error ? error.message : t('profile.save_error_description');
        toast({
            variant: "destructive",
            title: t('profile.save_error_title'),
            description: errorMessage,
        });
    } finally {
        setIsSaving(false);
    }
  };

  const unlockedBadgeIds = useMemo(() => new Set(profile.badges || []), [profile.badges]);

  if (loading || !user) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
          <div className="animate-pulse w-full max-w-4xl">
            <div className="h-8 w-48 bg-muted rounded mb-6"></div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-1 space-y-8">
                <Card>
                  <CardHeader className="items-center text-center p-6">
                    <div className="h-24 w-24 rounded-full bg-muted mb-4"></div>
                    <div className="h-6 w-32 bg-muted rounded"></div>
                    <div className="h-4 w-40 bg-muted rounded mt-2"></div>
                  </CardHeader>
                </Card>
                 <Card>
                    <CardHeader>
                        <div className="h-6 w-32 bg-muted rounded"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-10 w-full bg-muted rounded"></div>
                    </CardContent>
                 </Card>
              </div>
              <div className="md:col-span-2 space-y-8">
                 <Card>
                    <CardHeader>
                       <div className="h-6 w-40 bg-muted rounded"></div>
                       <div className="h-4 w-48 bg-muted rounded mt-2"></div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-0">
                        <div className="space-y-2">
                           <div className="h-4 w-20 bg-muted rounded"></div>
                           <div className="h-10 w-full bg-muted rounded"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 w-20 bg-muted rounded"></div>
                           <div className="h-10 w-full bg-muted rounded"></div>
                        </div>
                    </CardContent>
                 </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold font-headline mb-6">{t('profile.title')}</h1>
      <div className="grid md:grid-cols-3 gap-8">
        
        <div className="md:col-span-1 space-y-8">
          <Card>
            <CardHeader className="items-center text-center p-6">
              <div className="relative group">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={profile.photoURL} alt={profile.displayName || 'User'} />
                  <AvatarFallback>{profile.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <AvatarSelector onAvatarSelect={handleAvatarSelect}>
                   <div className="absolute inset-0 h-24 w-24 mb-4 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Pen className="h-8 w-8 text-white" />
                   </div>
                </AvatarSelector>
              </div>
              <div className="flex items-center gap-2">
                 <CardTitle className="text-xl">{profile.displayName || t('profile.username_value')}</CardTitle>
                  {profile.factionId && profile.factionTag && (
                    <Link href={`/factions/${profile.factionId}`}>
                       <Badge variant="secondary" className="text-lg font-bold cursor-pointer hover:bg-primary/20">{profile.factionTag}</Badge>
                    </Link>
                  )}
              </div>
              <CardDescription className="text-muted-foreground text-sm">{profile.email}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <p className="text-center text-muted-foreground text-sm min-h-[40px]">
                {profile.bio || t('profile.user_bio')}
              </p>
               {isAdmin && (
                  <Badge className="mt-2 block text-center w-fit mx-auto">{t('profile.admin.role')}</Badge>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
                <CardTitle>{t('profile.badges_title')}</CardTitle>
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
                          "p-2 rounded-md bg-secondary transition-colors",
                          isUnlocked ? "text-primary" : "text-muted-foreground/50"
                        )}>
                          <badge.icon className="h-6 w-6" />
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
            </CardContent>
          </Card>

           <Card>
              <CardHeader>
                  <CardTitle>{t('profile.world.title')}</CardTitle>
                  <CardDescription>{t('profile.world.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                  <Button asChild className="w-full">
                      <Link href="/factions">
                          <Swords className="mr-2 h-4 w-4" />
                          {t('profile.world.view_factions')}
                      </Link>
                  </Button>
              </CardContent>
            </Card>
          
          {isAdmin && (
            <Card>
                <CardHeader>
                    <CardTitle>{t('profile.admin.title')}</CardTitle>
                    <CardDescription>{t('profile.admin.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full">
                        <Link href="/admin">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            {t('profile.admin.button')}
                        </Link>
                    </Button>
                </CardContent>
            </Card>
          )}

           <Button variant="destructive" onClick={handleLogout} className="w-full">{t('profile.logout_button')}</Button>

        </div>

        <div className="md:col-span-2 space-y-8">
           <Card>
            <CardHeader>
              <CardTitle>{t('profile.account_info_title')}</CardTitle>
              <CardDescription>{t('profile.account_info_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">{t('profile.username_label')}</Label>
                <Input id="username" value={profile.displayName || ''} onChange={(e) => handleProfileChange('displayName', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">{t('profile.bio_label')}</Label>
                <Textarea id="bio" placeholder={t('profile.bio_placeholder')} value={profile.bio || ''} onChange={(e) => handleProfileChange('bio', e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('profile.settings_title')}</CardTitle>
              <CardDescription>{t('profile.settings_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label htmlFor="language">{t('profile.language_label')}</Label>
                <Select value={language} onValueChange={(value) => handleSettingsChange('language', value)}>
                    <SelectTrigger id="language">
                        <SelectValue placeholder={t('profile.language_placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="en">{t('profile.languages.en')}</SelectItem>
                        <SelectItem value="pt">{t('profile.languages.pt')}</SelectItem>
                    </SelectContent>
                </Select>
              </div>
               <div className="space-y-2">
                <Label htmlFor="theme">{t('profile.theme_label')}</Label>
                <Select value={theme || 'dark'} onValueChange={(value) => handleSettingsChange('theme', value)}>
                    <SelectTrigger id="theme">
                        <SelectValue placeholder={t('profile.theme_placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="light">{t('profile.themes.light')}</SelectItem>
                        <SelectItem value="dark">{t('profile.themes.dark')}</SelectItem>
                        <SelectItem value="system">{t('profile.themes.system')}</SelectItem>
                    </SelectContent>
                </Select>
              </div>
               <div className="space-y-2 sm:col-span-2">
                 <Label htmlFor="location">{t('profile.location_label')}</Label>
                  <Select value={profile.location} onValueChange={(value) => handleSettingsChange('location', value)}>
                      <SelectTrigger id="location">
                          <SelectValue placeholder={t('profile.location_placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                          {locations.map((loc) => (
                              <SelectItem key={loc.id} value={loc.name}>
                                {loc.name}, {loc.country}
                              </SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? t('profile.saving_button') : t('profile.save_button')}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function ProfilePage() {
    return <ProfilePageContent />;
}
