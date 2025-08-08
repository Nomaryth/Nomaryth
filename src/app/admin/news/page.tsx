'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell, Plus, ExternalLink, RefreshCw, Edit, Save, X, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import type { NewsItem } from "@/lib/github-api";

interface NewsItemFromAPI {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  date: string;
  type: 'update' | 'event' | 'announcement';
  featured: boolean;
  author?: string;
  tags?: string[];
  published: boolean;
  firebaseId: string;
}

export default function AdminNewsPage() {
  const [news, setNews] = useState<NewsItemFromAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItemFromAPI | null>(null);
  const [newNews, setNewNews] = useState({
    title: '',
    excerpt: '',
    content: '',
    type: 'announcement' as const,
    featured: false,
    author: '',
    tags: [] as string[],
    published: true
  });
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const token = user ? await user.getIdToken() : undefined;
      const response = await fetch('/api/news', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (response.ok) {
        const data = await response.json();
        setNews(data);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar notícias",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNews = async () => {
    if (!user) {
      toast({ title: "Erro", description: "Você precisa estar logado.", variant: "destructive" });
      return;
    }
    if (!newNews.title.trim() || !newNews.excerpt.trim()) {
      toast({
        title: "Erro",
        description: "Título e resumo são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          title: newNews.title,
          excerpt: newNews.excerpt,
          content: newNews.content,
          type: newNews.type,
          featured: newNews.featured,
          author: newNews.author,
          tags: newNews.tags,
          published: newNews.published
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Sucesso",
          description: data.message,
        });
        
        setNewNews({
          title: '',
          excerpt: '',
          content: '',
          type: 'announcement',
          featured: false,
          author: '',
          tags: [],
          published: true
        });
        fetchNews();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar notícia');
      }
    } catch (error) {
      console.error('Error creating news:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar notícia",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditNews = (newsItem: NewsItemFromAPI) => {
    setEditingNews(newsItem);
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!editingNews) return;
    if (!user) {
      toast({ title: "Erro", description: "Você precisa estar logado.", variant: "destructive" });
      return;
    }
    
    if (!editingNews.title.trim() || !editingNews.excerpt.trim()) {
      toast({
        title: "Erro",
        description: "Título e resumo são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          firebaseId: editingNews.firebaseId,
          title: editingNews.title,
          excerpt: editingNews.excerpt,
          content: editingNews.content,
          type: editingNews.type,
          featured: editingNews.featured,
          author: editingNews.author,
          tags: editingNews.tags,
          published: editingNews.published
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Sucesso",
          description: data.message,
        });
        
        fetchNews();
        setEditing(false);
        setEditingNews(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar notícia');
      }
    } catch (error) {
      console.error('Error updating news:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao atualizar notícia",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditingNews(null);
  };

  const handleDeleteNews = async (newsItem: NewsItemFromAPI) => {
    if (!user) {
      toast({ title: "Erro", description: "Você precisa estar logado.", variant: "destructive" });
      return;
    }
    if (!confirm(`Tem certeza que deseja deletar a notícia "${newsItem.title}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`/api/news/${newsItem.firebaseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${idToken}` },
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Notícia deletada com sucesso",
        });
        fetchNews();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao deletar notícia');
      }
    } catch (error) {
      console.error('Error deleting news:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao deletar notícia",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'update': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'event': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'announcement': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'update': return 'Atualização';
      case 'event': return 'Evento';
      case 'announcement': return 'Anúncio';
      default: return 'Outro';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Data inválida';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Gerenciar Notícias</h1>
        <div className="grid gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-10 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciar Notícias</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchNews}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Notícia
          </Button>
        </div>
      </div>

      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Criar Nova Notícia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={newNews.title}
                  onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                  placeholder="Título da notícia"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={newNews.type}
                  onValueChange={(value: any) => setNewNews({ ...newNews, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Anúncio</SelectItem>
                    <SelectItem value="update">Atualização</SelectItem>
                    <SelectItem value="event">Evento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Resumo</Label>
              <Input
                id="excerpt"
                value={newNews.excerpt}
                onChange={(e) => setNewNews({ ...newNews, excerpt: e.target.value })}
                placeholder="Resumo da notícia"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo (Opcional)</Label>
              <Textarea
                id="content"
                value={newNews.content}
                onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
                placeholder="Conteúdo completo da notícia (markdown suportado)"
                rows={4}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={newNews.featured}
                onCheckedChange={(checked) => setNewNews({ ...newNews, featured: !!checked })}
              />
              <Label htmlFor="featured">Marcar como destaque</Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateNews} disabled={creating}>
                {creating ? 'Criando...' : 'Criar Notícia'}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {editing && editingNews && (
        <Card className="mb-6 border-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Editar Notícia
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              <p>⚠️ Como estamos usando GitHub Issues, a edição criará uma nova versão da notícia.</p>
              <p>A versão anterior será marcada como fechada automaticamente.</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Título</Label>
                <Input
                  id="edit-title"
                  value={editingNews.title}
                  onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })}
                  placeholder="Título da notícia"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-type">Tipo</Label>
                <Select
                  value={editingNews.type}
                  onValueChange={(value: any) => setEditingNews({ ...editingNews, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Anúncio</SelectItem>
                    <SelectItem value="update">Atualização</SelectItem>
                    <SelectItem value="event">Evento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-excerpt">Resumo</Label>
              <Input
                id="edit-excerpt"
                value={editingNews.excerpt}
                onChange={(e) => setEditingNews({ ...editingNews, excerpt: e.target.value })}
                placeholder="Resumo da notícia"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-content">Conteúdo (Opcional)</Label>
              <Textarea
                id="edit-content"
                value={editingNews.content || ''}
                onChange={(e) => setEditingNews({ ...editingNews, content: e.target.value })}
                placeholder="Conteúdo completo da notícia (markdown suportado)"
                rows={4}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-featured"
                checked={editingNews.featured}
                onCheckedChange={(checked) => setEditingNews({ ...editingNews, featured: !!checked })}
              />
              <Label htmlFor="edit-featured">Marcar como destaque</Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveEdit} disabled={creating}>
                <Save className="w-4 h-4 mr-2" />
                {creating ? 'Criando Nova Versão...' : 'Criar Nova Versão'}
              </Button>
              <Button variant="outline" onClick={handleCancelEdit}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {news.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getTypeColor(item.type)}`}
                    >
                      {getTypeLabel(item.type)}
                    </Badge>
                    {item.featured && (
                      <Badge variant="secondary" className="text-xs">
                        <Bell className="w-3 h-3 mr-1" />
                        Destaque
                      </Badge>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                      <span>{formatDate(item.date)}</span>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-sm mb-1">
                    {item.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-xs line-clamp-2">
                    {item.excerpt}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-accent"
                    onClick={() => handleEditNews(item)}
                    disabled={editing}
                    title="Editar notícia"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
                    onClick={() => handleDeleteNews(item)}
                    disabled={loading}
                    title="Deletar notícia"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-accent"
                    title="Ver no GitHub"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {news.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma notícia encontrada</h3>
              <p className="text-muted-foreground">
                Crie sua primeira notícia usando o botão acima.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 