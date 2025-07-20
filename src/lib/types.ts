export interface UserProfile {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  role?: string;
  location?: string;
  bio?: string;
  theme?: 'light' | 'dark' | 'system';
  language?: 'en' | 'pt';
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  };
  lastLoginAt?: {
    seconds: number;
    nanoseconds: number;
  };
  badges?: string[];
  factionId?: string | null;
  factionTag?: string | null;
}

export interface Faction {
  id: string;
  name: string;
  tag: string;
  description?: string;
  ownerUid: string;
  ownerName: string;
  memberCount: number;
  recruitmentMode: 'open' | 'application';
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}

export interface FactionMember {
    uid: string;
    role: 'owner' | 'officer' | 'member';
    joinedAt: {
        seconds: number;
        nanoseconds: number;
    };
}

export interface FactionMemberProfile {
    uid: string;
    role: 'owner' | 'officer' | 'member';
    displayName: string;
    photoURL: string;
}

export interface FactionApplication {
    uid: string;
    displayName: string;
    photoURL: string;
    appliedAt: {
        seconds: number;
        nanoseconds: number;
    };
}