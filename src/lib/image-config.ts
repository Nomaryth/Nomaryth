export const imageConfig = {
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
  contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
};

export function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return imageConfig.domains.some(domain => urlObj.hostname === domain);
  } catch {
    return false;
  }
}

export const fallbackImageUrl = 'https://via.placeholder.com/800x400/1f2937/ffffff?text=Nomaryth'; 