import { type NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { AdminSystem } from '@/lib/admin-system';


export async function POST(req: NextRequest) {
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
    
    const { inviteId } = await req.json();

    if (!inviteId) {
      return NextResponse.json(
        { error: 'Missing required field: inviteId' },
        { status: 400 }
      );
    }

    const result = await AdminSystem.acceptAdminInvite(
      inviteId,
      decodedToken.uid
    );

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to accept admin invite' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Admin privileges granted successfully'
    });

  } catch (error) {
    console.error('Error accepting admin invite:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 