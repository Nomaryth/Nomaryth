'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, ArrowRight, ArrowLeft, Tag, Github } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

type LanguageData = Record<string, number>;

type Repo = {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  languages_url: string;
  topics?: string[];
  owner: { login: string };
  updated_at: string;
  languages_data?: LanguageData; // Campo necessário para processamento de linguagens
};

function formatTopics(topics?: string[]) {
  if (!topics || topics.length === 0) return [] as string[];
  return topics.slice(0, 4);
}

function getGradientByLang(lang?: string | null) {
  const l = (lang || '').toLowerCase();
  if (l.includes('ts') || l.includes('typescript')) return 'from-sky-400/20 to-blue-500/10';
  if (l.includes('js') || l.includes('javascript')) return 'from-yellow-400/20 to-amber-500/10';
  if (l.includes('css')) return 'from-fuchsia-400/20 to-pink-500/10';
  if (l.includes('go')) return 'from-cyan-400/20 to-teal-500/10';
  if (l.includes('rust')) return 'from-orange-400/20 to-red-500/10';
  if (l.includes('python')) return 'from-emerald-400/20 to-teal-500/10';
  return 'from-amber-400/10 to-yellow-300/10';
}

export function FeaturedProjects() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const res = await fetch('/api/public/repos', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed repos');
        
        const data = await res.json();
        let repos: Repo[] = [];
        
        if (data.error && Array.isArray(data.repos)) {
          repos = data.repos;
        } else if (Array.isArray(data)) {
          repos = data;
        }
        
        const withTopLang = repos.map(r => {
          if (r.languages_data && Object.keys(r.languages_data).length > 0) {
            const languageEntries = Object.entries(r.languages_data);
            const topLanguage = languageEntries.sort(([, a], [, b]) => b - a)[0]?.[0] || r.language || null;
            return { ...r, language: topLanguage };
          }
          return r;
        });
        
        const sorted = withTopLang
          .filter(r => !r.name.startsWith('.'))
          .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .slice(0, 8);
        setRepos(sorted);
      } catch (error) {
        console.error('Error fetching featured repos:', error);
        setRepos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRepos();
  }, []);

  const chunks = useMemo(() => repos, [repos]);

  const scrollBy = (dir: number) => {
    const el = viewportRef.current;
    if (!el) return;
    const w = el.clientWidth;
    el.scrollBy({ left: dir * Math.max(320, Math.floor(w * 0.8)), behavior: 'smooth' });
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-4xl font-bold font-headline text-primary">Featured Projects</h2>
            <p className="text-muted-foreground">Highlights from the Nomaryth organization</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => scrollBy(-1)} aria-label="Previous" className="border-amber-300/50 hover:bg-amber-50/60"><ArrowLeft className="h-5 w-5" /></Button>
            <Button variant="outline" size="icon" onClick={() => scrollBy(1)} aria-label="Next" className="border-amber-300/50 hover:bg-amber-50/60"><ArrowRight className="h-5 w-5" /></Button>
          </div>
        </div>

        <div ref={viewportRef} className="relative overflow-x-auto scroll-smooth">
          <div className="flex gap-6 min-w-full pr-4 snap-x snap-mandatory">
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="bg-card/50 border-border/50 h-40 animate-pulse" />
                ))}
              </div>
            )}

            {!loading && chunks.map((repo, idx) => (
              <motion.div
                key={repo.id}
                className="snap-start shrink-0 w-[320px] md:w-[380px]"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <Card className={`relative overflow-hidden border border-border/60 bg-gradient-to-br ${getGradientByLang(repo.language)} backdrop-blur`}> 
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Github className="h-4 w-4" />
                        <span>{repo.owner?.login || 'Nomaryth'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <Star className="h-4 w-4" />
                        <span className="text-sm font-medium">{repo.stargazers_count}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold line-clamp-1">{repo.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{repo.description || 'No description provided.'}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formatTopics(repo.topics).map((t) => (
                        <span key={t} className="inline-flex items-center gap-1 rounded-full border border-amber-300/50 bg-amber-50/60 dark:bg-amber-950/20 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-300">
                          <Tag className="h-3 w-3" />
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{repo.language || 'Unknown'}</span>
                      <Button asChild size="sm" className="rounded-lg bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-900 hover:opacity-95 shadow-[0_10px_30px_-12px_rgba(245,181,39,0.55)]">
                        <Link href={repo.html_url} target="_blank" rel="noopener noreferrer">
                          View
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}