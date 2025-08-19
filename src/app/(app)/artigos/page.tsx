import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { StructuredData } from '@/components/structured-data';

export const metadata: Metadata = {
  title: 'Artigos sobre MMORPG e Universos Interativos - Nomaryth',
  description: 'Descubra artigos sobre desenvolvimento de jogos, universos interativos, comunidades gaming e a evolução dos MMORPGs. Conteúdo exclusivo da equipe Nomaryth.',
  keywords: [
    'artigos mmorpg', 'desenvolvimento jogos', 'universos interativos', 
    'comunidade gaming', 'world building', 'game design', 'nomaryth blog',
    'fantasy games', 'multiplayer online', 'jogos brasileiros'
  ],
  openGraph: {
    title: 'Artigos - Nomaryth Universe',
    description: 'Conteúdo exclusivo sobre desenvolvimento de jogos e universos interativos',
    url: 'https://gghorizon.com/artigos',
  },
};

const articles = [
  {
    id: 1,
    title: 'A Evolução dos MMORPGs: Do Passado ao Futuro Interativo',
    description: 'Uma análise profunda sobre como os MMORPGs evoluíram e para onde estão caminhando, com foco especial em jogos baseados em comunidade.',
    author: 'Equipe Nomaryth',
    date: '2024-12-15',
    readTime: '8 min',
    category: 'Game Design',
    slug: 'evolucao-mmorpgs-futuro-interativo',
    featured: true,
    tags: ['MMORPG', 'Game Design', 'Comunidade', 'Futuro']
  },
  {
    id: 2,
    title: 'Como Criar Facções Memoráveis em Jogos Online',
    description: 'Guia completo sobre design de facções, balanceamento de poder e criação de rivalidades interessantes em universos de jogos.',
    author: 'World Building Team',
    date: '2024-12-10',
    readTime: '12 min',
    category: 'World Building',
    slug: 'criar-faccoes-memoraveis-jogos-online',
    featured: true,
    tags: ['Facções', 'World Building', 'Game Design', 'Narrativa']
  },
  {
    id: 3,
    title: 'O Impacto da Comunidade no Desenvolvimento de Jogos',
    description: 'Como o feedback da comunidade pode moldar o desenvolvimento de jogos e criar experiências mais autênticas e envolventes.',
    author: 'Community Team',
    date: '2024-12-05',
    readTime: '6 min',
    category: 'Comunidade',
    slug: 'impacto-comunidade-desenvolvimento-jogos',
    featured: false,
    tags: ['Comunidade', 'Desenvolvimento', 'Feedback', 'Engajamento']
  },
  {
    id: 4,
    title: 'Sistemas de Magia Únicos: Criando Mecânicas Inovadoras',
    description: 'Explorando diferentes abordagens para sistemas de magia em jogos de fantasia, com exemplos práticos e teorias de game design.',
    author: 'Game Design Team',
    date: '2024-11-28',
    readTime: '10 min',
    category: 'Mecânicas',
    slug: 'sistemas-magia-unicos-mecanicas-inovadoras',
    featured: false,
    tags: ['Magia', 'Mecânicas', 'Inovação', 'Fantasy']
  },
  {
    id: 5,
    title: 'A Importância da Narrativa Emergente em Jogos Multiplayer',
    description: 'Como permitir que os jogadores criem suas próprias histórias através de sistemas bem projetados e escolhas significativas.',
    author: 'Narrative Team',
    date: '2024-11-20',
    readTime: '9 min',
    category: 'Narrativa',
    slug: 'narrativa-emergente-jogos-multiplayer',
    featured: false,
    tags: ['Narrativa', 'Multiplayer', 'Escolhas', 'Emergência']
  }
];

const blogSchema = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "Artigos Nomaryth",
  "description": "Blog sobre desenvolvimento de jogos, universos interativos e comunidades gaming",
  "url": "https://gghorizon.com/artigos",
  "author": {
    "@type": "Organization",
    "name": "Nomaryth Team"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Nomaryth",
    "logo": {
      "@type": "ImageObject",
      "url": "https://gghorizon.com/assets/NomaIcon1.png"
    }
  }
};

export default function ArtigosPage() {
  const featuredArticles = articles.filter(article => article.featured);
  const regularArticles = articles.filter(article => !article.featured);

  return (
    <>
      <StructuredData data={blogSchema} />
      
      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background">
        <div className="container mx-auto px-4 py-16">
          
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Conteúdo Exclusivo
            </Badge>
            <h1 className="text-5xl font-bold font-headline text-primary mb-6">
              Artigos Nomaryth
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Insights sobre desenvolvimento de jogos, universos interativos e a evolução 
              das comunidades gaming. Conteúdo criado pela nossa equipe de especialistas.
            </p>
          </div>

          {featuredArticles.length > 0 && (
            <section className="mb-16">
              <h2 className="text-3xl font-bold font-headline mb-8">Artigos em Destaque</h2>
              <div className="grid lg:grid-cols-2 gap-8">
                {featuredArticles.map((article) => (
                  <Card key={article.id} className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300 group">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">{article.category}</Badge>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(article.date).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {article.readTime}
                          </div>
                        </div>
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {article.title}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {article.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          {article.author}
                        </div>
                        <Button variant="ghost" size="sm" className="group-hover:bg-primary/10">
                          Ler Artigo
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-4">
                        {article.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-3xl font-bold font-headline mb-8">Todos os Artigos</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularArticles.map((article) => (
                <Card key={article.id} className="bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-300 group">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">{article.category}</Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {article.readTime}
                      </div>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {article.title}
                    </CardTitle>
                    <CardDescription className="text-sm line-clamp-3">
                      {article.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(article.date).toLocaleDateString('pt-BR')}
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs">
                        Ler Mais
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {article.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="mt-16 text-center">
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl">Quer Contribuir?</CardTitle>
                <CardDescription className="text-lg">
                  Tem ideias para artigos ou quer compartilhar sua experiência com a comunidade?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild size="lg">
                  <Link href="/feedback">
                    Enviar Proposta
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </section>

        </div>
      </div>
    </>
  );
}
