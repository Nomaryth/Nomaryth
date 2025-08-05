export const SECURITY_CONFIG = {
  
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, 
    MAX_REQUESTS: 100, 
    ADMIN_WINDOW_MS: 5 * 60 * 1000, 
    ADMIN_MAX_REQUESTS: 200, 
  },

  SESSION: {
    ADMIN_TIMEOUT: 2 * 60 * 60 * 1000, 
    USER_TIMEOUT: 24 * 60 * 60 * 1000, 
    REFRESH_THRESHOLD: 30 * 60 * 1000, 
  },

  VALIDATION: {
    MAX_STRING_LENGTH: 1000,
    MAX_NAME_LENGTH: 50,
    MAX_DESCRIPTION_LENGTH: 500,
    MAX_TAG_LENGTH: 10,
    MIN_PASSWORD_LENGTH: 8,
  },

  SECURITY_HEADERS: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
                           'Content-Security-Policy': [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.gstatic.com https://www.googleapis.com https://apis.google.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: https: blob:",
            "connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://storage.googleapis.com https://api.github.com https://raw.githubusercontent.com https://openweathermap.org https://wttr.in",
            "frame-src 'self' https://www.google.com https://accounts.google.com https://nomarythweb.firebaseapp.com"
          ].join('; '),
  },

  ALLOWED_ORIGINS: [
    'https://nomaryth.vercel.app',
    'https://gghorizon.com',
    'http://localhost:3000',
    'http://localhost:9002',
  ],

         ALLOWED_URLS: [
           'https://api.github.com',
           'https://raw.githubusercontent.com',
           'https://openweathermap.org',
           'https://wttr.in',
           'https://api.weatherapi.com',
           'https://identitytoolkit.googleapis.com',
           'https://securetoken.googleapis.com',
           'https://firestore.googleapis.com',
           'https://storage.googleapis.com',
         ],

  LOGGING: {
    ENABLE_DEBUG_LOGS: process.env.NODE_ENV === 'development',
    LOG_ERRORS: true,
    LOG_SECURITY_EVENTS: true,
    LOG_RATE_LIMIT_VIOLATIONS: true,
  },
};

export function isAllowedURL(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return SECURITY_CONFIG.ALLOWED_URLS.some(allowed => 
      urlObj.origin === allowed || urlObj.hostname.endsWith(allowed.replace('https://', ''))
    );
  } catch {
    return false;
  }
}

export function isAllowedOrigin(origin: string): boolean {
  return SECURITY_CONFIG.ALLOWED_ORIGINS.includes(origin);
}

export function getSecurityHeaders(): Record<string, string> {
  return SECURITY_CONFIG.SECURITY_HEADERS;
}

export function shouldLog(level: 'debug' | 'error' | 'security' | 'rate_limit'): boolean {
  const config = SECURITY_CONFIG.LOGGING;
  
  switch (level) {
    case 'debug':
      return config.ENABLE_DEBUG_LOGS;
    case 'error':
      return config.LOG_ERRORS;
    case 'security':
      return config.LOG_SECURITY_EVENTS;
    case 'rate_limit':
      return config.LOG_RATE_LIMIT_VIOLATIONS;
    default:
      return false;
  }
} 