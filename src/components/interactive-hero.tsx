'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { BookOpen, Map, Play, Users, FileText, TrendingUp } from "lucide-react";
import Link from "next/link";
import { CloudinaryImage } from "@/components/cloudinary-image";
import { useTranslation } from "@/context/i18n-context";
import { Particles } from "@/components/particles";

interface InteractiveHeroProps {
  className?: string;
}

interface WorldStats {
  totalUsers: number;
  activeFactions: number;
  totalNews: number;
  worldProgress: number;
  monthlyGrowth: number;
  targetAchieved: number;
  onlineTime: string;
}

export function InteractiveHero({ className }: InteractiveHeroProps) {
  const { t } = useTranslation();
  const [stats, setStats] = useState<WorldStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/public/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className={`relative min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/20 ${className}`}>
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      <div className="absolute inset-0 pointer-events-none opacity-70">
        <Particles quantity={60} color="#f5d25f" />
      </div>
      <div className="absolute inset-0 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)] bg-[radial-gradient(1000px_600px_at_85%_25%,hsl(var(--accent)/0.20),transparent),radial-gradient(800px_500px_at_15%_75%,hsl(var(--primary)/0.12),transparent)]" />
      
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="space-y-4">
      <motion.div 
                className="flex items-center space-x-3 text-sm text-muted-foreground"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-primary/30" />
                  <div className="w-6 h-6 rounded-full bg-accent/20 border-2 border-accent/30" />
                  <div className="w-6 h-6 rounded-full bg-chart-3/20 border-2 border-chart-3/30" />
                </div>
                <span className="font-medium">
                  {!isLoading && stats ? `${formatNumber(stats.totalUsers)}+ Explorers` : 'Growing Community'}
                </span>
      </motion.div>

              <motion.h1 
                className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <span className="text-foreground">Explore the</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
                  History
                </span>
              </motion.h1>

              <motion.p 
                className="text-xl text-muted-foreground max-w-2xl leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
         >
          {t('home.tagline')}
              </motion.p>
            </div>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
            <Button 
            asChild 
            size="lg" 
                className="rounded-xl px-8 py-6 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Link href="/docs">
                  <BookOpen className="mr-3 h-6 w-6" />
                  Explore the History
            </Link>
          </Button>
              
            <Button 
            asChild 
            size="lg" 
                variant="outline"
                className="rounded-xl px-8 py-6 text-lg font-semibold border-amber-400/60 hover:bg-amber-50/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Link href="/projects">
                  <Map className="mr-3 h-6 w-6" />
                  Discover our Projects
            </Link>
          </Button>
            </motion.div>

            <motion.div 
              className="flex justify-center sm:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
            <Button 
              asChild 
              size="lg" 
  className="
    relative overflow-hidden px-8 py-6 text-lg font-semibold
    rounded-xl
    bg-primary text-primary-foreground
    shadow-lg shadow-primary/25 hover:bg-primary/90
    transition-all duration-300 group
    focus-visible:outline-none
    focus-visible:ring-4 focus-visible:ring-amber-300/70
    focus-visible:ring-offset-2 focus-visible:ring-offset-background
  "
>
  <Link
    href="https://launcher.gghorizon.com"
    target="_blank"
    rel="noopener noreferrer"
    className="relative flex items-center select-none"
  >
    <span aria-hidden="true" className="absolute -inset-y-2 -left-2 w-1/3 bg-white/40 blur-lg -skew-x-12 transform transition-transform duration-700 translate-x-[-120%] group-hover:translate-x-[280%] pointer-events-none" />
    <span aria-hidden="true" className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.22),transparent_60%)] pointer-events-none" />
     <Play className="relative mr-3 h-6 w-6 drop-shadow-md" />
     Open Launcher
  </Link>
</Button>

            </motion.div>
          </motion.div>

          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div
              className="relative w-full h-[500px] lg:h-[600px]"
              onContextMenu={(e) => e.preventDefault()}
            >
              <CloudinaryImage
                src="https://res.cloudinary.com/dlfc3hhsr/image/upload/e_background_removal/f_png/v1754822458/20250810_0405_image_fzxuik.png"
                alt="Nomaryth character"
                fill
                className="object-contain drop-shadow-2xl select-none pointer-events-none"
                priority
                quality={90}
                responsive={true}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>


            <motion.div 
              className="absolute top-8 -right-4 lg:right-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              <div className="bg-primary text-primary-foreground rounded-2xl p-4 shadow-xl">
                <div className="text-2xl font-bold">
                  {!isLoading && stats ? `${stats.worldProgress}%` : '98%'}
                </div>
                <div className="text-sm opacity-90">World Progress</div>
              </div>
            </motion.div>

            <motion.div 
              className="absolute bottom-20 -left-4 lg:left-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <div className="bg-card border-2 border-border rounded-2xl p-4 shadow-xl backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30" />
                    <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/30" />
                    <div className="w-6 h-6 rounded-full bg-chart-3/20 border border-chart-3/30" />
                    <div className="w-6 h-6 rounded-full bg-chart-4/20 border border-chart-4/30" />
                  </div>
                  <div>
                    <div className="text-xl font-bold">
                      {!isLoading && stats ? formatNumber(stats.activeFactions) : '8.5K+'}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Factions</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="absolute bottom-8 right-8 lg:right-16"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.4 }}
            >
              <div className="bg-card border-2 border-border rounded-2xl p-4 shadow-xl backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Documentation</div>
                    <div className="text-lg font-semibold">Available</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <motion.div 
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Community</h3>
            <p className="text-muted-foreground">
              {!isLoading && stats ? `${formatNumber(stats.totalUsers)} active explorers` : 'Growing community'}
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Map className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Quantity of Clans</h3>
            <p className="text-muted-foreground">
              {!isLoading && stats ? `${formatNumber(stats.activeFactions)} active factions` : 'Multiple projects'}
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-chart-2/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-chart-2" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Conclusion Progress</h3>
            <p className="text-muted-foreground">
              {!isLoading && stats ? `${stats.worldProgress}% world completion` : 'Ongoing development'}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}