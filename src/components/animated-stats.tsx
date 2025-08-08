'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, BookOpen, Map, Zap, TrendingUp, Target, Clock, Star } from "lucide-react";
import { useTranslation } from "@/context/i18n-context";

interface StatItem {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  color: string;
  progress?: number;
}

interface AnimatedStatsProps {
  className?: string;
}

export function AnimatedStats({ className }: AnimatedStatsProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [counters, setCounters] = useState<Record<string, number>>({});
  const [worldStats, setWorldStats] = useState<any>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const fetchStats = async () => {
      try {
        // usar endpoint público de leitura
        const response = await fetch('/api/public/stats');
        if (response.ok) {
          const stats = await response.json();
          setWorldStats(stats);
        }
      } catch (error) {
        console.error('Error fetching world stats:', error);
      }
    };

    fetchStats();
  }, [isClient, user]);

  useEffect(() => {
    if (!isClient) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [isClient]);

  useEffect(() => {
    if (!isVisible || !isClient || !worldStats) return;

    const items = [
      { key: 'users', value: worldStats.totalUsers || 0 },
      { key: 'factions', value: worldStats.activeFactions || 0 },
      { key: 'news', value: worldStats.totalNews || 0 },
      { key: 'progress', value: worldStats.worldProgress || 0 },
    ];

    items.forEach((item) => {
      const key = item.key;
      const targetValue = Number.isFinite(item.value) ? item.value : 0;
      const duration = 2000;
      const steps = 60;
      const increment = targetValue / steps;
      let currentValue = 0;

      const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
          currentValue = targetValue;
          clearInterval(timer);
        }

        setCounters((prev) => ({
          ...prev,
          [key]: Math.floor(currentValue),
        }));
      }, duration / steps);

      return () => clearInterval(timer);
    });
  }, [isVisible, isClient, worldStats]);

  const stats: (StatItem & { key: string })[] = [
    {
      key: 'users',
      icon: <Users className="w-6 h-6" />,
      label: t('home.stats.items.users'),
      value: worldStats?.totalUsers || 0,
      color: "text-blue-600",
      progress: worldStats ? Math.round(Math.min((worldStats.totalUsers / 2000) * 100, 100)) : 0
    },
    {
      key: 'factions',
      icon: <BookOpen className="w-6 h-6" />,
      label: t('home.stats.items.factions'),
      value: worldStats?.activeFactions || 0,
      color: "text-green-600",
      progress: worldStats ? Math.round(Math.min((worldStats.activeFactions / 150) * 100, 100)) : 0
    },
    {
      key: 'news',
      icon: <Map className="w-6 h-6" />,
      label: t('home.stats.items.news'),
      value: worldStats?.totalNews || 0,
      color: "text-purple-600",
      progress: worldStats ? Math.round(Math.min((worldStats.totalNews / 200) * 100, 100)) : 0
    },
    {
      key: 'progress',
      icon: <Zap className="w-6 h-6" />,
      label: t('home.stats.items.progress'),
      value: worldStats?.worldProgress || 0,
      color: "text-orange-600",
      progress: worldStats ? Math.round(Math.min((worldStats.worldProgress / 100) * 100, 100)) : 0
    }
  ];

  return (
    <section className={`py-20 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold font-headline text-primary mb-4">
            {t('home.stats.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('home.stats.subtitle')}
          </p>
        </div>

        <div ref={statsRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card 
              key={stat.label}
              className={`bg-card/50 border-border/50 hover:border-accent transition-all duration-500 transform hover:scale-105 hover:shadow-xl ${
                isVisible ? 'animate-fadeIn' : 'opacity-0'
              }`}
              style={{ 
                animationDelay: `${index * 0.2}s`,
                animationDuration: isVisible ? '0.8s' : '0s',
                animationTimingFunction: 'ease-out',
                animationFillMode: 'forwards',
                animationName: isVisible ? 'fadeIn' : 'none'
              }}
            >
              <CardHeader className="text-center pb-4">
                <div className={`mx-auto p-3 bg-accent/10 rounded-full mb-3 ${stat.color}`}>
                  {stat.icon}
                </div>
                <CardTitle className="text-lg font-headline">{stat.label}</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="text-3xl font-bold text-primary">
                  {isClient && counters[stat.key] !== undefined 
                    ? counters[stat.key].toLocaleString() 
                    : '0'
                  }
                </div>
                
                {stat.progress && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{t('home.stats.metrics.progress')}</span>
                      <span>{stat.progress}%</span>
                    </div>
                    <Progress 
                      value={isVisible ? stat.progress : 0} 
                      className="h-2"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className={`text-center space-y-4 ${
            isVisible ? 'animate-fadeIn' : 'opacity-0'
          }`} style={{ 
            animationDelay: '0.8s',
            animationDuration: isVisible ? '0.8s' : '0s',
            animationTimingFunction: 'ease-out',
            animationFillMode: 'forwards',
            animationName: isVisible ? 'fadeIn' : 'none'
          }}>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm">{t('home.stats.metrics.monthly_growth')}</span>
            </div>
            <div className="text-2xl font-bold text-green-600">+{worldStats?.monthlyGrowth || 23}%</div>
          </div>

          <div className={`text-center space-y-4 ${
            isVisible ? 'animate-fadeIn' : 'opacity-0'
          }`} style={{ 
            animationDelay: '1s',
            animationDuration: isVisible ? '0.8s' : '0s',
            animationTimingFunction: 'ease-out',
            animationFillMode: 'forwards',
            animationName: isVisible ? 'fadeIn' : 'none'
          }}>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Target className="w-5 h-5" />
              <span className="text-sm">{t('home.stats.metrics.target_achieved')}</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{worldStats?.targetAchieved || 78}%</div>
          </div>

          <div className={`text-center space-y-4 ${
            isVisible ? 'animate-fadeIn' : 'opacity-0'
          }`} style={{ 
            animationDelay: '1.2s',
            animationDuration: isVisible ? '0.8s' : '0s',
            animationTimingFunction: 'ease-out',
            animationFillMode: 'forwards',
            animationName: isVisible ? 'fadeIn' : 'none'
          }}>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Clock className="w-5 h-5" />
              <span className="text-sm">{t('home.stats.metrics.online_time')}</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{worldStats?.onlineTime || '1.2k hrs'}</div>
          </div>
        </div>
      </div>
    </section>
  );
} 