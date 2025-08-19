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
import { Save, RefreshCw, MessageSquare, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Testimonial {
  name: string;
  role: string;
  content: string;
  avatar: string;
  rating: number;
}

export default function CommunityVoicesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  const fetchTestimonials = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/admin/content?type=testimonials`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTestimonials(data.data?.testimonials || [
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
        ]);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTestimonials = async () => {
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
        body: JSON.stringify({ 
          type: 'testimonials', 
          data: { testimonials }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save testimonials');
      }

      toast({
        title: "Sucesso",
        description: "Community Voices salvo com sucesso!",
      });
    } catch (error) {
      console.error('Error saving testimonials:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar Community Voices. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTestimonials();
    }
  }, [user]);

  const updateTestimonial = (index: number, field: keyof Testimonial, value: any) => {
    if (index < 0 || index >= testimonials.length) {
      return;
    }
    
    let sanitizedValue = value;
    if (typeof value === 'string') {
      const maxLength = field === 'content' ? 500 : field === 'avatar' ? 10 : 100;
      sanitizedValue = value.slice(0, maxLength);
    }
    if (field === 'rating') {
      sanitizedValue = Math.max(1, Math.min(5, parseInt(value) || 5));
    }
    
    setTestimonials(prev => 
      prev.map((testimonial, i) => 
        i === index ? { ...testimonial, [field]: sanitizedValue } : testimonial
      )
    );
  };

  const addTestimonial = () => {
    if (testimonials.length >= 10) {
      toast({
        title: "Limite atingido",
        description: "Máximo de 10 depoimentos permitidos.",
        variant: "destructive"
      });
      return;
    }
    
    setTestimonials(prev => [
      ...prev,
      {
        name: "",
        role: "",
        content: "",
        avatar: "👤",
        rating: 5
      }
    ]);
  };

  const removeTestimonial = (index: number) => {
    setTestimonials(prev => prev.filter((_, i) => i !== index));
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
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Community Voices
          </CardTitle>
          <CardDescription>
            Gerencie os depoimentos da seção Community Voices que aparece na página principal
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-6">
        {testimonials.map((testimonial, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Depoimento {index + 1}</CardTitle>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeTestimonial(index)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        ))}

        <div className="flex gap-4">
          <Button onClick={addTestimonial} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Depoimento
          </Button>
          
          <Button 
            onClick={saveTestimonials}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Community Voices'}
          </Button>
        </div>
      </div>
    </div>
  );
}
