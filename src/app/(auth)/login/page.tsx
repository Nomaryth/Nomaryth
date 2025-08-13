'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Chrome, Github, TriangleAlert, Zap, Star } from "lucide-react";
import Image from 'next/image';
import LogoPng from '../../../../assets/Noma1ColorIcon.png';
import { useTranslation } from "@/context/i18n-context";
import { auth, db, getMissingConfigVars } from '@/lib/firebase';
import { GoogleAuthProvider, GithubAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc, serverTimestamp, getDoc, collection, addDoc } from 'firebase/firestore';
import { generateAvatar } from '@/ai/flows/generate-avatar-flow';

const updateUserLastLogin = async (user: User) => {
    if (!db) return;
    const userDocRef = doc(db, "users", user.uid);
    try {
        await setDoc(userDocRef, { lastLoginAt: serverTimestamp() }, { merge: true });
    } catch (error) {
        console.error("Failed to update last login time:", error);
    }
};

async function createWelcomeNotification(userId: string) {
    if (!db) return;
    try {
        const notificationsRef = collection(db, 'users', userId, 'notifications');
        await addDoc(notificationsRef, {
            title: 'Welcome to Nomaryth!',
            message: 'Your journey begins now. Explore the world and forge your destiny.',
            type: 'welcome',
            isRead: false,
            timestamp: serverTimestamp(),
        });
    } catch (error) {
        console.error("Failed to create welcome notification:", error);
    }
}

async function setupOAuthUser(user: User, provider: 'google' | 'github') {
    if (!db) return;
    
    try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            await updateUserLastLogin(user);
            const providerData = {
              email: user.email || undefined,
              displayName: user.displayName || undefined,
              photoURL: user.photoURL || undefined,
              linkedAt: serverTimestamp(),
            };
            await setDoc(
              userDocRef,
              {
                lastLoginAt: serverTimestamp(),
                linkedProviders: {
                  [provider]: providerData,
                },
              },
              { merge: true }
            );
        } else {
            let avatarUrl = '';
            try {
                const avatarResult = await generateAvatar({ seed: user.displayName || user.uid });
                avatarUrl = avatarResult.url;
            } catch (avatarError) {
                console.error('Error generating avatar:', avatarError);
                avatarUrl = `https://api.dicebear.com/8.x/adventurer/svg?seed=${encodeURIComponent(user.uid)}`;
            }
            
            const profileData = {
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                photoURL: avatarUrl,
                role: 'user',
                createdAt: serverTimestamp(),
                lastLoginAt: serverTimestamp(),
                bio: '',
                location: '',
                theme: 'dark',
                language: 'en',
                badges: [],
                primaryProvider: provider,
                linkedProviders: {
                  [provider]: {
                    email: user.email || undefined,
                    displayName: user.displayName || undefined,
                    photoURL: avatarUrl,
                    linkedAt: serverTimestamp(),
                  },
                },
            };
            await setDoc(userDocRef, profileData);
            await createWelcomeNotification(user.uid);
        }
    } catch (error) {
        console.error(`Error setting up ${provider} user:`, error);
        throw error;
    }
}

function LoginPageContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(false);
  const [missingVars, setMissingVars] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState<{
    totalUsers: number;
    activeFactions: number;
    totalNews: number;
    worldProgress: number;
    monthlyGrowth?: number;
    targetAchieved?: number;
  } | null>(null);
  const [recentAvatars, setRecentAvatars] = useState<string[]>([]);

  useEffect(() => {
    const configured = !!(auth && db);
    setIsFirebaseConfigured(configured);
    if (!configured) {
      setMissingVars(getMissingConfigVars());
    }
    fetch('/api/public/stats')
      .then(async (res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setStats({
          totalUsers: Number(data.totalUsers) || 0,
          activeFactions: Number(data.activeFactions) || 0,
          totalNews: Number(data.totalNews) || 0,
          worldProgress: Number(data.worldProgress) || 0,
          monthlyGrowth: Number(data.monthlyGrowth) || 0,
          targetAchieved: Number(data.targetAchieved) || 0,
        });
      })
      .catch(() => {});

    fetch('/api/public/users/recent')
      .then(async (res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data || !Array.isArray(data.users)) return;
        const urls = data.users
          .map((u: any) => (typeof u?.photoURL === 'string' ? u.photoURL : null))
          .filter(Boolean) as string[];
        setRecentAvatars(urls.slice(0, 5));
      })
      .catch(() => {});
  }, []);

  const handleGoogleAuth = async () => {
    if (!auth || !db || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      
      await setupOAuthUser(result.user, 'google');

      toast({
        title: t('login.success_title'),
        description: t('login.success_description'),
      });
      router.push('/profile');
    } catch (err: unknown) {
      console.error('Google Auth error:', err);
      
      let errorMessage = t('login.generic_error');
      
      if (err && typeof err === 'object' && 'code' in err && typeof err.code === 'string') {
        const errorCode = err.code;
        if (errorCode === 'auth/popup-closed-by-user') {
          errorMessage = 'Login cancelado pelo usuário.';
        } else if (errorCode === 'auth/popup-blocked') {
          errorMessage = 'Pop-up bloqueado pelo navegador. Permita pop-ups para este site.';
        } else if (errorCode === 'auth/unauthorized-domain') {
          errorMessage = 'Domínio não autorizado. Verifique as configurações do Firebase.';
        } else if (errorCode === 'auth/internal-error') {
          errorMessage = 'Erro interno do Firebase. Verifique sua conexão e tente novamente.';
        } else if (errorCode === 'auth/network-request-failed') {
          errorMessage = 'Erro de rede. Verifique sua conexão com a internet.';
        } else if (errorCode === 'auth/operation-not-allowed') {
          errorMessage = 'Login com Google não está habilitado.';
        } else {
          errorMessage = t(`firebase_errors.${errorCode}` as keyof typeof t) || errorMessage;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGitHubAuth = async () => {
    if (!auth || !db || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    
    try {
      const provider = new GithubAuthProvider();
      provider.addScope('read:user');
      provider.addScope('user:email');
      
      const result = await signInWithPopup(auth, provider);
      
      await setupOAuthUser(result.user, 'github');

      toast({
        title: t('login.success_title'),
        description: t('login.success_description'),
      });
      router.push('/profile');
    } catch (err: unknown) {
      console.error('GitHub Auth error:', err);
      
      let errorMessage = t('login.generic_error');
      
      if (err && typeof err === 'object' && 'code' in err && typeof err.code === 'string') {
        const errorCode = err.code;
        if (errorCode === 'auth/popup-closed-by-user') {
          errorMessage = 'Login cancelado pelo usuário.';
        } else if (errorCode === 'auth/popup-blocked') {
          errorMessage = 'Pop-up bloqueado pelo navegador. Permita pop-ups para este site.';
        } else if (errorCode === 'auth/unauthorized-domain') {
          errorMessage = 'Domínio não autorizado. Verifique as configurações do Firebase.';
        } else if (errorCode === 'auth/internal-error') {
          errorMessage = 'Erro interno do Firebase. Verifique sua conexão e tente novamente.';
        } else if (errorCode === 'auth/network-request-failed') {
          errorMessage = 'Erro de rede. Verifique sua conexão com a internet.';
        } else if (errorCode === 'auth/operation-not-allowed') {
          errorMessage = 'Login com GitHub não está habilitado.';
        } else if (errorCode === 'auth/account-exists-with-different-credential') {
          errorMessage = 'Uma conta já existe com este email usando outro método de login.';
        } else {
          errorMessage = t(`firebase_errors.${errorCode}` as keyof typeof t) || errorMessage;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex">
      <div className="absolute inset-0 login-page-gradient" />
      <div className="flex-1 flex">
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-lg">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
                <Image src={LogoPng} alt="Nomaryth" className="h-10 w-10 object-contain" />
              </div>
              <h1 className="text-3xl font-headline font-bold text-foreground mb-3 gradient-text">
                {t('login.title')}
              </h1>
              <p className="text-base text-muted-foreground max-w-md mx-auto">
                {t('login.description')}
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6 max-w-md mx-auto">
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>{t('login.error_title')}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!isFirebaseConfigured && (
              <Alert variant="destructive" className="mb-6 max-w-md mx-auto">
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>Firebase Not Configured</AlertTitle>
                <AlertDescription>
                  <div className="space-y-2">
                    <p>Please configure your Firebase environment variables in `.env.local` to enable authentication.</p>
                    {missingVars.length > 0 && (
                      <div>
                        <p className="font-semibold">Missing variables:</p>
                        <ul className="list-disc list-inside text-sm">
                          {missingVars.map((varName) => (
                            <li key={varName}>{varName}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4 max-w-md mx-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full h-12 text-base font-medium login-button-hover bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 hover:border-primary/40 hover:from-primary/10 hover:to-primary/20"
                onClick={handleGoogleAuth}
                disabled={!isFirebaseConfigured || isSubmitting}
              >
                <Chrome className="mr-3 h-5 w-5" />
                {isSubmitting ? t('login.signing_in_button') : t('login.google_signin')}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="w-full h-12 text-base font-medium login-button-hover bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 hover:border-primary/40 hover:from-primary/10 hover:to-primary/20"
                onClick={handleGitHubAuth}
                disabled={!isFirebaseConfigured || isSubmitting}
              >
                <Github className="mr-3 h-5 w-5" />
                {isSubmitting ? t('login.signing_in_button') : t('login.github_signin')}
              </Button>
            </div>

            <div className="mt-8 text-center max-w-md mx-auto">
              <p className="text-sm text-muted-foreground">
                {t('login.no_account')}{" "}
                <span className="text-primary font-medium">{t('login.auto_account_hint')}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex fancy-divider-y mx-0" />

        <div className="hidden lg:flex flex-1 relative overflow-hidden blobs-animated-dark-gold">
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background/60" />
          <div className="relative z-10 flex flex-col justify-center w-full max-w-3xl mx-auto p-12 gap-10">
            <div className="grid grid-cols-2 gap-6 items-start">
              <div>
                <div className="text-2xl font-bold">{(stats?.totalUsers ?? 0).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">{t('login.info.users_label')}</div>
                {typeof stats?.monthlyGrowth === 'number' && (
                  <div className="text-[11px] text-accent mt-1">{t('login.info.growth_this_month', { value: Math.max(0, Math.min(100, stats?.monthlyGrowth ?? 0)) })}</div>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{(stats?.activeFactions ?? 0).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">{t('login.info.factions_label')}</div>
                {typeof stats?.targetAchieved === 'number' && (
                  <div className="text-[11px] text-accent mt-1">{t('login.info.target_achieved', { value: Math.max(0, Math.min(100, stats?.targetAchieved ?? 0)) })}</div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="h-2 w-full rounded-full bg-accent/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
                  style={{ width: `${Math.max(0, Math.min(100, stats?.worldProgress ?? 0))}%` }}
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {(recentAvatars.length ? recentAvatars : [
                    '/og-image.png',
                    '/social-preview/banner.png',
                    '/favicon.ico'
                  ]).map((src, idx) => (
                    <div key={idx} className="h-9 w-9 rounded-full ring-2 ring-background overflow-hidden bg-muted">
                      <img src={src} alt={`avatar ${idx+1}`} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
                
              </div>
            </div>

            <div className="bg-card/70 backdrop-blur-md rounded-2xl p-6 border animate-fadeIn">
              <div className="flex items-center justify-center mb-4">
                <Star className="w-5 h-5 text-primary mr-2" />
                <h3 className="text-lg font-semibold">{t('login.info.start_title')}</h3>
              </div>
              <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto">{t('login.info.start_desc')}</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border bg-card/70 backdrop-blur-sm p-4 text-center">
                <div className="text-xl font-semibold">{(stats?.totalNews ?? 0).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">{t('login.info.news_label')}</div>
              </div>
              <div className="rounded-xl border bg-card/70 backdrop-blur-sm p-4 text-center">
                <div className="text-xl font-semibold">{(stats?.activeFactions ?? 0).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">{t('login.info.factions_label')}</div>
              </div>
              <div className="rounded-xl border bg-card/70 backdrop-blur-sm p-4 text-center">
                <div className="text-xl font-semibold">{Math.max(0, Math.min(100, stats?.worldProgress ?? 0))}%</div>
                <div className="text-xs text-muted-foreground">{t('login.info.progress_label')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <LoginPageContent />;
}