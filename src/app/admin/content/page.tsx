'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, RefreshCw, FileText, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContentData {
  explore_title?: string;
  explore_subtitle?: string;
  testimonials?: Array<{
    name: string;
    role: string;
    content: string;
    avatar: string;
    rating: number;
  }>;
}

export default function ContentPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [homeContent, setHomeContent] = useState<ContentData>({});
  const [testimonialsContent, setTestimonialsContent] = useState<ContentData>({});

  const fetchContent = async (type: string) => {
    if (!user) return null;
    
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/admin/content?type=${type}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }

      const data = await response.json();
      return data.data || {};
    } catch (error) {
      console.error('Error fetching content:', error);
      return {};
    }
  };

  const saveContent = async (type: string, data: ContentData) => {
    if (!user) return;

    setSaving(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type, data })
      });

      if (!response.ok) {
        throw new Error('Failed to save content');
      }

      toast({
        title: "Sucesso",
        description: "Conteúdo salvo com sucesso!",
      });
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar conteúdo. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [homeData, testimonialsData] = await Promise.all([
        fetchContent('home-cards'),
        fetchContent('testimonials')
      ]);
      
      setHomeContent(homeData || {
        explore_title: "Understand the elements that define this continent on the brink of collapse.",
        explore_subtitle: "Nomaryth is defined by immutable rules, where every choice hides a consequence and every step shapes how your end will be."
      });
      
      setTestimonialsContent(testimonialsData || {
        testimonials: [
          {
            name: "Aether Walker",
            role: "Twilight Guild Leader",
            content: "The depth of mechanics surprised me. Every decision truly matters.",
            avatar: "⚔️",
            rating: 5
          },
          {
            name: "Storm Rider", 
            role: "Solo Explorer",
            content: "The evolving magic system is revolutionary. My journey is unique.",
            avatar: "🌪️",
            rating: 5
          },
          {
            name: "Crystal Sage",
            role: "Northern Alliance Diplomat", 
            content: "Political negotiations are as intense as any battle.",
            avatar: "🔮",
            rating: 5
          }
        ]
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const updateTestimonial = (index: number, field: string, value: any) => {
    if (index < 0 || index >= (testimonialsContent.testimonials?.length || 0)) {
      return;
    }
    
    const allowedFields = ['name', 'role', 'content', 'avatar', 'rating'];
    if (!allowedFields.includes(field)) {
      return;
    }
    
    let sanitizedValue = value;
    if (typeof value === 'string') {
      sanitizedValue = value.slice(0, field === 'content' ? 500 : 100);
    }
    if (field === 'rating') {
      sanitizedValue = Math.max(1, Math.min(5, parseInt(value) || 5));
    }
    
    setTestimonialsContent(prev => ({
      ...prev,
      testimonials: prev.testimonials?.map((testimonial, i) => 
        i === index ? { ...testimonial, [field]: sanitizedValue } : testimonial
      ) || []
    }));
  };

  const addTestimonial = () => {
    const currentCount = testimonialsContent.testimonials?.length || 0;
    if (currentCount >= 10) {
      toast({
        title: "Limite atingido",
        description: "Máximo de 10 depoimentos permitidos.",
        variant: "destructive"
      });
      return;
    }
    
    setTestimonialsContent(prev => ({
      ...prev,
      testimonials: [
        ...(prev.testimonials || []),
        {
          name: "",
          role: "",
          content: "",
          avatar: "👤",
          rating: 5
        }
      ]
    }));
  };

  const removeTestimonial = (index: number) => {
    setTestimonialsContent(prev => ({
      ...prev,
      testimonials: prev.testimonials?.filter((_, i) => i !== index) || []
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Conteúdo</CardTitle>
          <CardDescription>
            Gerencie o conteúdo dos cards e seções da página principal
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="home-cards" className="space-y-6">
        <TabsList>
          <TabsTrigger value="home-cards">
            <FileText className="h-4 w-4 mr-2" />
            Cards da Home
          </TabsTrigger>
          <TabsTrigger value="testimonials">
            <MessageSquare className="h-4 w-4 mr-2" />
            Community Voices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="home-cards">
          <Card>
            <CardHeader>
              <CardTitle>Cards da Página Principal</CardTitle>
              <CardDescription>
                Edite o título e subtítulo dos cards "Understand the elements..."
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="explore-title">Título Principal</Label>
                <Input
                  id="explore-title"
                  value={homeContent.explore_title || ''}
                  onChange={(e) => setHomeContent(prev => ({ ...prev, explore_title: e.target.value.slice(0, 200) }))}
                  placeholder="Título dos cards..."
                  maxLength={200}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="explore-subtitle">Subtítulo</Label>
                <Textarea
                  id="explore-subtitle"
                  value={homeContent.explore_subtitle || ''}
                  onChange={(e) => setHomeContent(prev => ({ ...prev, explore_subtitle: e.target.value.slice(0, 1000) }))}
                  placeholder="Subtítulo dos cards..."
                  rows={3}
                  maxLength={1000}
                />
              </div>

              <Button 
                onClick={() => saveContent('home-cards', homeContent)}
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar Cards'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonials">
          <Card>
            <CardHeader>
              <CardTitle>Community Voices</CardTitle>
              <CardDescription>
                Gerencie os depoimentos da seção Community Voices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {testimonialsContent.testimonials?.map((testimonial, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Depoimento {index + 1}</h3>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeTestimonial(index)}
                    >
                      Remover
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome</Label>
                      <Input
                        value={testimonial.name}
                        onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                        placeholder="Nome do usuário"
                        maxLength={100}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Cargo/Função</Label>
                      <Input
                        value={testimonial.role}
                        onChange={(e) => updateTestimonial(index, 'role', e.target.value)}
                        placeholder="Cargo ou função"
                        maxLength={100}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2 md:col-span-1">
                      <Label>Avatar (Emoji)</Label>
                      <Input
                        value={testimonial.avatar}
                        onChange={(e) => updateTestimonial(index, 'avatar', e.target.value)}
                        placeholder="🎮"
                        maxLength={10}
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-3">
                      <Label>Conteúdo do Depoimento</Label>
                      <Textarea
                        value={testimonial.content}
                        onChange={(e) => updateTestimonial(index, 'content', e.target.value)}
                        placeholder="Depoimento do usuário..."
                        rows={3}
                        maxLength={500}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex gap-4">
                <Button onClick={addTestimonial} variant="outline">
                  Adicionar Depoimento
                </Button>
                
                <Button 
                  onClick={() => saveContent('testimonials', testimonialsContent)}
                  disabled={saving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Salvando...' : 'Salvar Depoimentos'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
