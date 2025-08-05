import { type NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { FieldValue, FieldPath } from 'firebase-admin/firestore';
import type { FactionApplication } from '@/lib/types';

async function getUserProfile(uid: string) {
    const userRef = adminDb.collection('users').doc(uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return null;
    return { uid, ...userSnap.data() };
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const factionRef = adminDb.collection('factions').doc(id);
        const factionSnap = await factionRef.get();

        if (!factionSnap.exists) {
            return NextResponse.json({ error: 'Faction not found' }, { status: 404 });
        }

        const factionData = factionSnap.data();
        
        const membersSnap = await factionRef.collection('members').orderBy('joinedAt', 'asc').get();
        const memberUids = membersSnap.docs.map(doc => doc.id);

        let memberProfiles = [];
        if (memberUids.length > 0) {
            const userProfilesSnap = await adminDb.collection('users').where(FieldPath.documentId(), 'in', memberUids).get();
            const profilesMap = new Map(userProfilesSnap.docs.map(doc => [doc.id, doc.data()]));
            
            memberProfiles = membersSnap.docs.map(doc => {
                const memberData = doc.data();
                const profileData = profilesMap.get(doc.id);
                return {
                    uid: doc.id,
                    role: memberData.role,
                    displayName: profileData?.displayName || 'Unknown Member',
                    photoURL: profileData?.photoURL || ''
                }
            });
        }
        
        const response: any = {
            ...factionData,
            members: memberProfiles,
        };

        const authHeader = req.headers.get('Authorization');
        if (authHeader) {
            const idToken = authHeader.split('Bearer ')[1];
            const decodedToken = await adminAuth.verifyIdToken(idToken);
            if (decodedToken.uid === factionData?.ownerUid) {
                const applicationsSnap = await factionRef.collection('applications').orderBy('appliedAt', 'asc').get();
                response.applications = applicationsSnap.docs.map(doc => doc.data() as FactionApplication);
            }
        }

        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("Error fetching faction details:", error);
        return NextResponse.json({ error: "Failed to fetch faction details" }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id: factionId } = params;

        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }
        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        const userProfile = await getUserProfile(uid);
        if (userProfile?.factionId) {
            return NextResponse.json({ error: 'Você já pertence a uma facção.' }, { status: 400 });
        }

        const factionRef = adminDb.collection('factions').doc(factionId);
        
        const factionDoc = await factionRef.get();
        if (!factionDoc.exists) {
            throw new Error("Facção não encontrada.");
        }
        
        const factionData = factionDoc.data();
        if (!factionData) {
             throw new Error("Dados da facção inválidos.");
        }
        
        if (factionData.recruitmentMode === 'open') {
            const userRef = adminDb.collection('users').doc(uid);
            await adminDb.runTransaction(async (transaction) => {
                transaction.set(factionRef.collection('members').doc(uid), {
                    uid: uid,
                    role: 'member',
                    joinedAt: FieldValue.serverTimestamp(),
                });
                transaction.update(userRef, { factionId: factionId, factionTag: factionData.tag });
                transaction.update(factionRef, { memberCount: FieldValue.increment(1) });
            });
            return NextResponse.json({ title: 'Bem-vindo!', description: `Você agora é membro de ${factionData.name}.` }, { status: 200 });
        } else { 
            const applicationRef = factionRef.collection('applications').doc(uid);
            const applicationSnap = await applicationRef.get();
            if (applicationSnap.exists) {
                return NextResponse.json({ error: 'Você já tem uma aplicação pendente para esta facção.'}, { status: 400 });
            }
            
            await applicationRef.set({
                uid: uid,
                displayName: userProfile?.displayName || 'Desconhecido',
                photoURL: userProfile?.photoURL || '',
                appliedAt: FieldValue.serverTimestamp()
            });
            return NextResponse.json({ title: 'Aplicação Enviada!', description: `Sua solicitação para entrar em ${factionData.name} foi enviada.` }, { status: 200 });
        }

    } catch (error) {
        console.error("Error joining/applying to faction:", error);
        const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro interno.";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id: factionId } = params;

        const authHeader = req.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const ownerUid = decodedToken.uid;
        
        const { action, targetUid, value } = await req.json();
        
        if (!action) {
            return NextResponse.json({ error: 'Ação inválida.' }, { status: 400 });
        }

        const factionRef = adminDb.collection('factions').doc(factionId);
        
        const factionDoc = await factionRef.get();
        if (!factionDoc.exists || factionDoc.data()?.ownerUid !== ownerUid) {
            return NextResponse.json({ error: 'Você não tem permissão para gerenciar esta facção.' }, { status: 403 });
        }

        if (action === 'kick') {
            if (!targetUid || ownerUid === targetUid) {
                 return NextResponse.json({ error: 'Ação de expulsão inválida.' }, { status: 400 });
            }
            const memberRef = factionRef.collection('members').doc(targetUid);
            const userRef = adminDb.collection('users').doc(targetUid);
            
            await adminDb.runTransaction(async (transaction) => {
                const memberDoc = await transaction.get(memberRef);
                if (!memberDoc.exists) throw new Error("Membro não encontrado nesta facção.");
                transaction.delete(memberRef);
                transaction.update(userRef, { factionId: FieldValue.delete(), factionTag: FieldValue.delete() });
                transaction.update(factionRef, { memberCount: FieldValue.increment(-1) });
            });
            return NextResponse.json({ message: "Membro expulso com sucesso." }, { status: 200 });
        }
        
        if (action === 'transfer_ownership') {
            if (!targetUid || ownerUid === targetUid) {
                 return NextResponse.json({ error: 'Transferência de liderança inválida.' }, { status: 400 });
            }
            const newOwnerRef = factionRef.collection('members').doc(targetUid);
            const oldOwnerRef = factionRef.collection('members').doc(ownerUid);
            const newOwnerProfile = await getUserProfile(targetUid);

            await adminDb.runTransaction(async (transaction) => {
                const newOwnerMemberDoc = await transaction.get(newOwnerRef);
                if (!newOwnerMemberDoc.exists) throw new Error("Membro alvo não encontrado.");

                transaction.update(factionRef, { 
                    ownerUid: targetUid,
                    ownerName: newOwnerProfile?.displayName || 'Desconhecido'
                });
                transaction.update(newOwnerRef, { role: 'owner' });
                transaction.update(oldOwnerRef, { role: 'member' });
            });
            return NextResponse.json({ message: "Liderança transferida com sucesso." }, { status: 200 });
        }

        if (action === 'set_recruitment_mode') {
             if (typeof value !== 'boolean') {
                 return NextResponse.json({ error: 'Valor inválido para modo de recrutamento.' }, { status: 400 });
             }
             const mode = value ? 'application' : 'open';
             await factionRef.update({ recruitmentMode: mode });
             return NextResponse.json({ message: `Modo de recrutamento definido para ${mode}.` }, { status: 200 });
        }

        return NextResponse.json({ error: 'Ação desconhecida.' }, { status: 400 });

    } catch (error) {
        console.error("Error managing faction:", error);
        const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro interno.";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id: factionId } = params;

        const authHeader = req.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;
        
        const factionRef = adminDb.collection('factions').doc(factionId);
        const userRef = adminDb.collection('users').doc(uid);
        const memberRef = factionRef.collection('members').doc(uid);
        
        const factionDoc = await factionRef.get();
        if (!factionDoc.exists) {
            return NextResponse.json({ error: 'Facção não encontrada.' }, { status: 404 });
        }
        const factionData = factionDoc.data();
        const isOwner = factionData?.ownerUid === uid;

        if (isOwner) {
            
            const membersSnap = await factionRef.collection('members').get();
            const applicationsSnap = await factionRef.collection('applications').get();
            const batch = adminDb.batch();

            membersSnap.docs.forEach(doc => {
                const memberUserRef = adminDb.collection('users').doc(doc.id);
                batch.update(memberUserRef, {
                    factionId: FieldValue.delete(),
                    factionTag: FieldValue.delete(),
                });
                batch.delete(doc.ref); 
            });

            applicationsSnap.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            const nameRef = adminDb.collection('faction_metadata').doc('names');
            const tagRef = adminDb.collection('faction_metadata').doc('tags');
            batch.update(nameRef, { [factionData.name.toLowerCase()]: FieldValue.delete() });
            batch.update(tagRef, { [factionData.tag.toUpperCase()]: FieldValue.delete() });
            
            batch.delete(factionRef);

            await batch.commit();
            return NextResponse.json({ message: 'Facção dissolvida com sucesso.' }, { status: 200 });

        } else {
            
            await adminDb.runTransaction(async (transaction) => {
                const memberDoc = await transaction.get(memberRef);
                if (!memberDoc.exists) {
                    throw new Error("Você não é membro desta facção.");
                }
                
                transaction.delete(memberRef);
                
                transaction.update(userRef, {
                    factionId: FieldValue.delete(),
                    factionTag: FieldValue.delete(),
                });
                
                transaction.update(factionRef, {
                    memberCount: FieldValue.increment(-1),
                });
            });

            return NextResponse.json({ message: 'Você saiu da facção.' }, { status: 200 });
        }
    } catch (error) {
        console.error("Error leaving/disbanding faction:", error);
        const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro interno.";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
