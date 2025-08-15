'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MessageCircle, 
  Bug, 
  Lightbulb, 
  TrendingUp, 
  Sparkles, 
  Globe, 
  Filter,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Eye,
  Reply,
  Trash2,
  Calendar,
  User,
  Mail,
  Tag,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from '@/context/i18n-context';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Feedback {
  id: string;
  type: 'bug' | 'feature' | 'improvement' | 'ui' | 'content' | 'general';
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  contactEmail: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: any;
  updatedAt: any;
  adminResponse?: string;
  assignedTo?: string;
  systemInfo?: {
    browser?: string;
    device?: string;
  };
}

interface FeedbackStats {
  totalSubmissions: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  byStatus: Record<string, number>;
}

const typeIcons = {
  bug: <Bug className="h-4 w-4" />,
  feature: <Lightbulb className="h-4 w-4" />,
  improvement: <TrendingUp className="h-4 w-4" />,
  ui: <Sparkles className="h-4 w-4" />,
  content: <Globe className="h-4 w-4" />,
  general: <MessageCircle className="h-4 w-4" />
};

const priorityColors = {
  low: 'bg-green-500/10 text-green-600 border-green-500/20',
  medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  high: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  critical: 'bg-red-500/10 text-red-600 border-red-500/20'
};

const statusColors = {
  open: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  in_progress: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  resolved: 'bg-green-500/10 text-green-600 border-green-500/20',
  closed: 'bg-gray-500/10 text-gray-600 border-gray-500/20'
};

const statusIcons = {
  open: <Clock className="h-3 w-3" />,
  in_progress: <AlertTriangle className="h-3 w-3" />,
  resolved: <CheckCircle className="h-3 w-3" />,
  closed: <XCircle className="h-3 w-3" />
};

export default function AdminFeedbackPage() {
  const { user, isAdmin } = useAuth();
  const { t } = useTranslation();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    priority: 'all',
    search: ''
  });
  const [adminResponse, setAdminResponse] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user && isAdmin) {
      fetchFeedbacks();
      fetchStats();
    }
  }, [user, isAdmin]);

  const fetchFeedbacks = async () => {
    if (!user) {
      console.warn('User not loaded yet');
      return;
    }

    try {
      setLoading(true);
    
      const token = await user.getIdToken();
      
      const response = await fetch('/api/admin/feedback', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.error}`);
      }

      const data = await response.json();
      setFeedbacks(data.feedbacks || []);
      
    } catch (error) {
      console.error('Erro ao buscar feedbacks:', error);
      const mockFeedbacks: Feedback[] = [
        {
          id: 'mock-1',
          type: 'bug',
          category: 'technical',
          priority: 'high',
          title: 'Erro ao carregar dados (usando dados de exemplo)',
          description: 'Os dados reais não puderam ser carregados. Estes são dados de exemplo para demonstração.',
          contactEmail: 'example@nomaryth.com',
          status: 'open',
          createdAt: new Date(),
          updatedAt: new Date(),
          systemInfo: {
            browser: 'Example Browser',
            device: 'Example Device'
          }
        }
      ];
      setFeedbacks(mockFeedbacks);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/feedback');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesStatus = filters.status === 'all' || feedback.status === filters.status;
    const matchesType = filters.type === 'all' || feedback.type === filters.type;
    const matchesPriority = filters.priority === 'all' || feedback.priority === filters.priority;
    const matchesSearch = filters.search === '' || 
      feedback.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      feedback.description.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesType && matchesPriority && matchesSearch;
  });

  const updateFeedbackStatus = async (feedbackId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const response = await fetch('/api/admin/feedback', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          feedbackId,
          updates: { status: newStatus }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setFeedbacks(prev => prev.map(f => 
        f.id === feedbackId 
          ? { ...f, status: newStatus as any, updatedAt: new Date() }
          : f
      ));
      
      if (selectedFeedback?.id === feedbackId) {
        setSelectedFeedback(prev => prev ? { ...prev, status: newStatus as any } : null);
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status. Tente novamente.');
    } finally {
      setUpdating(false);
    }
  };

  const addAdminResponse = async (feedbackId: string, response: string) => {
    setUpdating(true);
    try {
      const apiResponse = await fetch('/api/admin/feedback', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          feedbackId,
          updates: { adminResponse: response }
        })
      });

      if (!apiResponse.ok) {
        throw new Error(`HTTP error! status: ${apiResponse.status}`);
      }

      const data = await apiResponse.json();
      
      setFeedbacks(prev => prev.map(f => 
        f.id === feedbackId 
          ? { ...f, adminResponse: response, updatedAt: new Date() }
          : f
      ));
      
      if (selectedFeedback?.id === feedbackId) {
        setSelectedFeedback(prev => prev ? { ...prev, adminResponse: response } : null);
      }
      
      setAdminResponse('');
    } catch (error) {
      console.error('Erro ao adicionar resposta:', error);
      alert('Erro ao adicionar resposta. Tente novamente.');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (date: any) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">
            Gerenciar Feedback
          </h1>
          <p className="text-muted-foreground">
            Visualize e responda aos feedbacks dos usuários
          </p>
        </div>
        <Button onClick={fetchFeedbacks} disabled={loading}>
          <Search className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.totalSubmissions}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Abertos</p>
                  <p className="text-2xl font-bold">{stats.byStatus?.open || 0}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Em Progresso</p>
                  <p className="text-2xl font-bold">{stats.byStatus?.in_progress || 0}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resolvidos</p>
                  <p className="text-2xl font-bold">{stats.byStatus?.resolved || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>
            
            <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="open">Aberto</SelectItem>
                <SelectItem value="in_progress">Em Progresso</SelectItem>
                <SelectItem value="resolved">Resolvido</SelectItem>
                <SelectItem value="closed">Fechado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="feature">Feature</SelectItem>
                <SelectItem value="improvement">Melhoria</SelectItem>
                <SelectItem value="ui">UI/UX</SelectItem>
                <SelectItem value="content">Conteúdo</SelectItem>
                <SelectItem value="general">Geral</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.priority} onValueChange={(value) => setFilters({...filters, priority: value})}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Buscar..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-48"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">
            Feedbacks ({filteredFeedbacks.length})
          </h2>
          
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFeedbacks.map((feedback) => (
                <motion.div
                  key={feedback.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card 
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:shadow-md",
                      selectedFeedback?.id === feedback.id && "ring-2 ring-accent"
                    )}
                    onClick={() => setSelectedFeedback(feedback)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {typeIcons[feedback.type]}
                          <h3 className="font-medium truncate">{feedback.title}</h3>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge className={priorityColors[feedback.priority]}>
                            {feedback.priority}
                          </Badge>
                          <Badge className={statusColors[feedback.status]}>
                            {statusIcons[feedback.status]}
                            {feedback.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {feedback.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {feedback.contactEmail}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(feedback.createdAt)}
                          </span>
                        </div>
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {feedback.category}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              
              {filteredFeedbacks.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhum feedback encontrado</h3>
                    <p className="text-muted-foreground">
                      Tente ajustar os filtros ou aguarde novos feedbacks.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {selectedFeedback ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {typeIcons[selectedFeedback.type]}
                      Detalhes
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setSelectedFeedback(null)}>
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">{selectedFeedback.title}</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedFeedback.description}
                    </p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Status:</span>
                      <Badge className={cn("ml-2", statusColors[selectedFeedback.status])}>
                        {statusIcons[selectedFeedback.status]}
                        {selectedFeedback.status}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Prioridade:</span>
                      <Badge className={cn("ml-2", priorityColors[selectedFeedback.priority])}>
                        {selectedFeedback.priority}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Tipo:</span>
                      <span className="ml-2">{selectedFeedback.type}</span>
                    </div>
                    <div>
                      <span className="font-medium">Categoria:</span>
                      <span className="ml-2">{selectedFeedback.category}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedFeedback.contactEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Criado em {formatDate(selectedFeedback.createdAt)}</span>
                    </div>
                    {selectedFeedback.systemInfo && (
                      <>
                        {selectedFeedback.systemInfo.browser && (
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedFeedback.systemInfo.browser}</span>
                          </div>
                        )}
                        {selectedFeedback.systemInfo.device && (
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedFeedback.systemInfo.device}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {selectedFeedback.adminResponse && (
                    <>
                      <Separator />
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <h4 className="font-medium text-sm mb-1">Resposta do Admin:</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedFeedback.adminResponse}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Ações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Status:</label>
                    <Select 
                      value={selectedFeedback.status} 
                      onValueChange={(value) => updateFeedbackStatus(selectedFeedback.id, value)}
                      disabled={updating}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Aberto</SelectItem>
                        <SelectItem value="in_progress">Em Progresso</SelectItem>
                        <SelectItem value="resolved">Resolvido</SelectItem>
                        <SelectItem value="closed">Fechado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Resposta do Admin:</label>
                    <Textarea
                      placeholder="Digite sua resposta para o usuário..."
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      rows={3}
                    />
                    <Button 
                      className="mt-2 w-full" 
                      onClick={() => addAdminResponse(selectedFeedback.id, adminResponse)}
                      disabled={!adminResponse.trim() || updating}
                    >
                      <Reply className="h-4 w-4 mr-2" />
                      Enviar Resposta
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Selecione um feedback</h3>
                <p className="text-muted-foreground">
                  Clique em um feedback na lista para ver os detalhes e gerenciar.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}