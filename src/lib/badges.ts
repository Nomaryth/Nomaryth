import { User } from 'firebase/auth';
import { differenceInDays, differenceInMonths } from 'date-fns';
import { Award, ShieldCheck, Gem, UserPlus, Calendar, Languages } from 'lucide-react';
import type { UserProfile } from '@/lib/types';

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  secret?: boolean;
  isUnlocked: (user: UserProfile, firebaseUser: User | null) => boolean;
}

export const badgeRegistry: Record<string, Badge> = {
  verified: {
    id: 'verified',
    title: 'Verified User',
    description: "This user's email has been verified.",
    icon: ShieldCheck,
    isUnlocked: (profile, firebaseUser) => !!firebaseUser?.emailVerified,
  },
  profile_complete: {
    id: 'profile_complete',
    title: 'Known Explorer',
    description: 'Filled out display name and bio.',
    icon: Award,
    isUnlocked: (profile) => !!profile.displayName && !!profile.bio,
  },
  pioneer: {
    id: 'pioneer',
    title: 'Pioneer',
    description: 'Registered in the first month of the project.',
    icon: UserPlus,
    isUnlocked: (profile) => {
        if (!profile.createdAt) return false;
        const projectStartDate = new Date('2025-07-01');
        const registrationDate = new Date(profile.createdAt.seconds * 1000);
        return differenceInMonths(registrationDate, projectStartDate) < 1;
    },
  },
  veteran: {
    id: 'veteran',
    title: 'Ancient Sage',
    description: 'This account is over a year old.',
    icon: Calendar,
    secret: true,
    isUnlocked: (profile) => {
        if (!profile.createdAt) return false;
        const registrationDate = new Date(profile.createdAt.seconds * 1000);
        return differenceInDays(new Date(), registrationDate) > 365;
    },
  },
   polyglot: {
    id: 'polyglot',
    title: 'Polyglot',
    description: 'Has used the platform in more than one language.',
    icon: Languages,
    secret: true,
    isUnlocked: (profile) => {
        return profile.language === 'pt';
    }
  }
};

export function getAutomaticallyUnlockedBadges(profile: UserProfile, firebaseUser: User | null): string[] {
  return Object.values(badgeRegistry)
    .filter(badge => !badge.secret && badge.isUnlocked(profile, firebaseUser))
    .map(badge => badge.id);
}
