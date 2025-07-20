import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import path from 'path';

/**
 * @fileoverview
 */

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
  console.error("Firebase Admin SDK service account credentials are not fully set in .env.local.");
  console.error("Please ensure NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL are set.");
  process.exit(1);
}

const adminApp = initializeApp({
  credential: cert(serviceAccount),
});

const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);

async function setInitialAdmin() {
  const uid = process.argv[2];

  if (!uid) {
    console.error("Usage: node src/scripts/set-initial-admin.mjs <UID>");
    process.exit(1);
  }

  try {
    await adminAuth.setCustomUserClaims(uid, { admin: true });
    const userRef = adminDb.collection('users').doc(uid);
    await userRef.set({ role: 'admin' }, { merge: true });

    console.log(`\n✅ Success! User ${uid} is now an administrator.`);
    console.log("   The user must log out and log back in for the changes to take full effect.");

    process.exit(0);

  } catch (error) {
    console.error("\n❌ Error setting admin user:", error);
    process.exit(1);
  }
}

setInitialAdmin();
