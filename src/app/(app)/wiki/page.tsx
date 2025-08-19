import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, Globe, Users, Trophy, ExternalLink, Info } from 'lucide-react';
import Link from 'next/link';
import { StructuredData } from '@/components/structured-data';

export const metadata: Metadata = {
  title: 'Nomaryth Ordain - Enciclopédia do Universo Interativo',
  description: 'Enciclopédia completa do Nomaryth Ordain: história, desenvolvimento, gameplay, facções, personagens e lore do universo interativo de fantasia brasileiro.',
  keywords: [
    'nomaryth ordain wiki', 'nomaryth enciclopedia', 'nomaryth historia', 
    'mmorpg brasileiro', 'universo nomaryth', 'facções nomaryth',
    'lore nomaryth', 'personagens nomaryth', 'magia nomaryth'
  ],
  openGraph: {
    title: 'Nomaryth Ordain - Enciclopédia Oficial',
    description: 'Tudo sobre o universo Nomaryth Ordain: história, lore, facções e desenvolvimento.',
    url: 'https://gghorizon.com/wiki',
  },
  alternates: {
    canonical: 'https://gghorizon.com/wiki',
  },
};

const wikiSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Nomaryth Ordain - Universo Interativo de Fantasia",
  "description": "Artigo enciclopédico sobre Nomaryth Ordain, série de videogames interativa brasileira de fantasia.",
  "author": {
    "@type": "Organization",
    "name": "Nomaryth Development Team"
  },
  "publisher": {
    "@type": "Organization",
    "name": "GG Horizon",
    "logo": {
      "@type": "ImageObject",
      "url": "https://gghorizon.com/assets/NomaIcon1.png"
    }
  },
  "datePublished": "2023-01-01",
  "dateModified": new Date().toISOString(),
  "mainEntityOfPage": "https://gghorizon.com/wiki",
  "image": {
    "@type": "ImageObject",
    "url": "https://gghorizon.com/assets/NomaBanner1.png",
    "width": 1200,
    "height": 630
  }
};

const infoBoxData = [
  { label: "Desenvolvedor", value: "Axulogic" },
  { label: "Organização", value: "Nomaryth (Axulogic)" },
  { label: "Plataforma", value: "PC" },
  { label: "Lançamento", value: "2027 (Previsto)" },
  { label: "Gênero", value: "MMORPG, Permadeath, Indie" },
  { label: "Modo", value: "Multijogador Online" },
  { label: "País de Origem", value: "Brasil" },
  { label: "Idiomas", value: "Português, Inglês" },
  { label: "Status", value: "Em Desenvolvimento Ativo" },
  { label: "Modelo", value: "Free-to-Play" }
];

const timelineEvents = [
  {
    year: "2024",
    quarter: "Q1",
    title: "Concepção do Projeto",
    description: "A Axulogic concebe a ideia do Nomaryth Ordain como um MMORPG inovador com permadeath."
  },
  {
    year: "2024", 
    quarter: "Q2",
    title: "Fundação da Nomaryth",
    description: "A Axulogic cria a organização Nomaryth para gerenciar projetos de jogos indie."
  },
  {
    year: "2024",
    quarter: "Q3", 
    title: "Planejamento e Design",
    description: "Desenvolvimento dos conceitos core: permadeath, escolhas permanentes e narrativa emergente."
  },
  {
    year: "2024",
    quarter: "Q4",
    title: "Início do Desenvolvimento",
    description: "A Axulogic inicia a codificação e implementação dos sistemas base do jogo."
  },
  {
    year: "2025",
    quarter: "Q1",
    title: "Lançamento Previsto",
    description: "Data estimada para o lançamento público do Nomaryth Ordain."
  },
  {
    year: "2025",
    quarter: "Q2",
    title: "Expansão Planejada", 
    description: "Planos para expansão do universo e adição de novos sistemas baseados no feedback da comunidade."
  }
];

export default function WikiPage() {
  return (
    <>
      <StructuredData data={wikiSchema} />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-4 gap-8">
              
              <div className="lg:col-span-3 space-y-8">
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">Série de Videogame</Badge>
                    <Badge variant="secondary">Brasil</Badge>
                  </div>
                  <h1 className="text-4xl font-bold font-headline text-primary mb-4">
                    Nomaryth Ordain
                  </h1>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    <strong>Nomaryth Ordain</strong> é um MMORPG inovador com sistema de permadeath 
                    desenvolvido pela <strong>Axulogic</strong> através da organização <strong>Nomaryth</strong>. 
                    O jogo oferece uma experiência única onde as escolhas dos jogadores têm consequências 
                    permanentes, moldando definitivamente o mundo para todos os participantes. 
                    Previsto para lançamento em 2025.
                  </p>
                </div>

                <Separator />

                <section>
                  <h2 className="text-2xl font-bold font-headline mb-4">Visão Geral</h2>
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <p>
                      O projeto Nomaryth Ordain nasceu em 2024 da visão da <strong>Axulogic</strong> de criar 
                      um MMORPG onde cada jogador possui impacto real e permanente na narrativa global. 
                      O conceito revolucionário de <strong>permadeath</strong> significa que as escolhas 
                      têm consequências definitivas, criando um mundo que evolui organicamente baseado 
                      nas ações irreversíveis da comunidade.
                    </p>
                    <p>
                      Desenvolvido como projeto indie brasileiro pela <strong>Axulogic</strong> através 
                      da organização <strong>Nomaryth</strong>, o jogo representa uma abordagem inovadora 
                      ao gênero MMORPG, demonstrando que é possível criar experiências profundas focando 
                      em mecânicas únicas de consequências permanentes e narrativa emergente controlada 
                      pelos jogadores.
                    </p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-2xl font-bold font-headline mb-4">Gameplay</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          Sistema de Facções
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Jogadores podem criar ou se juntar a facções, formando alianças estratégicas 
                          e rivalidades que influenciam o desenvolvimento da narrativa mundial.
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="h-5 w-5" />
                          Mundo Persistente
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          O continente de Nomaryth evolui baseado nas escolhas coletivas, com mudanças 
                          permanentes que afetam todos os jogadores.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-2xl font-bold font-headline mb-4">História do Desenvolvimento</h2>
                  <div className="space-y-4">
                    {timelineEvents.map((event, index) => (
                      <Card key={index} className="bg-card/50">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{event.title}</CardTitle>
                            <Badge variant="outline">{event.year} {event.quarter}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-2xl font-bold font-headline mb-4">Recepção</h2>
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <p>
                      Nomaryth Ordain tem sido elogiado pela comunidade gaming brasileira por sua 
                      abordagem inovadora ao gênero MMORPG. A ênfase em narrativa comunitária e 
                      consequências permanentes das escolhas tem atraído jogadores que buscam 
                      experiências mais significativas.
                    </p>
                    <blockquote className="border-l-4 border-primary pl-4 italic">
                      "Um experimento fascinante que prova que a inovação pode vir de qualquer lugar. 
                      Nomaryth redefine o que significa 'impacto do jogador' em MMORPGs."
                      <footer className="text-sm text-muted-foreground mt-2">
                        — Análise da Comunidade Gaming Brasil
                      </footer>
                    </blockquote>
                  </div>
                </section>

              </div>

              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="text-lg">Nomaryth Ordain</CardTitle>
                    <div className="w-full h-32 bg-gradient-to-r from-primary/20 to-accent/20 rounded-md flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">Logo Oficial</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {infoBoxData.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.label}:</span>
                        <span className="font-medium text-right">{item.value}</span>
                      </div>
                    ))}
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-2">
                      <Button asChild size="sm" className="w-full">
                        <Link href="/">
                          <Globe className="h-4 w-4 mr-2" />
                          Site Oficial
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href="/factions">
                          <Users className="h-4 w-4 mr-2" />
                          Explorar Facções
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href="/sobre">
                          <Info className="h-4 w-4 mr-2" />
                          Sobre o Projeto
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  );
}
