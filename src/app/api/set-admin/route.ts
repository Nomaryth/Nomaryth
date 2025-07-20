
import { type NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';


export async function POST(req: NextRequest) {
  try {
    
    const { targetUid, isAdmin, updateData } = await req.json();

    if (!targetUid) {
      return NextResponse.json({ error: 'Missing targetUid' }, { status: 400 });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    const isActingAdmin = !!decodedToken.admin;

    // Apenas um administrador pode executar ações nesta rota.
    if (!isActingAdmin) {
       return NextResponse.json({ error: 'Forbidden: Caller is not an admin.' }, { status: 403 });
    }

    // Cenário 1: Atualizar a função do usuário (definir status de administrador)
    if (typeof isAdmin === 'boolean') {
      await adminAuth.setCustomUserClaims(targetUid, { admin: isAdmin });
      const userRef = adminDb.collection('users').doc(targetUid);
      await userRef.set({ role: isAdmin ? 'admin' : 'user' }, { merge: true });
      return NextResponse.json({ message: `Successfully set user ${targetUid} admin status to ${isAdmin}` });
    }

    // Cenário 2: Atualizar os dados do perfil do usuário
    if (updateData) {
       const userRef = adminDb.collection('users').doc(targetUid);
       
       // Permitir que o admin atualize campos específicos
       await userRef.update(updateData);
       
       return NextResponse.json({ message: `Successfully updated user ${targetUid}'s profile.` });
    }

    return NextResponse.json({ error: 'Invalid request body. Provide either "isAdmin" or "updateData".' }, { status: 400 });

  } catch (error: any) {
    console.error('Error in API route:', error);
    let status = 500;
    if (error.code?.startsWith('auth/')) {
        status = 401; // Typically auth errors
    } else if (error.message.includes('Forbidden')) {
        status = 403;
    }
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status });
  }
}
