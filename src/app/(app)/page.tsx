'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Map, Wand2, Shield, Gem, ArrowRight, Milestone, Users, Settings, Crown } from "lucide-react";
import Link from "next/link";
import { Particles } from "@/components/particles";
import { useTranslation } from "@/context/i18n-context";
import { useEffect, useState } from "react";
import { OptimizedImage } from "@/components/optimized-image";
import { FlipButton } from "@/components/flip-button";
import { BannerButton } from "@/components/banner-button";
import { StructuredData, websiteSchema, organizationSchema, creativeWorkSchema } from "@/components/structured-data";

function HomeContent() {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Wand2 className="w-8 h-8 text-accent" />,
      title: t('features.magic.title'),
      description: t('features.magic.description'),
    },
    {
      icon: <Shield className="w-8 h-8 text-accent" />,
      title: t('features.factions.title'),
      description: t('features.factions.description'),
    },
    {
      icon: <Gem className="w-8 h-8 text-accent" />,
      title: t('features.aetherium.title'),
      description: t('features.aetherium.description'),
    },
  ];

  return (
    <>
      <div className="relative h-[calc(100vh-4rem)] w-full flex items-center justify-center overflow-hidden">
        <OptimizedImage
          src="https://github.com/Nomaryth/nomaryth/blob/main/assets/NomaBanner1.png?raw=true"
          alt="A mystical landscape from Nomaryth"
          fill
          className="opacity-10 z-10 object-cover"
          data-ai-hint="fantasy landscape"
        />
        <div className="relative z-20 text-center p-4">
          <h1 className="text-6xl md:text-8xl font-bold font-headline text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-accent mb-4 animate-gradient drop-shadow-[0_0_20px_hsl(var(--accent)/0.8)]">
            NOMARYTH
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            {t('home.tagline')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/docs">
                <BookOpen className="mr-2 h-5 w-5" />
                {t('home.explore_lore')}
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/projects">
                <Map className="mr-2 h-5 w-5" />
                {t('home.discover_projects')}
              </Link>
            </Button>
          </div>
          
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10" />
      </div>

      <section className="py-20 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold font-headline text-primary">
              {t('home.explore_title')}
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              {t('home.explore_subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-card/50 border-border/50 text-center p-6 hover:border-accent transition-colors">
                <CardHeader className="flex items-center justify-center">
                  <div className="p-4 bg-accent/10 rounded-full mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}

export default function Home() {
  // Combine multiple schemas for comprehensive structured data
  const combinedSchema = [
    websiteSchema,
    organizationSchema,
    creativeWorkSchema
  ];

  return (
    <>
      <StructuredData data={combinedSchema} />
      <HomeContent />
    </>
  )
}
