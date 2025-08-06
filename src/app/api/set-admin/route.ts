import { type NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

async function isUserAdmin(uid: string): Promise<boolean> {
  try {
    if (!adminDb) {
      console.warn("Firebase Admin DB not available");
      return false;
    }

    const adminDoc = await adminDb.collection('admins').doc(uid).get();
    return adminDoc.exists;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token de autorização não fornecido' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: 'Firebase Admin não configurado' }, { status: 500 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const currentUserUid = decodedToken.uid;
    
    const isCurrentUserAdmin = await isUserAdmin(currentUserUid);
    if (!isCurrentUserAdmin) {
      return NextResponse.json({ error: 'Apenas administradores podem realizar esta operação' }, { status: 403 });
    }
    
    const body = await request.json();
    const { targetUid, isAdmin: shouldBeAdmin, updateData } = body;
    
    if (!targetUid) {
      return NextResponse.json({ error: 'UID do usuário deve ser fornecido' }, { status: 400 });
    }
    
    try {
      await adminAuth.getUser(targetUid);
    } catch (error) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }
    
    if (typeof shouldBeAdmin === 'boolean') {
      if (shouldBeAdmin) {
        await adminDb.collection('admins').doc(targetUid).set({
          isAdmin: true,
          createdAt: new Date(),
          createdBy: currentUserUid
        });
      } else {
        const adminsSnapshot = await adminDb.collection('admins').get();
        if (adminsSnapshot.docs.length <= 1) {
          return NextResponse.json({ error: 'Não é possível remover o último administrador' }, { status: 400 });
        }
        await adminDb.collection('admins').doc(targetUid).delete();
      }
    }
    
    if (updateData) {
      const userUpdateData: any = {};
      
      if (updateData.displayName !== undefined) userUpdateData.displayName = updateData.displayName;
      if (updateData.bio !== undefined) userUpdateData.bio = updateData.bio;
      if (updateData.location !== undefined) userUpdateData.location = updateData.location;
      if (updateData.badges !== undefined) userUpdateData.badges = updateData.badges;
      
      if (updateData.role !== undefined) {
        userUpdateData.role = updateData.role;
        
        if (updateData.role === 'admin') {
          await adminDb.collection('admins').doc(targetUid).set({
            isAdmin: true,
            createdAt: new Date(),
            createdBy: currentUserUid
          });
        } else {
          const adminsSnapshot = await adminDb.collection('admins').get();
          if (adminsSnapshot.docs.length > 1) {
            await adminDb.collection('admins').doc(targetUid).delete();
          }
        }
      }
      
      if (Object.keys(userUpdateData).length > 0) {
        await adminDb.collection('users').doc(targetUid).update(userUpdateData);
      }
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Usuário atualizado com sucesso'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 });
  }
} 