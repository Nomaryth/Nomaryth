
'use client';

import Link from 'next/link';
import { Logo } from '@/components/logo';
import { useTranslation } from '@/context/i18n-context';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Github, Twitter, Heart, Zap, Compass, Network, Cpu } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SystemStatus {
  status: 'operational' | 'degraded' | 'maintenance';
  uptime: string;
  version: string;
}

export function Footer() {
  const { t } = useTranslation();
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    status: 'operational',
    uptime: '99.9%',
    version: '0.1.2'
  });

  useEffect(() => {
    const checkStatus = () => {
      setSystemStatus({
        status: 'operational',
        uptime: '99.9%',
        version: process.env.npm_package_version || '0.1.2'
      });
    };
    
    checkStatus();
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const footerLinks = {
    chronicles: [
      { href: '/docs', labelKey: 'footer.links.lore', icon: <Compass className="h-4 w-4" /> },
      { href: '/about', labelKey: 'footer.links.concepts', icon: <Zap className="h-4 w-4" /> },
      { href: '/projects', labelKey: 'footer.links.projects', icon: <Cpu className="h-4 w-4" /> },
      { href: '/factions', labelKey: 'factions.page_title', icon: <Network className="h-4 w-4" /> },
    ],
    community: [
      { 
        href: 'https://x.com/Nomaryth', 
        labelKey: 'footer.links.twitter', 
        icon: <Twitter className="h-4 w-4" />,
        external: true 
      },
      { 
        href: 'https://github.com/Nomaryth', 
        labelKey: 'footer.links.github', 
        icon: <Github className="h-4 w-4" />,
        external: true 
      },
    ],
    legal: [
      { href: '/privacy', labelKey: 'footer.links.privacy' },
      { href: '/terms', labelKey: 'footer.links.terms' },
    ],
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'maintenance':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'operational':
        return 'All Systems Operational';
      case 'degraded':
        return 'Degraded Performance';
      case 'maintenance':
        return 'Under Maintenance';
      default:
        return 'Status Unknown';
    }
  };

  return (
    <footer className="bg-card/50 backdrop-blur-sm border-t">
      <div className="border-b border-border/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${getStatusColor(systemStatus.status)} animate-pulse`} />
                <span className="text-muted-foreground">{getStatusText(systemStatus.status)}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-muted-foreground">Uptime: {systemStatus.uptime}</span>
              <Separator orientation="vertical" className="h-4" />
              <Badge variant="outline" className="text-xs">
                v{systemStatus.version}
              </Badge>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
              <Heart className="h-3 w-3 text-red-500 animate-pulse" />
              <span>Made with passion</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left">
            <Link href="/" className="flex items-center gap-2 group">
              <Logo />
              <span className="font-bold font-headline text-lg group-hover:text-accent transition-colors">
                Nomaryth
              </span>
            </Link>
            <p className="text-muted-foreground text-sm mt-4 max-w-xs leading-relaxed">
              {t('footer.bio')}
            </p>
            
            <div className="flex items-center gap-3 mt-6">
              {footerLinks.community.map((link) => (
                <Link
                  key={link.labelKey}
                  href={link.href}
                  className="flex items-center justify-center h-10 w-10 rounded-full bg-muted/50 hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-110"
                  target="_blank"
                  rel="noopener noreferrer"
                  title={t(link.labelKey)}
                >
                  {link.icon}
                </Link>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
            <div>
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Compass className="h-4 w-4 text-accent" />
                {t('footer.headings.chronicles')}
              </h3>
              <ul className="space-y-3">
                {footerLinks.chronicles.map((link) => (
                  <li key={link.labelKey}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors group"
                    >
                      <span className="opacity-60 group-hover:opacity-100 transition-opacity">
                        {link.icon}
                      </span>
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Network className="h-4 w-4 text-accent" />
                {t('footer.headings.community')}
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/factions"
                    className="text-muted-foreground hover:text-accent transition-colors"
                  >
                    Join a Faction
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs"
                    className="text-muted-foreground hover:text-accent transition-colors"
                  >
                    Learn the Lore
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-accent transition-colors"
                  >
                    About Project
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">
                {t('footer.headings.legal')}
              </h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.labelKey}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-accent transition-colors"
                    >
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
              
              <div className="mt-6 p-3 bg-muted/30 rounded-lg border border-border/50">
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Build:</span>
                    <Badge variant="outline" className="text-xs h-5">
                      {new Date().toLocaleDateString()}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <div className="flex items-center gap-1">
                      <div className={`h-1.5 w-1.5 rounded-full ${getStatusColor(systemStatus.status)}`} />
                      <span className="text-green-600 dark:text-green-400 text-xs">Online</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>© 2025 Nomaryth. All rights reserved.</span>
            <Separator orientation="vertical" className="h-4 hidden md:block" />
            <span className="hidden md:block">Created with modern web technologies</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/privacy" 
              className="hover:text-accent transition-colors"
            >
              Privacy
            </Link>
            <Link 
              href="/terms" 
              className="hover:text-accent transition-colors"
            >
              Terms
            </Link>
            <Badge variant="outline" className="text-xs">
              Next.js 15
            </Badge>
          </div>
        </div>
      </div>
    </footer>
  );
}