import { Metadata } from 'next';
import { StructuredData, organizationSchema, faqSchema } from '@/components/structured-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, Users, Zap, Heart, Code, Gamepad2 } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sobre o Nomaryth - Universo Interativo de Fantasia',
  description: 'Conheça a história do Nomaryth, um projeto brasileiro de MMORPG interativo criado pela comunidade. Descubra nossa missão, valores e como fazemos parte da evolução dos jogos online.',
  keywords: [
    'sobre nomaryth', 'história nomaryth', 'equipe nomaryth', 'projeto brasileiro', 
    'mmorpg nacional', 'game development brasil', 'universo fantasia',
    'comunidade gaming', 'mundo interativo', 'facções online'
  ],
  openGraph: {
    title: 'Sobre o Nomaryth - Universo Interativo Brasileiro',
    description: 'Conheça a história do Nomaryth, um projeto brasileiro de MMORPG interativo criado pela comunidade.',
    url: 'https://gghorizon.com/sobre',
    images: [
      {
        url: '/assets/NomaBanner1.png',
        width: 1200,
        height: 630,
        alt: 'Sobre o Projeto Nomaryth',
      },
    ],
  },
  alternates: {
    canonical: 'https://gghorizon.com/sobre',
  },
};

const aboutSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "mainEntity": {
    "@type": "Organization",
    "name": "Nomaryth",
    "description": "Organização brasileira de desenvolvimento de jogos indie especializada em MMORPGs inovadores com permadeath.",
    "foundingDate": "2024",
    "founder": {
      "@type": "Organization",
      "name": "Axulogic"
    },
    "location": {
      "@type": "Place",
      "name": "Brasil"
    },
    "mission": "Criar um universo persistente onde cada jogador pode influenciar a narrativa e o desenvolvimento do mundo através de suas escolhas e ações."
  }
};

const teamMembers = [
  {
    name: "Equipe de Desenvolvimento",
    role: "Core Development",
    description: "Responsável pela arquitetura técnica, sistemas de jogo e infraestrutura do universo Nomaryth.",
    icon: <Code className="h-8 w-8 text-blue-500" />
  },
  {
    name: "World Builders",
    role: "Narrative & Lore",
    description: "Criadores do lore, narrativa e elementos que compõem o rico universo de Nomaryth.",
    icon: <Globe className="h-8 w-8 text-green-500" />
  },
  {
    name: "Community Managers",
    role: "Community",
    description: "Facilitadores da comunidade, responsáveis por conectar jogadores e coletar feedback.",
    icon: <Users className="h-8 w-8 text-purple-500" />
  },
  {
    name: "Game Designers",
    role: "Experience Design",
    description: "Designers focados em criar experiências memoráveis e sistemas de jogo equilibrados.",
    icon: <Gamepad2 className="h-8 w-8 text-orange-500" />
  }
];

const milestones = [
  {
    year: "2023",
    title: "Concepção do Projeto",
    description: "Início do desenvolvimento do universo Nomaryth com foco em interatividade e comunidade."
  },
  {
    year: "2024",
    title: "Lançamento da Plataforma Web",
    description: "Criação do site interativo gghorizon.com para apresentar o universo aos jogadores."
  },
  {
    year: "2024",
    title: "Sistema de Facções",
    description: "Implementação do sistema de facções permitindo aos jogadores formar alianças e rivalidades."
  },
  {
    year: "2025",
    title: "Expansão da Comunidade",
    description: "Crescimento ativo da base de jogadores e implementação de novas funcionalidades baseadas em feedback."
  }
];

export default function SobrePage() {
  const combinedSchemas = [aboutSchema, organizationSchema, faqSchema];

  return (
    <>
      <StructuredData data={combinedSchemas} />
      
      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background">
        <div className="container mx-auto px-4 py-16">
          
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Projeto Brasileiro
            </Badge>
            <h1 className="text-5xl font-bold font-headline text-primary mb-6">
              Sobre o Nomaryth
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Um universo interativo de fantasia criado por brasileiros, para jogadores que buscam 
              uma experiência onde suas escolhas realmente importam e moldam o mundo ao seu redor.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-6 w-6 text-red-500" />
                  Nossa Missão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Criar um universo persistente e reativo onde cada jogador tem o poder de influenciar 
                  a narrativa global através de suas decisões. Nomaryth não é apenas um jogo, é um 
                  experimento social onde a comunidade constrói coletivamente a história de um mundo 
                  à beira do colapso.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-6 w-6 text-yellow-500" />
                  Nossa Visão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Ser referência em jogos interativos baseados em comunidade, provando que é possível 
                  criar experiências profundas e significativas sem barreiras financeiras. Queremos 
                  que Nomaryth seja lembrado como o universo onde cada voz importa.
                </p>
              </CardContent>
            </Card>
          </div>

          <section className="mb-16">
            <h2 className="text-3xl font-bold font-headline text-center mb-8">Nossa Equipe</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member, index) => (
                <Card key={index} className="text-center bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-colors">
                  <CardHeader>
                    <div className="mx-auto mb-4">
                      {member.icon}
                    </div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <CardDescription>
                      <Badge variant="secondary">{member.role}</Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {member.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold font-headline text-center mb-8">Nossa Jornada</h2>
            <div className="space-y-6">
              {milestones.map((milestone, index) => (
                <Card key={index} className="bg-card/30 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        {milestone.year}
                      </Badge>
                      <CardTitle>{milestone.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{milestone.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="text-center">
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl">Faça Parte da Nossa História</CardTitle>
                <CardDescription className="text-lg">
                  Nomaryth é construído pela comunidade, para a comunidade. 
                  Sua participação é essencial para moldar o futuro deste universo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg">
                    <Link href="/factions">
                      Explorar Facções
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/feedback">
                      Enviar Feedback
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

        </div>
      </div>
    </>
  );
}
