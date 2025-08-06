'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { BookOpen, Map } from "lucide-react";
import Link from "next/link";
import { OptimizedImage } from "@/components/optimized-image";
import { useTranslation } from "@/context/i18n-context";

interface InteractiveHeroProps {
  className?: string;
}

const generateParticlePositions = () => {
  const positions = [];
  for (let i = 0; i < 50; i++) {
    positions.push({
      left: `${(i * 7) % 100}%`,
      top: `${(i * 13) % 100}%`,
      delay: `${(i * 0.1) % 3}s`,
      duration: `${2 + (i % 3)}s`
    });
  }
  return positions;
};

const generateFloatingPositions = () => {
  const positions = [];
  for (let i = 0; i < 8; i++) {
    positions.push({
      left: `${20 + (i * 10)}%`,
      top: `${30 + (i * 5)}%`,
      delay: `${i * 0.5}s`
    });
  }
  return positions;
};

export function InteractiveHero({ className }: InteractiveHeroProps) {
  const { t } = useTranslation();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const particlePositions = useMemo(() => generateParticlePositions(), []);
  const floatingPositions = useMemo(() => generateFloatingPositions(), []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePosition({ x, y });
      }
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;

    const timer = setTimeout(() => {
      setIsTyping(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [isClient]);

  const parallaxX = mousePosition.x * 20;
  const parallaxY = mousePosition.y * 20;
  const scrollParallax = scrollY * 0.5;

  return (
    <div 
      ref={heroRef}
      className={`relative h-[calc(100vh-4rem)] w-full flex items-center justify-center overflow-hidden ${className}`}
    >
      <div 
        className="absolute inset-0 z-10"
        style={{
          transform: isClient ? `translate(${parallaxX}px, ${parallaxY - scrollParallax}px)` : 'none',
          transition: 'transform 0.1s ease-out'
        }}
      >
        <OptimizedImage
          src="https://github.com/Nomaryth/nomaryth/blob/main/assets/NomaBanner1.png?raw=true"
          alt="A mystical landscape from Nomaryth"
          fill
          className="opacity-10 object-cover"
          data-ai-hint="fantasy landscape"
          priority
        />
      </div>

      {isClient && (
        <div className="absolute inset-0 z-15 pointer-events-none">
          {particlePositions.map((pos, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-accent/30 rounded-full animate-pulse"
              style={{
                left: pos.left,
                top: pos.top,
                animationDelay: pos.delay,
                animationDuration: pos.duration,
                transform: `translate(${parallaxX * 0.1}px, ${parallaxY * 0.1}px)`,
                transition: 'transform 0.1s ease-out'
              }}
            />
          ))}
        </div>
      )}

      {isClient && (
        <div 
          className="absolute inset-0 z-15 pointer-events-none"
          style={{
            transform: `translate(${parallaxX * 0.5}px, ${parallaxY * 0.5}px)`,
            transition: 'transform 0.2s ease-out'
          }}
        >
          {floatingPositions.map((pos, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-accent/20 rounded-full"
              style={{
                left: pos.left,
                top: pos.top,
                animationDelay: pos.delay,
                animation: 'float 6s ease-in-out infinite'
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-20 text-center p-4">
         <h1 
           className={`text-6xl md:text-8xl font-bold font-headline text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-accent mb-4 drop-shadow-[0_0_20px_hsl(var(--accent)/0.8)] ${
             isTyping ? 'animate-typing' : 'opacity-0'
           }`}
           style={{
             animationDuration: isTyping ? '2s, 2s' : '0s',
             animationTimingFunction: isTyping ? 'steps(8), ease-in-out' : 'ease',
             animationFillMode: isTyping ? 'forwards, none' : 'none',
             animationName: isTyping ? 'typing, glow' : 'none',
             animationIterationCount: isTyping ? '1, infinite' : '1',
             animationDirection: isTyping ? 'normal, alternate' : 'normal'
           }}
         >
          NOMARYTH
        </h1>

         <p 
           className={`text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 ${
             isTyping ? 'animate-fadeIn' : 'opacity-0'
           }`}
           style={{ 
             animationDelay: '1s',
             animationDuration: isTyping ? '1s' : '0s',
             animationTimingFunction: 'ease-out',
             animationFillMode: 'forwards',
             animationName: isTyping ? 'fadeIn' : 'none'
           }}
         >
          {t('home.tagline')}
        </p>

         <div 
           className={`flex flex-col sm:flex-row justify-center gap-4 ${
             isTyping ? 'animate-fadeIn' : 'opacity-0'
           }`}
           style={{ 
             animationDelay: '1.5s',
             animationDuration: isTyping ? '1s' : '0s',
             animationTimingFunction: 'ease-out',
             animationFillMode: 'forwards',
             animationName: isTyping ? 'fadeIn' : 'none'
           }}
         >
          <Button 
            asChild 
            size="lg" 
            className="bg-accent text-accent-foreground hover:bg-accent/90 transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-accent/25"
          >
            <Link href="/docs">
              <BookOpen className="mr-2 h-5 w-5" />
              {t('home.explore_lore')}
            </Link>
          </Button>
          <Button 
            asChild 
            size="lg" 
            variant="secondary"
            className="transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
          >
            <Link href="/projects">
              <Map className="mr-2 h-5 w-5" />
              {t('home.discover_projects')}
            </Link>
          </Button>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10" />
    </div>
  );
} 