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
import { Save, RefreshCw, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HomeCardsContent {
  explore_title: string;
  explore_subtitle: string;
}

export default function HomeCardsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<HomeCardsContent>({
    explore_title: "",
    explore_subtitle: ""
  });

  const fetchContent = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/admin/content?type=home-cards`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setContent(data.data || {
          explore_title: "Understand the elements that define this continent on the brink of collapse.",
          explore_subtitle: "Nomaryth is defined by immutable rules, where every choice hides a consequence and every step shapes how your end will be."
        });
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async () => {
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
          type: 'home-cards', 
          data: content
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save content');
      }

      toast({
        title: "Sucesso",
        description: "Cards da Home salvos com sucesso!",
      });
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar cards da home. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchContent();
    }
  }, [user]);

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
            <FileText className="h-5 w-5" />
            Cards da Página Principal
          </CardTitle>
          <CardDescription>
            Edite o título e subtítulo da seção "Understand the elements..." na página principal
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conteúdo dos Cards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="explore-title">Título Principal</Label>
                            <Input
                  id="explore-title"
                  value={content.explore_title}
                  onChange={(e) => setContent(prev => ({ ...prev, explore_title: e.target.value.slice(0, 200) }))}
                  placeholder="Título dos cards..."
                  maxLength={200}
                />
            <p className="text-sm text-muted-foreground">
              Este é o título principal que aparece acima dos três cards de features na página inicial.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="explore-subtitle">Subtítulo</Label>
            <Textarea
              id="explore-subtitle"
              value={content.explore_subtitle}
              onChange={(e) => setContent(prev => ({ ...prev, explore_subtitle: e.target.value.slice(0, 1000) }))}
              placeholder="Subtítulo dos cards..."
              rows={4}
              maxLength={1000}
            />
            <p className="text-sm text-muted-foreground">
              Este é o texto descritivo que aparece abaixo do título principal.
            </p>
          </div>

          <div className="pt-4">
            <Button 
              onClick={saveContent}
              disabled={saving}
              size="lg"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Cards da Home'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pré-visualização</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 border rounded-lg bg-muted/30">
            <h2 className="text-3xl font-bold text-center mb-4 text-primary">
              {content.explore_title || "Título não definido"}
            </h2>
            <p className="text-lg text-center text-muted-foreground max-w-2xl mx-auto">
              {content.explore_subtitle || "Subtítulo não definido"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
