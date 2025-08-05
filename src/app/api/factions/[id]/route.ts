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
                    uid: uid,
                    role: 'member',
                    joinedAt: FieldValue.serverTimestamp(),
                });
                transaction.update(userRef, { factionId: factionId, factionTag: factionData.tag });
                transaction.update(factionRef, { memberCount: FieldValue.increment(1) });
            });
            return NextResponse.json({ message: 'Você foi adicionado à facção com sucesso.' }, { status: 200 });
        } else {
            const applicationRef = factionRef.collection('applications').doc(uid);
            const existingApplication = await applicationRef.get();
            
            if (existingApplication.exists) {
                return NextResponse.json({ error: 'Você já tem uma aplicação pendente para esta facção.' }, { status: 400 });
            }
            
            await applicationRef.set({
                uid: uid,
                appliedAt: FieldValue.serverTimestamp(),
                status: 'pending'
            });
            
            return NextResponse.json({ message: 'Sua aplicação foi enviada com sucesso.' }, { status: 200 });
        }

    } catch (error) {
        console.error("Error joining faction:", error);
        const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro interno.";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
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
        const ownerUid = decodedToken.uid;

        const factionRef = adminDb.collection('factions').doc(factionId);
        const factionDoc = await factionRef.get();
        
        if (!factionDoc.exists || factionDoc.data()?.ownerUid !== ownerUid) {
            return NextResponse.json({ error: 'Você não tem permissão para editar esta facção.' }, { status: 403 });
        }

        const updateData = await req.json();
        const allowedFields = ['name', 'description', 'tag', 'recruitmentMode', 'bannerUrl'];
        const filteredData: any = {};
        
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                filteredData[field] = updateData[field];
            }
        });

        if (Object.keys(filteredData).length === 0) {
            return NextResponse.json({ error: 'Nenhum campo válido para atualização.' }, { status: 400 });
        }

        await factionRef.update(filteredData);

        return NextResponse.json({ 
            message: 'Facção atualizada com sucesso.',
            updatedFields: Object.keys(filteredData)
        }, { status: 200 });

    } catch (error) {
        console.error("Error updating faction:", error);
        const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro interno.";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
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
        const ownerUid = decodedToken.uid;

        const factionRef = adminDb.collection('factions').doc(factionId);
        const factionDoc = await factionRef.get();
        
        if (!factionDoc.exists || factionDoc.data()?.ownerUid !== ownerUid) {
            return NextResponse.json({ error: 'Você não tem permissão para deletar esta facção.' }, { status: 403 });
        }

        const factionData = factionDoc.data();
        if (!factionData) {
            return NextResponse.json({ error: 'Dados da facção inválidos.' }, { status: 400 });
        }

        await adminDb.runTransaction(async (transaction) => {
            const membersSnap = await factionRef.collection('members').get();
            const applicationsSnap = await factionRef.collection('applications').get();
            
            membersSnap.docs.forEach(doc => {
                const memberData = doc.data();
                const userRef = adminDb.collection('users').doc(memberData.uid);
                transaction.update(userRef, { 
                    factionId: FieldValue.delete(),
                    factionTag: FieldValue.delete()
                });
            });
            
            membersSnap.docs.forEach(doc => transaction.delete(doc.ref));
            applicationsSnap.docs.forEach(doc => transaction.delete(doc.ref));
            transaction.delete(factionRef);
        });

        return NextResponse.json({ message: 'Facção deletada com sucesso.' }, { status: 200 });

    } catch (error) {
        console.error("Error deleting faction:", error);
        const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro interno.";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
