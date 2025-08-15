import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { rateLimiters, getClientIP, createRateLimitResponse } from '@/lib/rate-limiter';
import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';

const feedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'improvement', 'ui', 'content', 'general']),
  category: z.enum(['gameplay', 'technical', 'content', 'community', 'accessibility', 'performance']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters')
    .trim(),
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be less than 2000 characters')
    .trim(),
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email too long'),
  reproduction: z.string()
    .max(1000, 'Reproduction steps too long')
    .optional(),
  includeSystemInfo: z.boolean().default(false),
  allowContact: z.boolean().default(false),
  subscribe: z.boolean().default(false),
  userAgent: z.string().max(500).optional(),
  browser: z.string().max(200).optional(),
  device: z.string().max(50).optional()
});

function detectSpam(data: any): boolean {
  const suspiciousPatterns = [
    /viagra|casino|lottery|winner|prize/i,
    /click here|visit now|act now/i,
    /\$\d+|\$\$\$|money|cash|free/i,
    /http[s]?:\/\//g
  ];
  
  const text = `${data.title} ${data.description}`.toLowerCase();
  
  const urlMatches = text.match(/http[s]?:\/\//g);
  if (urlMatches && urlMatches.length > 2) return true;
  
  return suspiciousPatterns.some(pattern => pattern.test(text));
}

function sanitizeInput(data: any) {
  const basicSanitize = (str: string) => {
    return str
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  };

  return {
    ...data,
    title: basicSanitize(data.title),
    description: basicSanitize(data.description),
    reproduction: data.reproduction ? basicSanitize(data.reproduction) : undefined,
    email: data.email.toLowerCase().trim(),
    userAgent: data.userAgent ? data.userAgent.substring(0, 500) : undefined,
    browser: data.browser ? data.browser.substring(0, 200) : undefined,
    device: data.device ? data.device.substring(0, 50) : undefined
  };
}

async function notifyAdminsIfCritical(feedbackId: string, data: any) {
  if (data.priority === 'critical' || data.type === 'bug') {
    try {
      await adminDb.collection('admin_notifications').add({
        type: 'critical_feedback',
        feedbackId,
        feedbackType: data.type,
        priority: data.priority,
        title: data.title.substring(0, 50),
        timestamp: new Date(),
        read: false,
      });
    } catch (error) {
      console.error('Failed to create admin notification:', error);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    if (rateLimiters.feedback.isLimited(ip)) {
      const resetTime = rateLimiters.feedback.getResetTime(ip);
      return createRateLimitResponse(resetTime);
    }

    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const userAgent = request.headers.get('user-agent');

    const allowedOrigins = [
      process.env.NEXT_PUBLIC_SITE_URL,
      'http://localhost:3000',
      'http://localhost:9002',
      'https://nomaryth.vercel.app'
    ].filter(Boolean) as string[];

    if (origin && allowedOrigins.length > 0 && !allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      console.warn(`Blocked feedback from unauthorized origin: ${origin}. Allowed: ${allowedOrigins.join(', ')}`);
      return NextResponse.json({ error: 'Unauthorized origin' }, { status: 403 });
    }

    const rawData = await request.json();
    
    if (JSON.stringify(rawData).length > 10000) {
      return NextResponse.json({ error: 'Request too large' }, { status: 413 });
    }

    let validatedData;
    try {
      validatedData = feedbackSchema.parse(rawData);
    } catch (error) {
      console.warn('Feedback validation failed:', error);
      return NextResponse.json({ 
        error: 'Invalid data format',
        details: error instanceof z.ZodError ? error.errors : undefined
      }, { status: 400 });
    }

    const sanitizedData = sanitizeInput(validatedData);

    if (detectSpam(sanitizedData)) {
      console.warn(`Potential spam feedback blocked from IP: ${ip}`);
      
      await adminDb.collection('security_logs').add({
        type: 'spam_feedback_blocked',
        ip,
        userAgent: userAgent?.substring(0, 200),
        timestamp: new Date(),
        data: {
          title: sanitizedData.title.substring(0, 50),
          email: sanitizedData.email
        }
      });

      return NextResponse.json({ error: 'Content flagged as spam' }, { status: 422 });
    }

    const feedbackDoc = {
      type: sanitizedData.type,
      category: sanitizedData.category,
      priority: sanitizedData.priority,
      title: sanitizedData.title,
      description: sanitizedData.description,
      reproduction: sanitizedData.reproduction || null,
      
      contactEmail: sanitizedData.email,
      allowContact: sanitizedData.allowContact,
      subscribeNewsletter: sanitizedData.subscribe,
      
      systemInfo: sanitizedData.includeSystemInfo ? {
        browser: sanitizedData.browser || null,
        device: sanitizedData.device || null,
      } : null,
      
      status: 'open' as const,
      priority_score: sanitizedData.priority === 'critical' ? 4 : 
                     sanitizedData.priority === 'high' ? 3 :
                     sanitizedData.priority === 'medium' ? 2 : 1,
      
      createdAt: new Date(),
      updatedAt: new Date(),
      
      assignedTo: null,
      adminResponse: null,
      internalNotes: [],
      tags: [],
      
      votes: 0,
      watchers: [],
      
      source: {
        ip: ip.substring(0, 12) + '***',
        origin: origin?.substring(0, 50) || null,
      }
    };

    let feedbackId: string;
    try {
      const docRef = await adminDb.collection('feedback').add(feedbackDoc);
      feedbackId = docRef.id;
    } catch (firestoreError) {
      console.error('Firestore write failed:', firestoreError);
      return NextResponse.json({ 
        error: 'Failed to save feedback. Please try again.' 
      }, { status: 500 });
    }

    try {
      await adminDb.collection('feedback_stats').doc('public').update({
        lastUpdated: new Date(),
        totalSubmissions: FieldValue.increment(1),
        [`byType.${sanitizedData.type}`]: FieldValue.increment(1),
        [`byCategory.${sanitizedData.category}`]: FieldValue.increment(1),
        [`byPriority.${sanitizedData.priority}`]: FieldValue.increment(1)
      });
    } catch (statsError) {
      console.warn('Stats update failed:', statsError);
      try {
        await adminDb.collection('feedback_stats').doc('public').set({
          totalSubmissions: 1,
          byType: { [sanitizedData.type]: 1 },
          byCategory: { [sanitizedData.category]: 1 },
          byPriority: { [sanitizedData.priority]: 1 },
          lastUpdated: new Date()
        });
      } catch (createError) {
        console.warn('Stats creation failed:', createError);
      }
    }

    try {
      await notifyAdminsIfCritical(feedbackId, sanitizedData);
    } catch (notificationError) {
      console.warn('Admin notification failed:', notificationError);
    }

    console.log(`Feedback submitted successfully: ${feedbackId} from ${ip}`);

    return NextResponse.json({
      success: true,
      id: feedbackId,
      message: 'Feedback submitted successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Feedback submission error:', error);
    
    try {
      await adminDb.collection('error_logs').add({
        type: 'feedback_submission_error',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
        ip: getClientIP(request)
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return NextResponse.json({ 
      error: 'Internal server error. Please try again later.' 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const statsDoc = await adminDb.collection('feedback_stats').doc('public').get();
    
    if (!statsDoc.exists) {
      const defaultStats = {
        totalSubmissions: 0,
        byType: { bug: 0, feature: 0, improvement: 0, ui: 0, content: 0, general: 0 },
        byCategory: { gameplay: 0, technical: 0, content: 0, community: 0, accessibility: 0, performance: 0 },
        byPriority: { low: 0, medium: 0, high: 0, critical: 0 },
        lastUpdated: new Date()
      };
      
      await adminDb.collection('feedback_stats').doc('public').set(defaultStats);
      return NextResponse.json(defaultStats);
    }
    
    return NextResponse.json(statsDoc.data());
  } catch (error) {
    console.error('Failed to fetch feedback stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}