import { type NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { FieldValue, FieldPath } from 'firebase-admin/firestore';
import type { FactionApplication } from '@/lib/types';

interface UserProfile {
    uid: string;
    factionId?: string;
    displayName?: string;
    photoURL?: string;
}

interface MemberProfile {
    uid: string;
    role: string;
    displayName: string;
    photoURL: string;
}

async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const userRef = adminDb.collection('users').doc(uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return null;
    return { uid, ...userSnap.data() } as UserProfile;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const factionRef = adminDb.collection('factions').doc(id);
        const factionSnap = await factionRef.get();

        if (!factionSnap.exists) {
            return NextResponse.json({ error: 'Faction not found' }, { status: 404 });
        }

        const factionData = factionSnap.data();
        
        const membersSnap = await factionRef.collection('members').orderBy('joinedAt', 'asc').get();
        const memberUids = membersSnap.docs.map(doc => doc.id);

        let memberProfiles: MemberProfile[] = [];
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
                };
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

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: factionId } = await params;

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
                    uid,
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
            });
            return NextResponse.json({ message: 'Você foi adicionado à facção!' });
        } else {
            return NextResponse.json({ error: 'Esta facção não está aceitando novos membros.' }, { status: 403 });
        }
    } catch (error) {
        console.error("Error joining faction:", error);
        return NextResponse.json({ error: "Failed to join faction" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: factionId } = await params;
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }
        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        const factionRef = adminDb.collection('factions').doc(factionId);
        const factionDoc = await factionRef.get();
        
        if (!factionDoc.exists) {
            return NextResponse.json({ error: 'Facção não encontrada.' }, { status: 404 });
        }
        
        const factionData = factionDoc.data();

        const body = await req.json();
        const action = String(body.action || '')
        if (action !== 'leave' && factionData?.ownerUid !== uid) {
            return NextResponse.json({ error: 'Você não tem permissão para editar esta facção.' }, { status: 403 });
        }
        if (action === 'kick') {
            const targetUid = String(body.targetUid || '')
            if (!targetUid || targetUid === uid) {
                return NextResponse.json({ error: 'Alvo inválido' }, { status: 400 })
            }
            const memberRef = factionRef.collection('members').doc(targetUid)
            const userRef = adminDb.collection('users').doc(targetUid)
            await adminDb.runTransaction(async (trx) => {
                trx.delete(memberRef)
                trx.update(userRef, { factionId: null, factionTag: null })
                trx.update(factionRef, { memberCount: FieldValue.increment(-1) })
            })
            return NextResponse.json({ message: 'Membro removido.' })
        }
        if (action === 'transfer_ownership') {
            const targetUid = String(body.targetUid || '')
            if (!targetUid || targetUid === uid) {
                return NextResponse.json({ error: 'Alvo inválido' }, { status: 400 })
            }
            const currentOwnerMemberRef = factionRef.collection('members').doc(uid)
            const newOwnerMemberRef = factionRef.collection('members').doc(targetUid)
            await adminDb.runTransaction(async (trx) => {
                trx.update(factionRef, { ownerUid: targetUid, updatedAt: FieldValue.serverTimestamp() })
                trx.set(newOwnerMemberRef, { role: 'owner' }, { merge: true })
                trx.set(currentOwnerMemberRef, { role: 'member' }, { merge: true })
            })
            return NextResponse.json({ message: 'Liderança transferida.' })
        }
        if (action === 'set_recruitment_mode') {
            const value = Boolean(body.value)
            await factionRef.update({ recruitmentMode: value ? 'application' : 'open', updatedAt: FieldValue.serverTimestamp() })
            return NextResponse.json({ message: 'Modo de recrutamento atualizado.' })
        }
        if (action === 'leave') {
            if (factionData?.ownerUid === uid) {
                return NextResponse.json({ error: 'O líder não pode usar sair. Use disband ou transfira a liderança.' }, { status: 400 })
            }
            const memberRef = factionRef.collection('members').doc(uid)
            const userRef = adminDb.collection('users').doc(uid)
            await adminDb.runTransaction(async (trx) => {
                trx.delete(memberRef)
                trx.update(userRef, { factionId: null, factionTag: null })
                trx.update(factionRef, { memberCount: FieldValue.increment(-1) })
            })
            return NextResponse.json({ message: 'Você saiu da facção.' })
        }
        return NextResponse.json({ error: 'Nenhuma ação válida.' }, { status: 400 })
    } catch (error) {
        console.error("Error updating faction:", error);
        return NextResponse.json({ error: "Failed to update faction" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: factionId } = await params;
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }
        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        const factionRef = adminDb.collection('factions').doc(factionId);
        const factionDoc = await factionRef.get();
        
        if (!factionDoc.exists) {
            return NextResponse.json({ error: 'Facção não encontrada.' }, { status: 404 });
        }
        
        const factionData = factionDoc.data();
        if (factionData?.ownerUid !== uid) {
            return NextResponse.json({ error: 'Você não tem permissão para deletar esta facção.' }, { status: 403 });
        }

        const membersSnap = await factionRef.collection('members').get();
        const batch = adminDb.batch();
        
        membersSnap.docs.forEach(doc => {
            const memberUid = doc.id;
            const userRef = adminDb.collection('users').doc(memberUid);
            batch.update(userRef, {
                factionId: null,
                factionTag: null,
            });
            batch.delete(doc.ref);
        });

        const applicationsSnap = await factionRef.collection('applications').get();
        applicationsSnap.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        const nameRef = adminDb.collection('faction_metadata').doc('names');
        const tagRef  = adminDb.collection('faction_metadata').doc('tags');
        const updates: any = {};
        updates[`${factionData.name.toLowerCase()}`] = FieldValue.delete();
        batch.set(nameRef, updates, { merge: true });
        const tagUpdates: any = {};
        tagUpdates[`${factionData.tag}`] = FieldValue.delete();
        batch.set(tagRef, tagUpdates, { merge: true });

        batch.delete(factionRef);

        await batch.commit();

        return NextResponse.json({ message: 'Facção deletada com sucesso.' });

    } catch (error) {
        console.error("Error deleting faction:", error);
        return NextResponse.json({ error: "Failed to delete faction" }, { status: 500 });
    }
}
