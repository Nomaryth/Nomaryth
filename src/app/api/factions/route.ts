
import { type NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';

const createFactionSchema = z.object({
  name: z.string().min(3, 'O nome deve ter de 3 a 20 caracteres.').max(20, 'O nome não pode ter mais de 20 caracteres.'),
  tag: z.string().min(2, 'A tag deve ter de 2 a 4 caracteres.').max(4, 'A tag não pode ter mais de 4 caracteres.').regex(/^[a-zA-Z0-9]+$/, 'A tag só pode conter letras e números.'),
  description: z.string().max(150, 'A descrição não pode ter mais de 150 caracteres.').optional(),
});

// Helper to get user profile by UID
async function getUserProfile(uid: string) {
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
        const body = createFactionSchema.safeParse(json);

        if (!body.success) {
            const firstError = body.error.flatten().fieldErrors;
            const errorMessage = Object.values(firstError)[0]?.[0] || 'Dados inválidos.';
            return NextResponse.json({ error: errorMessage }, { status: 400 });
        }

        const { name, tag, description } = body.data;
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
            
            // Create the faction document
            transaction.set(newFactionRef, newFaction);

            // Add user as the first member
            const membersRef = newFactionRef.collection('members').doc(uid);
            transaction.set(membersRef, {
                uid: uid,
                role: 'owner',
                joinedAt: timestamp,
            });
            
            // Update the user's profile
            transaction.update(userRef, {
                factionId: newFactionRef.id,
                factionTag: normalizedTag,
            });

            // Reserve the name and tag
            transaction.set(nameRef, { [name.toLowerCase()]: true }, { merge: true });
            transaction.set(tagRef, { [normalizedTag]: true }, { merge: true });
        });
        
        return NextResponse.json({ message: 'Facção criada com sucesso!', faction: newFaction }, { status: 201 });

    } catch (error) {
        console.error("Error creating faction:", error);
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
        console.error("Error fetching factions:", error);
        return NextResponse.json({ error: "Failed to fetch factions" }, { status: 500 });
    }
}
