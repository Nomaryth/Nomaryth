import React from 'react';
import { db } from './firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

export async function isAdmin(uid: string): Promise<boolean> {
  try {
    if (!uid || !db) return false;
    
    const adminDoc = await getDoc(doc(db, 'admins', uid));
    const data = adminDoc.data();
    return adminDoc.exists() && Boolean(data);
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export function useAdminStatus(uid: string | null) {
  const [isAdminUser, setIsAdminUser] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!uid || !db) {
      setIsAdminUser(false);
      setLoading(false);
      return;
    }

    const adminDocRef = doc(db, 'admins', uid);
    const unsubscribe = onSnapshot(adminDocRef, (doc) => {
      const data = doc.data();
      setIsAdminUser(doc.exists() && Boolean(data));
      setLoading(false);
    }, (error) => {
      console.error('Error listening to admin status:', error);
      setIsAdminUser(false);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  return { isAdmin: isAdminUser, loading };
} 