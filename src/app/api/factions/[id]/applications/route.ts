import { type NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';


export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id: factionId } = params;

        const authHeader = req.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const ownerUid = decodedToken.uid;
        
        const { action, targetUid } = await req.json();

        if (!action || !targetUid) {
            return NextResponse.json({ error: 'Ação ou UID alvo ausentes.' }, { status: 400 });
        }

        const factionRef = adminDb.collection('factions').doc(factionId);
        const factionDoc = await factionRef.get();
        if (!factionDoc.exists || factionDoc.data()?.ownerUid !== ownerUid) {
            return NextResponse.json({ error: 'Você não tem permissão para gerenciar esta facção.' }, { status: 403 });
        }
        
        const factionData = factionDoc.data();
        if (!factionData) {
             return NextResponse.json({ error: 'Dados da facção inválidos.' }, { status: 400 });
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
                transaction.update(userRef, { factionId: factionId, factionTag: factionData.tag });
                transaction.update(factionRef, { memberCount: FieldValue.increment(1) });
                transaction.delete(applicationRef);
                transaction.set(userNotifRef, {
                    title: `Bem-vindo a ${factionData.name}!`,
                    message: `Sua aplicação para entrar na facção foi aprovada.`,
                    type: 'system',
                    isRead: false,
                    timestamp: FieldValue.serverTimestamp(),
                });
            });

            return NextResponse.json({ message: 'Membro aprovado e adicionado à facção.' }, { status: 200 });

        } else if (action === 'reject_application') {
            if (!applicationSnap.exists) {
                
                return NextResponse.json({ message: 'Aplicação não encontrada ou já processada.' }, { status: 200 });
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

            return NextResponse.json({ message: 'Aplicação rejeitada.' }, { status: 200 });

        } else {
            return NextResponse.json({ error: 'Ação desconhecida.' }, { status: 400 });
        }

    } catch (error) {
        console.error("Error managing application:", error);
        const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro interno.";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
