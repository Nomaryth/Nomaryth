import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://gghorizon.com';
  const now = new Date();

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/sobre`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/wiki`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/artigos`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/map`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/factions`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/projects`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/docs`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${base}/feedback`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
  ];
}


