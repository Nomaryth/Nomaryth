'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Particles } from '@/components/particles';
import { useTranslation } from '@/context/i18n-context';
import { ReactNode } from 'react';
import { Home, BookOpen } from 'lucide-react';

interface ErrorDisplayProps {
  errorCode: string;
  title: string;
  description: string;
  details?: ReactNode;
  icon?: ReactNode;
}

export function ErrorDisplay({ errorCode, title, description, details, icon }: ErrorDisplayProps) {
  const { t } = useTranslation();

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center px-4 py-8 overflow-hidden">
        <Particles
            className="absolute inset-0 -z-10"
            quantity={100}
            color="hsl(var(--accent))"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent -z-10" />

        <div className="flex flex-col items-center justify-center animate-fadeIn">
            <h1 className="text-8xl md:text-9xl font-bold font-headline text-accent drop-shadow-[0_0_15px_hsl(var(--accent)/0.7)]">
            {errorCode}
            </h1>
            <div className="w-24 h-1 bg-accent rounded-full my-4" />
            <h2 className="text-3xl md:text-4xl font-semibold mt-2 mb-4 font-headline">
            {title}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg">
            {description}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/">
                    <Home className="mr-2 h-5 w-5" />
                    {t('error_pages.buttons.go_home')}
                </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-accent/50 hover:bg-accent/10 hover:text-accent-foreground">
                <Link href="/docs">
                    <BookOpen className="mr-2 h-5 w-5" />
                    {t('error_pages.buttons.explore_docs')}
                </Link>
            </Button>
            </div>
            {details}
            {icon}
        </div>
    </div>
  );
}
