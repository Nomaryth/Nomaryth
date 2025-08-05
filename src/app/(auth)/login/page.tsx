'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Chrome, TriangleAlert } from "lucide-react";
import { useTranslation } from "@/context/i18n-context";
import { auth, db, isFirebaseConfigured, getMissingConfigVars } from '@/lib/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
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

async function setupGoogleUser(user: User) {
    if (!db) return;
    
    try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            await updateUserLastLogin(user);
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
            };
            await setDoc(userDocRef, profileData);
        }
    } catch (error) {
        console.error('Error setting up Google user:', error);
        throw error;
    }
}

function LoginPageContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(false);
  const [missingVars, setMissingVars] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const configured = !!(auth && db);
    setIsFirebaseConfigured(configured);
    if (!configured) {
      setMissingVars(getMissingConfigVars());
    }
  }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await updateUserLastLogin(userCredential.user);
      toast({
        title: t('login.success_title'),
        description: t('login.success_description'),
      });
      router.push('/profile');
    } catch (err: any) {
      setError(t(`firebase_errors.${err.code}` as any) || t('login.generic_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
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
      
      console.log('Iniciando Google Sign-In...');
      const result = await signInWithPopup(auth, provider);
      console.log('Google Sign-In bem-sucedido:', result.user.email);
      
      await setupGoogleUser(result.user);

      toast({
        title: t('login.success_title'),
        description: t('login.success_description'),
      });
      router.push('/profile');
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      
      let errorMessage = t('login.generic_error');
      
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Login cancelado pelo usuário.';
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Pop-up bloqueado pelo navegador. Permita pop-ups para este site.';
      } else if (err.code === 'auth/unauthorized-domain') {
        errorMessage = 'Domínio não autorizado. Verifique as configurações do Firebase.';
      } else if (err.code === 'auth/internal-error') {
        errorMessage = 'Erro interno do Firebase. Verifique sua conexão e tente novamente.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Erro de rede. Verifique sua conexão com a internet.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage = 'Login com Google não está habilitado.';
      } else if (err.code) {
        errorMessage = t(`firebase_errors.${err.code}` as any) || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">{t('login.title')}</CardTitle>
          <CardDescription>
            {t('login.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error && (
            <Alert variant="destructive">
              <TriangleAlert className="h-4 w-4" />
              <AlertTitle>{t('login.error_title')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
           {!isFirebaseConfigured && (
            <Alert variant="destructive">
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
          <form onSubmit={handleEmailLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">{t('login.email_label')}</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isFirebaseConfigured || isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">{t('login.password_label')}</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!isFirebaseConfigured || isSubmitting}
              />
            </div>
             <Button type="submit" className="w-full" disabled={!isFirebaseConfigured || isSubmitting}>
                {isSubmitting ? t('login.signing_in_button') : t('login.signin_button')}
            </Button>
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                {t('login.or_continue_with')}
              </span>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={!isFirebaseConfigured || isSubmitting}>
            <Chrome className="mr-2 h-4 w-4" />
            {t('login.google_signin')}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            {t('login.no_account')}{" "}
            <Link href="/signup" className="text-primary hover:underline">
              {t('login.signup_link')}
            </Link>
          </p>
        </CardFooter>
      </Card>
  );
}

export default function LoginPage() {
  return <LoginPageContent />;
}
