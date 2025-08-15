import { NextRequest, NextResponse } from 'next/server';
import { rateLimiters, getClientIP, createRateLimitResponse } from '@/lib/rate-limiter';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  clone_url: string;
  language: string | null;
  languages_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  updated_at: string;
  created_at: string;
  topics: string[];
  private: boolean;
  archived: boolean;
  disabled: boolean;
  fork: boolean;
  owner: {
    login: string;
    [key: string]: any;
  };
}

const repoCache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 30 * 60 * 1000;

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    if (rateLimiters.admin.isLimited(ip)) {
      const resetTime = rateLimiters.admin.getResetTime(ip);
      return createRateLimitResponse(resetTime);
    }

    const cacheKey = 'public_repos';
    const cached = repoCache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600'
        }
      });
    }

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Nomaryth-Web-App'
    };

    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    const orgResponse = await fetch('https://api.github.com/orgs/Nomaryth/repos?per_page=100&sort=updated', {
      headers,
      next: { revalidate: 1800 }
    });

    if (!orgResponse.ok) {
      console.error('GitHub API error:', orgResponse.status, orgResponse.statusText);
      
      if (orgResponse.status === 403 && cached) {
        return NextResponse.json(cached.data);
      }
      
      throw new Error(`GitHub API error: ${orgResponse.status}`);
    }

    const allRepos: GitHubRepo[] = await orgResponse.json();

    const publicRepos = allRepos.filter(repo => 
      !repo.private &&
      !repo.archived &&
      !repo.disabled &&
      !repo.name.startsWith('.')
    );

    const reposWithLanguages = await Promise.all(
      publicRepos.map(async (repo) => {
        try {
          const langResponse = await fetch(repo.languages_url, {
            headers,
            next: { revalidate: 3600 }
          });
          
          if (!langResponse.ok) {
            return {
              ...repo,
              languages_data: {}
            };
          }
          
          const languages_data = await langResponse.json();
          return {
            ...repo,
            languages_data
          };
        } catch (error) {
          console.error(`Failed to fetch languages for ${repo.name}:`, error);
          return {
            ...repo,
            languages_data: {}
          };
        }
      })
    );

    const sortedRepos = reposWithLanguages.sort((a, b) => 
      b.stargazers_count - a.stargazers_count
    );

    const sanitizedRepos = sortedRepos.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      html_url: repo.html_url,
      language: repo.language,
      languages_url: repo.languages_url,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      open_issues_count: repo.open_issues_count,
      updated_at: repo.updated_at,
      created_at: repo.created_at,
      topics: repo.topics || [],
      languages_data: repo.languages_data || {},
      owner: {
        login: repo.owner?.login || 'Nomaryth'
      },
    }));

    repoCache.set(cacheKey, {
      data: sanitizedRepos,
      expires: Date.now() + CACHE_TTL
    });

    console.log(`Served ${sanitizedRepos.length} public repositories (filtered from ${allRepos.length} total)`);

    return NextResponse.json(sanitizedRepos, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600'
      }
    });

  } catch (error) {
    console.error('Error fetching public repositories:', error);
    
    const cached = repoCache.get('public_repos');
    if (cached) {
      console.log('Returning cached data due to error');
      return NextResponse.json(cached.data);
    }

    const fallbackRepos = [
      {
        id: 1,
        name: 'nomaryth-web',
        full_name: 'Nomaryth/nomaryth-web',
        description: 'Official Nomaryth website and web application',
        html_url: 'https://github.com/Nomaryth/nomaryth-web',
        language: 'TypeScript',
        languages_url: '',
        stargazers_count: 0,
        forks_count: 0,
        open_issues_count: 0,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        topics: ['nextjs', 'typescript', 'react', 'nomaryth'],
        languages_data: { TypeScript: 85, JavaScript: 10, CSS: 5 },
        owner: {
          login: 'Nomaryth'
        }
      }
    ];
    
    console.log('Returning fallback repositories due to GitHub API error');
    return NextResponse.json(fallbackRepos, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  }
}

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of repoCache.entries()) {
    if (value.expires < now) {
      repoCache.delete(key);
    }
  }
}, 5 * 60 * 1000);