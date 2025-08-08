import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
  async headers() {
    const isProd = process.env.NODE_ENV === 'production';
    const scriptSrc = isProd
      ? [
          "'self'",
          "'unsafe-inline'", // TEMP: evitar tela branca até nonce dinâmico
          'https://va.vercel-scripts.com',
          'https://analytics.umami.is',
          'https://us.umami.is',
          'https://static.cloudflareinsights.com',
        ].join(' ')
      : [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'https://va.vercel-scripts.com',
          'https://analytics.umami.is',
          'https://us.umami.is',
          'https://static.cloudflareinsights.com',
        ].join(' ');

    const connectSrc = [
      "'self'",
      'https://www.googleapis.com',
      'https://apis.google.com',
      'https://api.open-meteo.com',
      'https://geocoding-api.open-meteo.com',
      'https://va.vercel-scripts.com',
      'https://analytics.umami.is',
      'https://us.umami.is',
      'https://identitytoolkit.googleapis.com',
      'https://securetoken.googleapis.com',
      'https://firestore.googleapis.com',
      'https://storage.googleapis.com',
      'https://api.github.com',
      'https://raw.githubusercontent.com',
      'https://static.cloudflareinsights.com',
    ].join(' ');

    const csp = [
      "default-src 'self'",
      `script-src ${scriptSrc}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      `connect-src ${connectSrc}`,
      "frame-src 'self' https://www.google.com https://accounts.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; ');
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // CSP dinâmica com nonce definida em src/middleware.ts
        ],
      },
      {
        source: '/admin/(.*)',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },

  images: {
    domains: [
      'firebasestorage.googleapis.com', 
      'lh3.googleusercontent.com',
      'github.com',
      'raw.githubusercontent.com',
      'placehold.co',
      's3.nyeki.dev',
      'avatar.vercel.sh',
      'images.unsplash.com',
      'via.placeholder.com'
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.gstatic.com https://www.googleapis.com https://apis.google.com https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://www.googleapis.com https://apis.google.com;",
  },

  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  webpack: (config, { dev, isServer }) => {
    
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      };
    }

    return config;
  },

  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  
  async rewrites() {
    return [
      {
        source: '/api/geolocation',
        destination: '/api/geolocation',
      },
      {
        source: '/api/weather',
        destination: '/api/weather',
      },
    ];
  },
};

export default nextConfig;
