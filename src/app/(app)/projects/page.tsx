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
import { ExternalLink, Star, Code, Users, GitFork, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/context/i18n-context";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DetailsDialog } from "@/components/details-dialog";

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
  languages_data: LanguageData;
  topics: string[];
  owner: {
    login: string;
  };
  forks_count: number;
  open_issues_count: number;
}

async function getRepos(): Promise<Repo[]> {
  try {
    const res = await fetch("https://api.github.com/orgs/Nomaryth/repos", {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch repos. Status: ${res.status}`);
    }
    
    let repos: Repo[] = await res.json();

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

  useEffect(() => {
    getRepos().then(data => {
      setRepos(data);
      setLoading(false);
    });
  }, []);
  
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
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline mb-2">
          {t('projects.title')}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('projects.subtitle')}
        </p>
      </div>
      
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repos.map((repo) => (
             <Card 
                key={repo.id} 
                className="flex flex-col hover:border-primary transition-colors duration-300 bg-card/50 backdrop-blur-sm cursor-pointer group"
                onClick={() => setSelectedRepo(repo)}
            >
              <CardHeader>
                <CardTitle className="font-headline text-lg group-hover:text-primary transition-colors">{repo.name}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">{t('projects.by')} {repo.owner.login}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <p className="text-sm line-clamp-3 h-[60px]">{repo.description || t('projects.no_description')}</p>
                <div className="flex flex-wrap gap-2">
                  {repo.topics.slice(0, 3).map((topic) => (
                    <Badge key={topic} variant="secondary">{topic}</Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex-col items-start pt-4">
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
                 <LanguageProgressBar languages={repo.languages_data} />
              </CardFooter>
            </Card>
          ))}
        </div>
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
