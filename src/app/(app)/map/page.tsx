'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/context/i18n-context';
import { Particles } from '@/components/particles';
import { Ban } from 'lucide-react';

const DesolateTraveler = () => (
    <svg 
        width="200" 
        height="200" 
        viewBox="0 0 200 200" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary drop-shadow-[0_0_10px_hsl(var(--primary)/0.5)]"
    >
        <style>
        {`
            .wind-path {
                animation: wind-blow 8s infinite ease-in-out;
                stroke-dasharray: 50;
                stroke-dashoffset: 50;
                opacity: 0;
            }
            .wind-path:nth-child(2) { animation-delay: -2s; }
            .wind-path:nth-child(3) { animation-delay: -5s; }

            @keyframes wind-blow {
                0% { stroke-dashoffset: 50; opacity: 0; }
                20% { stroke-dashoffset: 0; opacity: 0.4; }
                80% { stroke-dashoffset: -50; opacity: 0.4; }
                100% { stroke-dashoffset: -50; opacity: 0; }
            }

            .traveler-breath {
                animation: breath 4s infinite ease-in-out;
                transform-origin: bottom;
            }

            @keyframes breath {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-2px); }
            }
        `}
        </style>
        <path className="wind-path" d="M10 130 Q 50 120, 90 135 T 180 140" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
        <path className="wind-path" d="M20 150 Q 70 160, 110 145 T 190 155" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
        <path className="wind-path" d="M5 165 Q 50 155, 100 170 T 180 160" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>

        <path d="M0 180 H 200" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
        <path d="M50 180 L 60 170 L 70 180" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
        <path d="M130 180 L 140 175 L 150 180" stroke="currentColor" strokeWidth="1" opacity="0.6"/>

        <g className="traveler-breath">
            <path d="M90 150 C 90 140, 110 140, 110 150 L 115 180 H 85 L 90 150 Z" fill="currentColor" opacity="0.8"/>
            <circle cx="100" cy="135" r="10" fill="currentColor" opacity="0.8"/>
        </g>
    </svg>
)

export default function MapPage() {
  const { t } = useTranslation();

  return (
    <div className="relative container mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] overflow-hidden">
       <Particles
            className="absolute inset-0 -z-10"
            quantity={100}
            color="hsl(var(--muted-foreground))"
            ease={80}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent -z-10" />

      <div className="text-center animate-fadeIn max-w-2xl flex flex-col items-center">
        <div className="mx-auto w-fit mb-8">
            <DesolateTraveler />
        </div>
        <Card className="bg-card/50 border-border/30 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-2xl font-headline text-primary flex items-center justify-center gap-3">
                   A Passagem foi Selada
                </CardTitle>
                <CardDescription>
                    O caminho à frente está consumido pelo miasma. Volte mais tarde, se ainda houver um &apos;mais tarde&apos;.
                </CardDescription>
            </CardHeader>
        </Card>
      </div>
    </div>
  );
}