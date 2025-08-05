import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

const allConfigValuesPresent = 
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.storageBucket &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.appId;

export function isFirebaseConfigured(): boolean {
  try {
    return !!allConfigValuesPresent && app !== null && auth !== null && db !== null;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Error checking Firebase configuration:', error);
    }
    return false;
  }
}

export function getFirebaseConfig() {
  return firebaseConfig;
}

export function getMissingConfigVars(): string[] {
  const missing: string[] = [];
  if (!firebaseConfig.apiKey) missing.push('NEXT_PUBLIC_FIREBASE_API_KEY');
  if (!firebaseConfig.authDomain) missing.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  if (!firebaseConfig.projectId) missing.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  if (!firebaseConfig.storageBucket) missing.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
  if (!firebaseConfig.messagingSenderId) missing.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
  if (!firebaseConfig.appId) missing.push('NEXT_PUBLIC_FIREBASE_APP_ID');
  return missing;
}

try {
  if (allConfigValuesPresent) {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    
    if (app) {
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Firebase initialized successfully');
        console.log('Auth domain:', firebaseConfig.authDomain);
        console.log('Project ID:', firebaseConfig.projectId);
      }
    }
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Firebase configuration incomplete. Missing variables:', getMissingConfigVars());
    }
  }
} catch (error) {
  if (process.env.NODE_ENV === 'development') {
    console.error("Firebase initialization error:", error);
  }
}

export { app, auth, db, storage };
export default app;
