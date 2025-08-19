'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAdminContent } from '@/hooks/use-admin-content';
import { 
  Star,
  Crown,
  Globe,
  BookOpen,
  Play,
  ArrowRight,
  ChevronDown,
  Sparkles,
  Shield,
  TrendingUp
} from "lucide-react";
import { useTranslation } from "@/context/i18n-context";
import { StructuredData, websiteSchema, organizationSchema, creativeWorkSchema } from "@/components/structured-data";
import { SectionDivider } from "@/components/section-divider";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { CloudinaryImage } from "@/components/cloudinary-image";
import { Particles } from "@/components/particles";

interface WorldStats {
  totalUsers: number;
  activeFactions: number;
  totalNews: number;
  worldProgress: number;
  monthlyGrowth: number;
  targetAchieved: number;
  onlineTime: string;
}

function EnhancedHero() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<WorldStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  
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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <motion.div 
      ref={heroRef}
      style={{ y }}
      className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-background via-background/95 to-primary/5"
    >
      <div className="absolute inset-0">
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-accent/40 to-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float transition-transform duration-1000"
          style={{
            left: mousePosition.x * 0.05 + 100,
            top: mousePosition.y * 0.05 + 100,
          }}
        />
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-primary/30 to-accent/40 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"
          style={{
            right: mousePosition.x * 0.03 + 100,
            bottom: mousePosition.y * 0.03 + 100,
            animationDelay: '2s'
          }}
        />
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]" />
      
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <Particles quantity={120} color="hsl(var(--accent))" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div 
              className="inline-flex items-center space-x-3 bg-card/60 backdrop-blur-md border border-border/60 rounded-full px-6 py-3 text-sm shadow-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
            >
              <div className="flex -space-x-2">
                <motion.div 
                  className="w-6 h-6 rounded-full bg-green-500 animate-pulse"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
                <motion.div 
                  className="w-6 h-6 rounded-full bg-yellow-400 animate-pulse"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                />
                <motion.div 
                  className="w-6 h-6 rounded-full bg-primary animate-pulse"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                />
              </div>
              <span className="font-semibold text-foreground">
                {!isLoading && stats ? `${formatNumber(stats.totalUsers)}+ Exploradores Online` : 'Comunidade Crescendo'}
              </span>
              <motion.div 
                className="w-3 h-3 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            </motion.div>

            <motion.h1 
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[0.9] tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <motion.span 
                className="block text-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Forje Seu
              </motion.span>
              <motion.span 
                className="block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-accent bg-[length:300%_auto] animate-gradient-x">
                  Destino Épico
                </span>
              </motion.span>
            </motion.h1>

            <motion.p 
              className="text-xl lg:text-2xl text-muted-foreground max-w-2xl leading-relaxed"
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Mergulhe em um universo onde cada escolha molda o futuro. Junte-se a milhares de exploradores em uma jornada épica.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  asChild 
                  size="lg" 
                  className="group relative overflow-hidden rounded-3xl px-10 py-6 text-lg font-bold bg-gradient-to-r from-accent via-primary to-accent bg-[length:300%_auto] text-white hover:bg-pos-100 hover:shadow-2xl hover:shadow-accent/40 transition-all duration-700"
                >
                  <Link href="/docs" className="flex items-center">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <BookOpen className="relative mr-3 h-6 w-6 drop-shadow-lg" />
                    <span className="relative drop-shadow-lg">Explorar Lore</span>
                    <motion.div
                      className="ml-2"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.div>
                  </Link>
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  asChild 
                  size="lg" 
                  className="group relative overflow-hidden rounded-3xl px-10 py-6 text-lg font-bold bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 backdrop-blur-md border-2 border-primary/40 text-foreground hover:border-accent/60 hover:bg-gradient-to-r hover:from-accent/40 hover:to-primary/40 transition-all duration-700"
                >
                  <Link href="/factions" className="flex items-center">
                    <Crown className="relative mr-3 h-6 w-6" />
                    <span className="relative">Unir-se a Facção</span>
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div 
              className="flex justify-center sm:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  asChild 
                  size="lg" 
                  className="group relative overflow-hidden rounded-3xl px-10 py-6 text-lg font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 text-white hover:shadow-2xl hover:shadow-emerald-500/40 transition-all duration-700"
                >
                  <Link
                    href="https://launcher.gghorizon.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative flex items-center"
                  >
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      animate={{ x: [-100, 300] }}
                      transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                    />
                    <Play className="relative mr-3 h-6 w-6 drop-shadow-lg" />
                    <span className="relative drop-shadow-lg">Abrir Launcher</span>
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.div
              className="relative w-full h-[600px] lg:h-[700px]"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <CloudinaryImage
                src="https://res.cloudinary.com/dlfc3hhsr/image/upload/e_background_removal/f_png/v1754822458/20250810_0405_image_fzxuik.png"
                alt="Nomaryth character"
                fill
                className="object-contain drop-shadow-2xl select-none pointer-events-none"
                priority
                quality={95}
                responsive={true}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-60 rounded-3xl" />
            </motion.div>

            <motion.div 
              className="absolute top-12 -right-8 lg:right-12"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-3xl p-6 shadow-2xl backdrop-blur-sm border border-primary/30">
                <div className="text-3xl font-bold mb-1">
                  {!isLoading && stats ? `${stats.worldProgress}%` : '98%'}
                </div>
                <div className="text-sm opacity-90 font-medium">Progresso do Mundo</div>
                <div className="w-full bg-primary-foreground/20 rounded-full h-2 mt-2">
                  <motion.div 
                    className="bg-primary-foreground rounded-full h-2"
                    initial={{ width: 0 }}
                    animate={{ width: `${stats?.worldProgress || 98}%` }}
                    transition={{ duration: 1.5, delay: 1.5 }}
                  />
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="absolute bottom-32 -left-8 lg:left-12"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="bg-card/90 border-2 border-border/60 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
                <div className="flex items-center space-x-4">
                  <div className="flex -space-x-3">
                    {[...Array(4)].map((_, i) => (
                      <motion.div 
                        key={i}
                        className={`w-8 h-8 rounded-full border-2 ${
                          i === 0 ? 'bg-primary/30 border-primary/50' :
                          i === 1 ? 'bg-accent/30 border-accent/50' :
                          i === 2 ? 'bg-chart-3/30 border-chart-3/50' :
                          'bg-chart-4/30 border-chart-4/50'
                        }`}
                        animate={{ 
                          y: [0, -5, 0],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 3,
                          delay: i * 0.2
                        }}
                      />
                    ))}
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {!isLoading && stats ? formatNumber(stats.activeFactions) : '8.5K+'}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">Facções Ativas</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="absolute bottom-12 right-12 lg:right-20"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.6 }}
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <div className="bg-card/90 border-2 border-border/60 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl">
                    <Sparkles className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Documentação</div>
                    <div className="text-lg font-bold text-foreground">Completa</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <motion.div 
          className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.8 }}
        >
          {[
            {
              icon: Globe,
              title: "Comunidade",
              value: !isLoading && stats ? formatNumber(stats.totalUsers) : '2.5K+',
              description: "Exploradores ativos descobrindo novos mundos",
              color: "from-blue-500/20 to-blue-500/10",
              iconColor: "text-blue-500"
            },
            {
              icon: Shield,
              title: "Facções Ativas",
              value: !isLoading && stats ? formatNumber(stats.activeFactions) : '150+',
              description: "Guildas forjando seus destinos",
              color: "from-purple-500/20 to-purple-500/10",
              iconColor: "text-purple-500"
            },
            {
              icon: TrendingUp,
              title: "Progresso Mundial",
              value: !isLoading && stats ? `${stats.worldProgress}%` : '94%',
              description: "Histórias esperando para serem contadas",
              color: "from-emerald-500/20 to-emerald-500/10",
              iconColor: "text-emerald-500"
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="group relative bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-8 text-center hover:shadow-2xl hover:shadow-primary/10 transition-all duration-700 overflow-hidden"
              whileHover={{ scale: 1.05, y: -10 }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 2 + index * 0.2 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative z-10">
                <motion.div 
                  className={`w-20 h-20 bg-gradient-to-br ${stat.color} rounded-3xl flex items-center justify-center mx-auto mb-6`}
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.8 }}
                >
                  <stat.icon className={`h-10 w-10 ${stat.iconColor}`} />
                </motion.div>
                
                <h3 className="text-2xl font-bold mb-3 text-foreground">{stat.title}</h3>
                
                <motion.p 
                  className={`text-2xl font-bold ${stat.iconColor} mb-3`}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 3, delay: index * 0.5 }}
                >
                  {stat.value}
                </motion.p>
                
                <p className="text-muted-foreground leading-relaxed">{stat.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2.5 }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <ChevronDown className="h-8 w-8 text-muted-foreground" />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}





function TestimonialsSection() {
  const { content: testimonialsContent } = useAdminContent('testimonials');
  
  const defaultTestimonials = [
    {
      name: "Aether Walker",
      role: "Líder da Guilda Crepúsculo",
      content: "A profundidade das mecânicas me surpreendeu. Cada decisão realmente importa.",
      avatar: "🧙‍♂️",
      rating: 5
    },
    {
      name: "Storm Rider",
      role: "Explorador Solitário",
      content: "O sistema de magia evolutivo é revolucionário. Minha jornada é única.",
      avatar: "⚡",
      rating: 5
    },
    {
      name: "Crystal Sage", 
      role: "Diplomata da Aliança do Norte",
      content: "As negociações políticas são tão intensas quanto qualquer batalha.",
      avatar: "💎",
      rating: 5
    }
  ];
  
  const testimonials = testimonialsContent?.testimonials || defaultTestimonials;

  return (
    <section className="py-24 bg-gradient-to-b from-background/80 to-background">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl font-bold font-headline text-primary mb-6">
            Vozes da Comunidade
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Descubra o que outros exploradores estão dizendo sobre suas jornadas épicas
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-card/60 backdrop-blur-md border border-border/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              whileHover={{ scale: 1.02, y: -5 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center mb-6">
                <div className="text-4xl mr-4">{testimonial.avatar}</div>
                <div>
                  <h4 className="font-bold text-foreground">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
              
              <p className="text-muted-foreground leading-relaxed mb-6 italic">
                "{testimonial.content}"
              </p>
              
              <div className="flex space-x-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.2 + i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function IdeasPageContent() {
  return (
    <div className="flex flex-col">
      <EnhancedHero />
      
      <SectionDivider variant="arknights" />
      
      <TestimonialsSection />
      

    </div>
  );
}

export default function IdeasPage() {
  const combinedSchema = [
    websiteSchema,
    organizationSchema,
    creativeWorkSchema
  ];

  return (
    <>
      <StructuredData data={combinedSchema} />
      <IdeasPageContent />
    </>
  );
}
