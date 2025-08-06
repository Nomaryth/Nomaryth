'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2, Shield, Gem } from "lucide-react";
import { useTranslation } from "@/context/i18n-context";
import { StructuredData, websiteSchema, organizationSchema, creativeWorkSchema } from "@/components/structured-data";
import { InteractiveHero } from "@/components/interactive-hero";
import { AnimatedStats } from "@/components/animated-stats";
import { MinimalNews } from "@/components/minimal-news";
import { SectionDivider } from "@/components/section-divider";

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
    <div className="flex flex-col">
      <InteractiveHero />
      
      <SectionDivider variant="arknights" />
      <AnimatedStats />

      <SectionDivider variant="tech" />
      <MinimalNews />

      <SectionDivider variant="hologram" />
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
    </div>
  );
}

export default function Home() {
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