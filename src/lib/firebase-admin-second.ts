import * as admin from 'firebase-admin'

let secondApp: admin.app.App | undefined

function loadSecondCredentials(): { projectId: string; clientEmail: string; privateKey: string; databaseURL: string } | undefined {
  try {
    const json = process.env.SECOND_FIREBASE_SERVICE_ACCOUNT
    if (json) {
      const obj = JSON.parse(json)
      const pk = String(obj.private_key || '').replace(/\r/g, '').replace(/\\n/g, '\n')
      const pid = String(obj.project_id || process.env.SECOND_FIREBASE_PROJECT_ID || '')
      const email = String(obj.client_email || process.env.SECOND_FIREBASE_CLIENT_EMAIL || '')
      const databaseURL = process.env.SECOND_FIREBASE_RTDB_URL || 'https://nomaryth-gate-default-rtdb.firebaseio.com'
      if (pk && pid && email) return { projectId: pid, clientEmail: email, privateKey: pk, databaseURL }
    }
  } catch {}
  try {
    const b64 = process.env.SECOND_FIREBASE_SERVICE_ACCOUNT_BASE64
    if (b64) {
      const json = Buffer.from(b64, 'base64').toString('utf8')
      const obj = JSON.parse(json)
      const pk = String(obj.private_key || '').replace(/\r/g, '').replace(/\\n/g, '\n')
      const pid = String(obj.project_id || '')
      const email = String(obj.client_email || '')
      const databaseURL = process.env.SECOND_FIREBASE_RTDB_URL || 'https://nomaryth-gate-default-rtdb.firebaseio.com'
      if (pk && pid && email) return { projectId: pid, clientEmail: email, privateKey: pk, databaseURL }
    }
  } catch {}
  const projectId = process.env.SECOND_FIREBASE_PROJECT_ID
  const clientEmail = process.env.SECOND_FIREBASE_CLIENT_EMAIL
  let privateKey = process.env.SECOND_FIREBASE_PRIVATE_KEY
  if (projectId && clientEmail && privateKey) {
    const pk = privateKey.replace(/\r/g, '').replace(/\\n/g, '\n')
    const databaseURL = process.env.SECOND_FIREBASE_RTDB_URL || 'https://nomaryth-gate-default-rtdb.firebaseio.com'
    return { projectId, clientEmail, privateKey: pk, databaseURL }
  }
  return undefined
}

function getSecondApp(): admin.app.App | undefined {
  try {
    return admin.app('second')
  } catch {}
  const cred = loadSecondCredentials()
  if (!cred) return undefined
  try {
    secondApp = admin.initializeApp({ credential: admin.credential.cert({ projectId: cred.projectId, clientEmail: cred.clientEmail, privateKey: cred.privateKey }), databaseURL: cred.databaseURL }, 'second')
    return secondApp
  } catch {
    return undefined
  }
}

export function getSecondDb(): admin.firestore.Firestore | undefined {
  const app = getSecondApp()
  return app ? app.firestore() : undefined
}

export function getSecondRtdb(): admin.database.Database | undefined {
  const app = getSecondApp()
  return app ? admin.database(app) : undefined
}

