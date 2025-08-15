import { NextRequest } from 'next/server';
import { randomBytes, createHash } from 'crypto';

const CSRF_SECRET = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production';
const CSRF_TOKEN_LENGTH = 32;
const CSRF_HEADER_NAME = 'x-csrf-token';

export function generateCSRFToken(sessionId?: string): string {
  const randomToken = randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
  const timestamp = Date.now().toString();
  const payload = `${randomToken}:${timestamp}:${sessionId || 'anonymous'}`;
  
  const signature = createHash('sha256')
    .update(payload + CSRF_SECRET)
    .digest('hex');
    
  return `${payload}:${signature}`;
}

export function validateCSRFToken(token: string, sessionId?: string): boolean {
  try {
    const parts = token.split(':');
    if (parts.length !== 4) return false;
    
    const [randomToken, timestamp, tokenSessionId, signature] = parts;
    
    if (sessionId && tokenSessionId !== sessionId) return false;
    
    const tokenAge = Date.now() - parseInt(timestamp);
    const maxAge = 60 * 60 * 1000;
    if (tokenAge > maxAge) return false;
    
    const payload = `${randomToken}:${timestamp}:${tokenSessionId}`;
    const expectedSignature = createHash('sha256')
      .update(payload + CSRF_SECRET)
      .digest('hex');
      
    return signature === expectedSignature;
  } catch {
    return false;
  }
}

export function requireCSRFToken(req: NextRequest, sessionId?: string): boolean {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return true;
  }
  
  const token = req.headers.get(CSRF_HEADER_NAME) || '';
  return validateCSRFToken(token, sessionId);
}

export function getCSRFTokenFromRequest(req: NextRequest): string | null {
  return req.headers.get(CSRF_HEADER_NAME);
}

export const CSRF_HEADER = CSRF_HEADER_NAME;
