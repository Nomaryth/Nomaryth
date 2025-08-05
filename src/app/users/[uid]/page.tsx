import { notFound } from 'next/navigation';
import { adminDb } from '@/lib/firebase-admin';
import type { UserProfile } from '@/lib/types';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PublicProfileClientPage } from '@/components/public-profile-client-page';

export const dynamic = 'force-dynamic';

async function fetchProfileByUid(uid: string): Promise<UserProfile | null> {
    if (!uid) {
        console.error("fetchProfileByUid called with no UID.");
        return null;
    }
    
    try {
        const userDocRef = adminDb.collection('users').doc(uid);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
            console.warn(`No user document found in Firestore for uid: ${uid}`);
            return null;
        }

        const data = userDoc.data();
        if (!data) {
            console.warn(`User document for uid: ${uid} exists but has no data.`);
            return null;
        }
        
        const profile: UserProfile = {
            uid: userDoc.id,
            displayName: data.displayName || 'Unnamed User',
            photoURL: data.photoURL,
            bio: data.bio,
            location: data.location,
            badges: data.badges || [],
            factionId: data.factionId || null,
            factionTag: data.factionTag || null,
            
            createdAt: data.createdAt ? { seconds: data.createdAt.seconds, nanoseconds: data.createdAt.nanoseconds } : undefined,
            lastLoginAt: data.lastLoginAt ? { seconds: data.lastLoginAt.seconds, nanoseconds: data.lastLoginAt.nanoseconds } : undefined,
        };
        
        if (data.role !== 'admin') {
            profile.role = data.role;
        }

        return profile;

    } catch (error) {
        console.error(`Error fetching user from Firestore (UID: ${uid}):`, error);
        return null;
    }
}

export default async function UserPage({ params }: { params: Promise<{ uid: string }> }) {
    const { uid } = await params;
    
    if (!uid) {
        notFound();
    }
    
    const profile = await fetchProfileByUid(uid);

    if (!profile) {
        notFound();
    }
    
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow animate-fadeIn">
                <PublicProfileClientPage profile={profile} />
            </main>
            <Footer />
        </div>
    )
}
