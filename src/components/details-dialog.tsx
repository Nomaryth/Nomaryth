'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, GitFork, Star, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import DOMPurify from 'dompurify';
import { Repo } from "@/app/(app)/projects/page";
import { Skeleton } from "./ui/skeleton";
import Link from "next/link";
import { useTranslation } from "@/context/i18n-context";

interface MapLocation {
  id: string;
  name: string;
  description: string;
  x: number;
  y: number;
}

type Item = Repo | MapLocation;

interface DetailsDialogProps {
  item: Item | null;
  type: 'repo' | 'location';
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

async function getReadme(owner: string, repoName: string): Promise<string> {
    try {
        const readmeRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repoName}/main/README.md`);
        if(!readmeRes.ok) {
            const readmeMasterRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repoName}/master/README.md`);
            if(!readmeMasterRes.ok) return "Could not load README for this project.";
            const content = await readmeMasterRes.text();
            return DOMPurify.sanitize(content);
        }
        const content = await readmeRes.text();
        return DOMPurify.sanitize(content);

    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error("Error fetching README:", error);
        }
        return "Failed to fetch README content."
    }
}

const RepoDetails = ({ repo }: { repo: Repo }) => {
    const { t } = useTranslation();
    return (
        <div className="flex items-center gap-6 pt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-primary" />
                <span>{repo.stargazers_count.toLocaleString()} {t('projects.stars')}</span>
            </div>
            <div className="flex items-center gap-1.5">
                <GitFork className="h-4 w-4" />
                <span>{repo.forks_count.toLocaleString()} {t('projects.forks')}</span>
            </div>
             <div className="flex items-center gap-1.5">
                <TriangleAlert className="h-4 w-4" />
                <span>{repo.open_issues_count.toLocaleString()} open issues</span>
            </div>
       </div>
    )
}

export function DetailsDialog({ item, type, isOpen, onOpenChange }: DetailsDialogProps) {
  const [content, setContent] = useState<string>("");
  const [loadingContent, setLoadingContent] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    if (item && isOpen) {
        setLoadingContent(true);
        if (type === 'repo' && 'owner' in item) {
             getReadme(item.owner.login, item.name).then(readme => {
                setContent(readme);
                setLoadingContent(false);
            });
        } else if (type === 'location') {
            setContent(DOMPurify.sanitize(item.description));
            setLoadingContent(false);
        }
    }
  }, [item, isOpen, type]);

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader className="pr-6">
          <DialogTitle className="font-headline text-2xl">{item.name}</DialogTitle>
          <DialogDescription>
            {type === 'repo' ? ('description' in item && item.description) : ''}
          </DialogDescription>
           {type === 'repo' && <RepoDetails repo={item as Repo} />}
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-4 -mr-6">
            {loadingContent ? (
                <div className="space-y-4">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            ) : (
                <article className="prose prose-sm dark:prose-invert max-w-none">
                     <ReactMarkdown>{content}</ReactMarkdown>
                </article>
            )}
        </div>
        {type === 'repo' && 'html_url' in item && (
             <div className="pt-4 border-t">
                <Button asChild>
                    <Link href={item.html_url} target="_blank">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        {t('projects.github_link')}
                    </Link>
                </Button>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
