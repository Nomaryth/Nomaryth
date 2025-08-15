'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { BookOpen, Map, Play, Users, FileText, TrendingUp, Sparkles, Zap, Globe, Crown, Sword, Shield } from "lucide-react";
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
    <div className={`relative min-h-screen w-full overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90" />
      
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-accent/30 to-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-primary/20 to-accent/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-accent/20 to-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse-slow" />
      </div>
      
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />
      
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <Particles quantity={80} color="hsl(var(--accent))" />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="space-y-6">
              <motion.div 
                className="inline-flex items-center space-x-3 bg-card/50 backdrop-blur-sm border border-border/50 rounded-full px-4 py-2 text-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex -space-x-1">
                  <div className="w-5 h-5 rounded-full bg-green-500/80 animate-pulse" />
                  <div className="w-5 h-5 rounded-full bg-yellow-400/80 animate-pulse" style={{ animationDelay: '0.5s' }} />
                  <div className="w-5 h-5 rounded-full bg-primary/70 animate-pulse" style={{ animationDelay: '1s' }} />
                </div>
                <span className="font-medium text-foreground">
                  {!isLoading && stats ? `${formatNumber(stats.totalUsers)}+ Active Explorers` : 'Growing Community'}
                </span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </motion.div>

              <motion.h1 
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <span className="block text-foreground">Discover the</span>
                <span className="block">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-accent bg-[length:200%_auto] animate-gradient-x">
                    Untold Stories
                  </span>
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
                className="group relative overflow-hidden rounded-2xl px-8 py-4 text-lg font-semibold bg-gradient-to-r from-accent via-primary to-accent bg-[length:200%_auto] text-white hover:bg-pos-100 hover:shadow-2xl hover:shadow-accent/30 transition-all duration-500 transform hover:scale-[1.02]"
              >
                <Link href="/docs" className="flex items-center">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <BookOpen className="relative mr-3 h-5 w-5 drop-shadow-sm" />
                  <span className="relative drop-shadow-sm">Explore the Lore</span>
                </Link>
              </Button>
              
              <Button 
                asChild 
                size="lg" 
                className="group relative overflow-hidden rounded-2xl px-8 py-4 text-lg font-semibold bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 backdrop-blur-sm border-2 border-primary/30 text-foreground hover:border-accent/50 hover:bg-gradient-to-r hover:from-accent/30 hover:to-primary/30 transition-all duration-500 transform hover:scale-[1.02]"
              >
                <Link href="/factions" className="flex items-center">
                  <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Crown className="relative mr-3 h-5 w-5" />
                  <span className="relative">Join a Faction</span>
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
                className="group relative overflow-hidden rounded-2xl px-8 py-4 text-lg font-semibold bg-gradient-to-r from-green-600/90 via-emerald-600/90 to-green-600/90 text-white hover:shadow-2xl hover:shadow-green-500/30 transition-all duration-500 transform hover:scale-[1.02]"
              >
                <Link
                  href="https://launcher.gghorizon.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex items-center select-none"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span aria-hidden="true" className="absolute -inset-y-2 -left-2 w-1/3 bg-white/30 blur-lg -skew-x-12 transform transition-transform duration-700 translate-x-[-120%] group-hover:translate-x-[280%] pointer-events-none" />
                  <Play className="relative mr-3 h-5 w-5 drop-shadow-sm" />
                  <span className="relative drop-shadow-sm">Open Launcher</span>
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
                    <Sparkles className="h-5 w-5 text-primary" />
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
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="group relative bg-card/30 backdrop-blur-md border border-border/50 rounded-3xl p-8 text-center hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground">Community</h3>
              <p className="text-lg font-semibold text-primary mb-2">
                {!isLoading && stats ? formatNumber(stats.totalUsers) : '2.5K+'}
              </p>
              <p className="text-muted-foreground">Active explorers discovering new worlds</p>
            </div>
          </div>

          <div className="group relative bg-card/30 backdrop-blur-md border border-border/50 rounded-3xl p-8 text-center hover:shadow-2xl hover:shadow-accent/5 transition-all duration-500 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground">Active Factions</h3>
              <p className="text-lg font-semibold text-accent mb-2">
                {!isLoading && stats ? formatNumber(stats.activeFactions) : '150+'}
              </p>
              <p className="text-muted-foreground">Guilds forging their destinies</p>
            </div>
          </div>

          <div className="group relative bg-card/30 backdrop-blur-md border border-border/50 rounded-3xl p-8 text-center hover:shadow-2xl hover:shadow-green-500/5 transition-all duration-500 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground">World Progress</h3>
              <p className="text-lg font-semibold text-green-500 mb-2">
                {!isLoading && stats ? `${stats.worldProgress}%` : '94%'}
              </p>
              <p className="text-muted-foreground">Stories waiting to be told</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}