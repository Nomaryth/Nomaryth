import { type NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id: factionId } = await params;

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    let body;
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { action, targetUid } = body;

    const factionRef = adminDb.collection('factions').doc(factionId);
    const factionDoc = await factionRef.get();
    const factionData = factionDoc.data();

    if (!factionDoc.exists || !factionData) {
      return NextResponse.json({ error: 'Facção não encontrada.' }, { status: 404 });
    }

    if (action && targetUid) {
      const ownerUid = factionData.ownerUid;

      if (ownerUid !== userId) {
        return NextResponse.json(
          { error: 'Você não tem permissão para gerenciar esta facção.' },
          { status: 403 }
        );
      }

      const applicationRef = factionRef.collection('applications').doc(targetUid);
      const applicationSnap = await applicationRef.get();

        if (action === 'approve_application') {
        if (!applicationSnap.exists) {
          return NextResponse.json({ error: 'Aplicação não encontrada.' }, { status: 404 });
        }

        const userRef = adminDb.collection('users').doc(targetUid);
        const memberRef = factionRef.collection('members').doc(targetUid);
        const userNotifRef = userRef.collection('notifications').doc();

        await adminDb.runTransaction(async (transaction) => {
          transaction.set(memberRef, {
            uid: targetUid,
            role: 'member',
            joinedAt: FieldValue.serverTimestamp(),
          });
          transaction.update(userRef, {
            factionId,
            factionTag: factionData.tag,
          });
          transaction.update(factionRef, {
            memberCount: FieldValue.increment(1),
          });
          transaction.delete(applicationRef);
          transaction.set(userNotifRef, {
            title: `Bem-vindo a ${factionData.name}!`,
            message: `Sua aplicação para entrar na facção foi aprovada.`,
            type: 'system',
            isRead: false,
            timestamp: FieldValue.serverTimestamp(),
          });
        });

        return NextResponse.json({ message: 'Membro aprovado e adicionado à facção.' });
        } else if (action === 'reject_application') {
        if (!applicationSnap.exists) {
          return NextResponse.json({ message: 'Aplicação não encontrada ou já processada.' });
        }

        const userRef = adminDb.collection('users').doc(targetUid);
        const userNotifRef = userRef.collection('notifications').doc();

        await applicationRef.delete();
        await userNotifRef.set({
          title: `Aplicação para ${factionData.name}`,
          message: `Sua aplicação para entrar na facção foi rejeitada.`,
          type: 'system',
          isRead: false,
          timestamp: FieldValue.serverTimestamp(),
        });

        const indexRef = adminDb.collection('applications_index').doc(targetUid)
        await indexRef.delete().catch(() => {})

        return NextResponse.json({ message: 'Aplicação rejeitada.' });
      } else {
        return NextResponse.json({ error: 'Ação desconhecida.' }, { status: 400 });
      }
    }

    const applicationRef = factionRef.collection('applications').doc(userId)
    const indexRef = adminDb.collection('applications_index').doc(userId)

    const [existingApp, existingIndex, userDoc] = await Promise.all([
      applicationRef.get(),
      indexRef.get(),
      adminDb.collection('users').doc(userId).get()
    ])

    if (existingIndex.exists) {
      const current = existingIndex.data()
      if (current?.factionId && current.factionId !== factionId) {
        return NextResponse.json({ error: 'pending_application_exists' }, { status: 409 })
      }
      await adminDb.collection('users').doc(userId).collection('notifications').doc().set({
        title: `Pedido já enviado`,
        message: `Sua solicitação para ${factionData.name} já está pendente. Aguarde a decisão do líder.`,
        type: 'system',
        isRead: false,
        timestamp: FieldValue.serverTimestamp(),
      })
      return NextResponse.json({ success: true, message: 'already_applied' })
    }

    const cooldownMs = 60 * 60 * 1000
    const lastRef = factionRef.collection('applications_meta').doc(userId)
    const lastSnap = await lastRef.get()
    const now = Date.now()
    if (lastSnap.exists) {
      const last = lastSnap.data()?.lastAppliedAt || 0
      if (typeof last === 'number' && now - last < cooldownMs) {
        return NextResponse.json({ error: 'cooldown_active' }, { status: 429 })
      }
    }

    const displayName = userDoc.data()?.displayName || 'Unknown'
    const photoURL = userDoc.data()?.photoURL || ''
    await applicationRef.set({ uid: userId, displayName, photoURL, appliedAt: FieldValue.serverTimestamp() })
    await indexRef.set({ factionId, appliedAt: now })
    await lastRef.set({ lastAppliedAt: now })
    const ownerUid = factionData.ownerUid
    const notifRef = adminDb.collection('users').doc(ownerUid).collection('notifications').doc()
    await notifRef.set({ title: 'New join request', message: `${displayName} requested to join ${factionData.name}`, type: 'system', isRead: false, timestamp: FieldValue.serverTimestamp() })

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erro no gerenciamento da aplicação:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
