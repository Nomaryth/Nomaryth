'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Code, GitFork, TriangleAlert, Activity, Clock, Filter, SortAsc, SortDesc, Tag, Flame, Zap } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/context/i18n-context";
import { useEffect, useMemo, useState } from "react";

import { DetailsDialog } from "@/components/details-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnimatePresence, motion } from "framer-motion";

export interface LanguageData {
  [language: string]: number;
}

export interface Repo {
  id: number;
  name: string;
  html_url: string;
  description: string;
  stargazers_count: number;
  language: string;
  languages_url: string;
  languages_data: LanguageData;
  topics: string[];
  owner: {
    login: string;
  };
  forks_count: number;
  open_issues_count: number;
  updated_at: string;
}

async function getRepos(): Promise<Repo[]> {
  try {
    const res = await fetch("https://api.github.com/orgs/Nomaryth/repos", {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch repos. Status: ${res.status}`);
    }
    
    const repos: Repo[] = await res.json();

    const reposWithLanguages = await Promise.all(
        repos.map(async (repo) => {
            try {
                const langRes = await fetch(repo.languages_url);
                if (!langRes.ok) {
                  return { ...repo, languages_data: {} };
                }
                const languages_data: LanguageData = await langRes.json();
                return { ...repo, languages_data };
            } catch (error) {
                console.error(`Failed to fetch languages for ${repo.name}:`, error);
                return { ...repo, languages_data: {} };
            }
        })
    );

    return reposWithLanguages.sort((a, b) => b.stargazers_count - a.stargazers_count);
  } catch (error) {
    console.error("Error fetching repositories:", error);
    return [];
  }
}

const LanguageProgressBar = ({ languages }: { languages: LanguageData }) => {
    const total = Object.values(languages).reduce((acc, val) => acc + val, 0);
    if (total === 0) return null;

    const languageColors: { [key: string]: string } = {
        "TypeScript": "bg-blue-500",
        "JavaScript": "bg-yellow-400",
        "HTML": "bg-orange-500",
        "CSS": "bg-blue-400",
        "Shell": "bg-green-400",
        "Dockerfile": "bg-sky-400",
        "default": "bg-gray-500"
    };

    return (
        <div className="flex h-2 w-full rounded-full overflow-hidden bg-muted mt-2">
            {Object.entries(languages).map(([lang, count]) => (
                <div
                    key={lang}
                    className={`${languageColors[lang] || languageColors.default}`}
                    style={{ width: `${(count / total) * 100}%` }}
                    title={`${lang}: ${((count / total) * 100).toFixed(1)}%`}
                />
            ))}
        </div>
    );
};


function ProjectsPageContent() {
  const { t } = useTranslation();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("all");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"stars"|"updated"|"name"|"forks">("stars");
  const [sortDir, setSortDir] = useState<"desc"|"asc">("desc");
  const [visible, setVisible] = useState(9);

  useEffect(() => {
    getRepos().then(data => {
      setRepos(data);
      setLoading(false);
    });
  }, []);
  const allLanguages = useMemo(() => {
    const set = new Set<string>();
    repos.forEach(r => { if (r.language) set.add(r.language) });
    return ["all", ...Array.from(set).sort()];
  }, [repos]);
  const allTags = useMemo(() => {
    const set = new Set<string>();
    repos.forEach(r => (r.topics||[]).forEach(t => set.add(t)));
    return Array.from(set).slice(0, 20).sort();
  }, [repos]);
  const totals = useMemo(() => ({
    projects: repos.length,
    stars: repos.reduce((a,r)=>a+r.stargazers_count,0),
    forks: repos.reduce((a,r)=>a+r.forks_count,0),
    issues: repos.reduce((a,r)=>a+r.open_issues_count,0),
  }), [repos]);
  const filtered = useMemo(() => {
    const text = search.trim().toLowerCase();
    let list = repos.filter(r => {
      if (language !== "all" && r.language !== language) return false;
      if (activeTags.length && !activeTags.every(t => (r.topics||[]).includes(t))) return false;
      if (!text) return true;
      return (
        r.name.toLowerCase().includes(text) ||
        (r.description || "").toLowerCase().includes(text) ||
        (r.topics||[]).some(t => t.toLowerCase().includes(text))
      );
    });
    list = list.sort((a,b)=>{
      let cmp = 0;
      if (sortBy === "stars") cmp = a.stargazers_count - b.stargazers_count;
      else if (sortBy === "updated") cmp = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      else cmp = a.name.localeCompare(b.name);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [repos, search, language, activeTags, sortBy, sortDir]);
  const toggleTag = (tag: string) => setActiveTags(prev => prev.includes(tag) ? prev.filter(t=>t!==tag) : [...prev, tag]);
  
  if (loading) {
      return (
        <div className="container mx-auto py-10 px-4">
            <div className="text-center mb-12">
                <div className="h-10 bg-muted rounded w-1/2 mx-auto animate-pulse"></div>
                <div className="h-6 bg-muted rounded w-3/4 mx-auto mt-4 animate-pulse"></div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <Card key={i} className="flex flex-col bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <div className="h-6 bg-muted rounded w-3/4 animate-pulse"></div>
                            <div className="h-4 bg-muted rounded w-1/2 mt-2 animate-pulse"></div>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                            <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                            <div className="h-4 bg-muted rounded w-2/3 animate-pulse"></div>
                        </CardContent>
                        <CardFooter>
                            <div className="h-2 bg-muted rounded w-full animate-pulse"></div>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
      )
  }

  return (
    <>
    <div className="container mx-auto py-10 px-4">
      <div className="relative text-center mb-8">
        <div className="pointer-events-none absolute inset-x-0 -top-24 h-48 blur-3xl opacity-30 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30" />
        <h1 className="text-4xl md:text-5xl font-bold font-headline mb-2">
          {t('projects.title')}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('projects.subtitle')}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Projects</CardTitle></CardHeader><CardContent className="pt-0 text-2xl font-bold">{totals.projects}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Stars</CardTitle></CardHeader><CardContent className="pt-0 text-2xl font-bold">{totals.stars.toLocaleString()}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Forks</CardTitle></CardHeader><CardContent className="pt-0 text-2xl font-bold">{totals.forks.toLocaleString()}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Open Issues</CardTitle></CardHeader><CardContent className="pt-0 text-2xl font-bold">{totals.issues.toLocaleString()}</CardContent></Card>
      </div>
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center mb-6">
        <div className="relative flex-1">
          <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.2 }}>
            <Input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search projects or tags" className="pl-9" />
            <Filter className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </motion.div>
        </div>
        <motion.div initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.2, delay: 0.05 }}>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Language" /></SelectTrigger>
          <SelectContent>
            {allLanguages.map(l => (<SelectItem key={l} value={l}>{l}</SelectItem>))}
          </SelectContent>
        </Select>
        </motion.div>
        <motion.div initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.2, delay: 0.1 }}>
        <Select value={sortBy} onValueChange={(v)=>setSortBy(v as 'name' | 'stars' | 'updated' | 'forks')}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="stars">Stars</SelectItem>
            <SelectItem value="updated">Last Updated</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
        </motion.div>
        <motion.div initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.2, delay: 0.15 }}>
        <Button variant="outline" onClick={()=>setSortDir(d=>d==='asc'?'desc':'asc')} className="w-[44px] p-0">
          {sortDir==='asc'?<SortAsc className="h-4 w-4"/>:<SortDesc className="h-4 w-4"/>}
        </Button>
        </motion.div>
      </div>
      {allTags.length>0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {allTags.map(tag => (
            <Button key={tag} variant={activeTags.includes(tag)?'default':'outline'} size="sm" onClick={()=>toggleTag(tag)} className="h-7">
              <Tag className="h-3 w-3 mr-1" />{tag}
            </Button>
          ))}
        </div>
      )}
      
      {repos.length === 0 && !loading ? (
        <Card className="text-center p-8 max-w-lg mx-auto">
          <CardHeader>
             <CardTitle className="flex items-center justify-center gap-2">
                <TriangleAlert className="h-6 w-6 text-destructive" />
                {t('projects.load_error_title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>{t('projects.load_error_desc')}</CardDescription>
          </CardContent>
        </Card>
      ) : (
        <>
        <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" initial={false} layout>
          <AnimatePresence>
            {filtered.slice(0, visible).map((repo, idx) => {
              const isHot = repo.stargazers_count >= 50;
              const isFresh = Date.now() - new Date(repo.updated_at).getTime() < 1000*60*60*24*14;
              return (
                <motion.div key={repo.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12, scale: 0.98 }} transition={{ duration: 0.22, delay: idx*0.02, ease: 'easeOut' }} whileHover={{ y: -3 }}>
                  <Card className="group relative flex flex-col bg-gradient-to-b from-card/70 to-card/40 border-border/60 hover:border-primary/60 transition-all duration-300 hover:shadow-xl">
                    <div className="absolute right-3 top-3 flex gap-2">
                      {isHot && <Badge variant="secondary" className="flex items-center gap-1 text-xs"><Flame className="h-3 w-3 text-amber-500"/>Hot</Badge>}
                      {isFresh && <Badge variant="secondary" className="flex items-center gap-1 text-xs"><Zap className="h-3 w-3 text-green-500"/>Updated</Badge>}
                    </div>
                    <CardHeader>
                      <CardTitle className="font-headline text-lg group-hover:text-primary transition-colors">{repo.name}</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">{t('projects.by')} {repo.owner.login}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                      <p className="text-sm line-clamp-3 h-[60px]">{repo.description || t('projects.no_description')}</p>
                      <div className="flex flex-wrap gap-2">
                        {(repo.topics||[]).slice(0, 3).map((topic) => (
                          <Badge key={topic} variant="secondary">{topic}</Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="flex-col items-start pt-4 gap-3">
                      <div className="flex justify-between w-full text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-primary" />
                          <span>{repo.stargazers_count.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <GitFork className="w-4 h-4" />
                          <span>{repo.forks_count.toLocaleString()}</span>
                        </div>
                        {repo.language && (
                          <div className="flex items-center gap-2">
                            <Code className="w-4 h-4" />
                            <span>{repo.language}</span>
                          </div>
                        )}
                      </div>
                      <div className="w-full flex justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          <span>{repo.open_issues_count} issues</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(repo.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <LanguageProgressBar languages={repo.languages_data} />
                      <div className="flex gap-2 pt-1">
                        <Button variant="secondary" size="sm" onClick={()=>setSelectedRepo(repo)}>Details</Button>
                        <Link href={repo.html_url} target="_blank" className="inline-flex"><Button variant="outline" size="sm">GitHub</Button></Link>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
        {visible < filtered.length && (
          <div className="flex justify-center mt-8">
            <Button variant="outline" onClick={()=>setVisible(v=>v+9)}>Load more</Button>
          </div>
        )}
        </>
      )}
    </div>
    
    <DetailsDialog
        item={selectedRepo}
        type="repo"
        isOpen={!!selectedRepo}
        onOpenChange={(isOpen) => {
            if (!isOpen) {
                setSelectedRepo(null);
            }
        }}
    />
    </>
  );
}

export default function ProjectsPage() {
    return <ProjectsPageContent />
}
