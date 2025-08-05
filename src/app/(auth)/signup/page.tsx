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
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, sendEmailVerification, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc, serverTimestamp, getDoc, collection, addDoc } from 'firebase/firestore';
import { generateAvatar } from '@/ai/flows/generate-avatar-flow';

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

async function setupNewUser(user: User, username?: string) {
    if (!db) return;
    
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
        await setDoc(userDocRef, { lastLoginAt: serverTimestamp() }, { merge: true });
    } else {
        const { url: avatarUrl } = await generateAvatar({ seed: username || user.uid });
        const displayName = username || user.displayName;

        await updateProfile(user, { displayName, photoURL: avatarUrl });

        const profileData = {
            uid: user.uid,
            displayName: displayName,
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
        await createWelcomeNotification(user.uid);
        
        if(user.providerData.some(p => p.providerId === 'password')) {
           await sendEmailVerification(user);
        }
    }
}


function SignupPageContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsFirebaseConfigured(!!auth);
  }, []);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    if (password.length < 6) {
      setError(t('signup.password_too_short'));
      setIsSubmitting(false);
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setupNewUser(userCredential.user, username);

      toast({
        title: t('signup.success_title'),
        description: t('signup.verification_email_sent'),
      });
      router.push('/profile');
    } catch (err: any) {
      setError(t(`firebase_errors.${err.code}` as any) || t('signup.generic_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (!auth || !db || isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await setupNewUser(result.user);

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

  return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">{t('signup.title')}</CardTitle>
          <CardDescription>
            {t('signup.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error && (
            <Alert variant="destructive">
              <TriangleAlert className="h-4 w-4" />
              <AlertTitle>{t('signup.error_title')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
           {!isFirebaseConfigured && (
            <Alert variant="destructive">
              <TriangleAlert className="h-4 w-4" />
              <AlertTitle>{t('firebase.not_configured_title')}</AlertTitle>
              <AlertDescription>
                {t('firebase.not_configured_description')}
              </AlertDescription>
            </Alert>
          )}
          <Button variant="outline" className="w-full" onClick={handleGoogleSignup} disabled={!isFirebaseConfigured || isSubmitting}>
            <Chrome className="mr-2 h-4 w-4" />
            {t('login.google_signin')}
          </Button>
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
          <form onSubmit={handleEmailSignup} className="grid gap-4">
             <div className="grid gap-2">
              <Label htmlFor="username">{t('profile.username_label')}</Label>
              <Input 
                id="username" 
                type="text" 
                placeholder={t('profile.username_value')}
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={!isFirebaseConfigured || isSubmitting}
              />
            </div>
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
              {isSubmitting ? t('signup.signing_up_button') : t('signup.signup_button')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            {t('signup.have_account')}{" "}
            <Link href="/login" className="text-primary hover:underline">
              {t('signup.login_link')}
            </Link>
          </p>
        </CardFooter>
      </Card>
  );
}

export default function SignupPage() {
    return <SignupPageContent />
}
