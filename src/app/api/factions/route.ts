import { type NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { createFactionSchema, validateAndSanitize, isValidDocumentId } from '@/lib/validation';


async function getUserProfile(uid: string) {
    if (!isValidDocumentId(uid)) {
        return null;
    }
    
    const userRef = adminDb.collection('users').doc(uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return null;
    return userSnap.data();
}

export async function POST(req: NextRequest) {
    try {
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

        const json = await req.json();
        const validation = validateAndSanitize(createFactionSchema, json);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }

        const { name, tag, description } = validation.data;
        const normalizedTag = tag.toUpperCase();

        const factionsRef = adminDb.collection('factions');
        const userRef = adminDb.collection('users').doc(uid);
        const nameRef = adminDb.collection('faction_metadata').doc('names');
        const tagRef = adminDb.collection('faction_metadata').doc('tags');
        
        let newFaction;

        await adminDb.runTransaction(async (transaction) => {
            const nameDoc = await transaction.get(nameRef);
            const tagDoc = await transaction.get(tagRef);

            const existingNames = nameDoc.exists ? nameDoc.data() : {};
            if (existingNames && existingNames[name.toLowerCase()]) {
                throw new Error(`O nome da facção "${name}" já está em uso.`);
            }

            const existingTags = tagDoc.exists ? tagDoc.data() : {};
            if (existingTags && existingTags[normalizedTag]) {
                throw new Error(`A tag da facção "${normalizedTag}" já está em uso.`);
            }

            const newFactionRef = factionsRef.doc();
            const timestamp = Timestamp.now();

            newFaction = {
                id: newFactionRef.id,
                name,
                tag: normalizedTag,
                description: description || '',
                ownerUid: uid,
                ownerName: userProfile?.displayName || 'Desconhecido',
                memberCount: 1,
                recruitmentMode: 'open',
                createdAt: timestamp
            };
            
            
            transaction.set(newFactionRef, newFaction);

            
            const membersRef = newFactionRef.collection('members').doc(uid);
            transaction.set(membersRef, {
                uid: uid,
                role: 'owner',
                joinedAt: timestamp,
            });
            
            
            transaction.update(userRef, {
                factionId: newFactionRef.id,
                factionTag: normalizedTag,
            });

            
            transaction.set(nameRef, { [name.toLowerCase()]: true }, { merge: true });
            transaction.set(tagRef, { [normalizedTag]: true }, { merge: true });
        });
        
        return NextResponse.json({ message: 'Facção criada com sucesso!', faction: newFaction }, { status: 201 });

    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error("Error creating faction:", error);
        }
        const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro interno.";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const factionsSnapshot = await adminDb.collection('factions').orderBy('createdAt', 'desc').get();
        const factions = factionsSnapshot.docs.map(doc => doc.data());
        return NextResponse.json(factions, { status: 200 });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error("Error fetching factions:", error);
        }
        return NextResponse.json({ error: "Failed to fetch factions" }, { status: 500 });
    }
}
