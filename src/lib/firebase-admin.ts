import admin from 'firebase-admin';
import { getApps, initializeApp, getApp, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

let adminApp: App;

if (getApps().length === 0) {
    if (serviceAccount.projectId && serviceAccount.privateKey && serviceAccount.clientEmail) {
        adminApp = initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } else {
        console.warn("Firebase Admin SDK service account credentials are not fully set. Certain server-side functionalities may not work.");
        adminApp = initializeApp();
    }
} else {
    adminApp = getApp();
}

const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);

export { adminApp, adminAuth, adminDb };
