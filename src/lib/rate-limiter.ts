interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
}

interface RateLimitEntry {
  count: number;
  expires: number;
  lastRequest: number;
}

class RateLimiter {
  private cache = new Map<string, RateLimitEntry>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    
    setInterval(() => {
      this.cleanup();
    }, Math.min(this.config.windowMs, 120000));
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expires < now) {
        this.cache.delete(key);
      }
    }
  }

  private getKey(ip: string, userId?: string): string {
    return userId ? `${userId}:${ip}` : ip;
  }

  isLimited(ip: string, userId?: string): boolean {
    const key = this.getKey(ip, userId);
    const now = Date.now();
    
    let entry = this.cache.get(key);
    if (!entry || entry.expires < now) {
      entry = {
        count: 1,
        expires: now + this.config.windowMs,
        lastRequest: now
      };
      this.cache.set(key, entry);
      return false;
    }

    const timeSinceLastRequest = now - entry.lastRequest;
    if (timeSinceLastRequest < 100) {
      return true;
    }

    entry.count++;
    entry.lastRequest = now;
    
    return entry.count > this.config.maxRequests;
  }

  getRemainingRequests(ip: string, userId?: string): number {
    const key = this.getKey(ip, userId);
    const entry = this.cache.get(key);
    
    if (!entry || entry.expires < Date.now()) {
      return this.config.maxRequests;
    }
    
    return Math.max(0, this.config.maxRequests - entry.count);
  }

  getResetTime(ip: string, userId?: string): number {
    const key = this.getKey(ip, userId);
    const entry = this.cache.get(key);
    
    return entry ? entry.expires : Date.now();
  }
}

export const rateLimiters = {
  admin: new RateLimiter({ windowMs: 60000, maxRequests: 15 }),
  api: new RateLimiter({ windowMs: 60000, maxRequests: 30 }),
  auth: new RateLimiter({ windowMs: 60000, maxRequests: 5 }),
  public: new RateLimiter({ windowMs: 60000, maxRequests: 100 }),
  upload: new RateLimiter({ windowMs: 300000, maxRequests: 10 }),
  verify: new RateLimiter({ windowMs: 60000, maxRequests: 100 }),
  feedback: new RateLimiter({ windowMs: 60000, maxRequests: 5 })
};

export function getClientIP(req: Request): string {
  const headers = req.headers;
  
  const cfIP = headers.get('cf-connecting-ip');
  if (cfIP) return cfIP.trim();
  
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIP = forwarded.split(',')[0]?.trim();
    if (firstIP && firstIP !== 'unknown') return firstIP;
  }
  
  const realIP = headers.get('x-real-ip');
  if (realIP && realIP !== 'unknown') return realIP.trim();
  
  return 'unknown';
}

export function createRateLimitResponse(resetTime: number) {
  const headers = {
    'X-RateLimit-Reset': resetTime.toString(),
    'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
  };
  
  return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
    status: 429,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  });
}