import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { rateLimiters, getClientIP, createRateLimitResponse } from '@/lib/rate-limiter';

async function isUserAdmin(uid: string): Promise<boolean> {
  try {
    const adminDoc = await adminDb.collection('admins').doc(uid).get();
    return adminDoc.exists;
  } catch {
    return false;
  }
}

function sanitizeString(str: string): string {
  if (typeof str !== 'string') return '';
  
  return str
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/data:/gi, '')
    .trim()
    .slice(0, 1000);
}

function sanitizeContentData(type: string, data: any): any {
  if (type === 'home-cards') {
    return {
      explore_title: sanitizeString(data.explore_title || ''),
      explore_subtitle: sanitizeString(data.explore_subtitle || '')
    };
  }
  
  if (type === 'testimonials') {
    if (!Array.isArray(data.testimonials)) {
      return { testimonials: [] };
    }
    
    return {
      testimonials: data.testimonials.slice(0, 10).map((testimonial: any) => ({
        name: sanitizeString(testimonial.name || ''),
        role: sanitizeString(testimonial.role || ''),
        content: sanitizeString(testimonial.content || ''),
        avatar: sanitizeString(testimonial.avatar || '').slice(0, 10),
        rating: Math.max(1, Math.min(5, parseInt(testimonial.rating) || 5))
      }))
    };
  }
  
  return {};
}

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    if (rateLimiters.admin.isLimited(ip)) {
      const resetTime = rateLimiters.admin.getResetTime(ip);
      return createRateLimitResponse(resetTime);
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type) {
      return NextResponse.json({ error: 'Content type required' }, { status: 400 });
    }

    const allowedTypes = ['home-cards', 'testimonials'];
    if (!allowedTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    const authHeader = request.headers.get('Authorization');
    const isAdminRequest = authHeader && authHeader.startsWith('Bearer ');

    if (isAdminRequest) {
      const token = authHeader.split(' ')[1];
      let decodedToken;
      
      try {
        decodedToken = await adminAuth.verifyIdToken(token);
      } catch (error) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }

      const isAdmin = await isUserAdmin(decodedToken.uid);
      if (!isAdmin) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
    }

    const contentDoc = await adminDb.collection('content').doc(type).get();
    
    if (!contentDoc.exists) {
      return NextResponse.json({ 
        type,
        data: null,
        lastUpdated: null,
        updatedBy: isAdminRequest ? null : undefined
      });
    }

    const contentData = contentDoc.data();
    const response: any = {
      type,
      data: contentData?.data || null
    };

    if (isAdminRequest) {
      response.lastUpdated = contentData?.lastUpdated?.toDate?.() || contentData?.lastUpdated;
      response.updatedBy = contentData?.updatedBy || null;
    }

    return NextResponse.json(response);

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    if (rateLimiters.admin.isLimited(ip)) {
      const resetTime = rateLimiters.admin.getResetTime(ip);
      return createRateLimitResponse(resetTime);
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decodedToken;
    
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const isAdmin = await isUserAdmin(decodedToken.uid);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const bodyText = await request.text();
    if (bodyText.length > 50000) {
      return NextResponse.json({ error: 'Request body too large' }, { status: 413 });
    }
    
    let body;
    try {
      body = JSON.parse(bodyText);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    
    const { type, data } = body;
    
    if (!type || !data) {
      return NextResponse.json({ error: 'Content type and data required' }, { status: 400 });
    }

    const allowedTypes = ['home-cards', 'testimonials'];
    if (!allowedTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    const sanitizedData = sanitizeContentData(type, data);

    const contentData = {
      data: sanitizedData,
      lastUpdated: new Date(),
      updatedBy: decodedToken.uid
    };

    await adminDb.collection('content').doc(type).set(contentData, { merge: true });

    return NextResponse.json({
      success: true,
      type,
      lastUpdated: contentData.lastUpdated,
      updatedBy: contentData.updatedBy
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
