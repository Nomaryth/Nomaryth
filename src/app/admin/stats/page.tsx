'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Users, BookOpen, Map, Zap, TrendingUp, Target, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";

interface WorldStats {
  id: string;
  totalUsers: number;
  activeFactions: number;
  totalNews: number;
  worldProgress: number;
  monthlyGrowth: number;
  targetAchieved: number;
  onlineTime: string;
  lastUpdated: string;
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<WorldStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = user ? await user.getIdToken() : undefined;
      const response = await fetch('/api/stats', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar estatísticas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!stats) return;

    try {
      setSaving(true);
      const token = user ? await user.getIdToken() : undefined;
      const response = await fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(stats)
      });

      if (response.ok) {
        toast({ title: "Sucesso", description: "Estatísticas salvas com sucesso" });
      } else {
        throw new Error('Failed to save stats');
      }
    } catch (error) {
      console.error('Error saving stats:', error);
      toast({ 
        title: "Erro", 
        description: "Falha ao salvar estatísticas", 
        variant: "destructive" 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof WorldStats, value: string | number) => {
    if (!stats) return;
    
    setStats({
      ...stats,
      [field]: typeof value === 'number' ? value : value
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Gerenciar Estatísticas</h1>
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
        <h1 className="text-2xl font-bold">Gerenciar Estatísticas</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas Principais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalUsers">Usuários Ativos</Label>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <Input
                    id="totalUsers"
                    type="number"
                    value={stats?.totalUsers || 0}
                    onChange={(e) => handleInputChange('totalUsers', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activeFactions">Facções Ativas</Label>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-green-600" />
                  <Input
                    id="activeFactions"
                    type="number"
                    value={stats?.activeFactions || 0}
                    onChange={(e) => handleInputChange('activeFactions', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalNews">Notícias Publicadas</Label>
                <div className="flex items-center gap-2">
                  <Map className="w-4 h-4 text-purple-600" />
                  <Input
                    id="totalNews"
                    type="number"
                    value={stats?.totalNews || 0}
                    onChange={(e) => handleInputChange('totalNews', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="worldProgress">Progresso Mundial (%)</Label>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-600" />
                  <Input
                    id="worldProgress"
                    type="number"
                    value={stats?.worldProgress || 0}
                    onChange={(e) => handleInputChange('worldProgress', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métricas Adicionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyGrowth">Crescimento Mensal (%)</Label>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <Input
                    id="monthlyGrowth"
                    type="number"
                    value={stats?.monthlyGrowth || 0}
                    onChange={(e) => handleInputChange('monthlyGrowth', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAchieved">Meta Alcançada (%)</Label>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <Input
                    id="targetAchieved"
                    type="number"
                    value={stats?.targetAchieved || 0}
                    onChange={(e) => handleInputChange('targetAchieved', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="onlineTime">Tempo Online</Label>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <Input
                    id="onlineTime"
                    type="text"
                    value={stats?.onlineTime || ''}
                    onChange={(e) => handleInputChange('onlineTime', e.target.value)}
                    placeholder="ex: 1.2k hrs"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview das Estatísticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-card/50 rounded-lg">
                <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                <div className="text-sm text-muted-foreground">Usuários</div>
              </div>
              <div className="text-center p-4 bg-card/50 rounded-lg">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">{stats?.activeFactions || 0}</div>
                <div className="text-sm text-muted-foreground">Facções</div>
              </div>
              <div className="text-center p-4 bg-card/50 rounded-lg">
                <Map className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold">{stats?.totalNews || 0}</div>
                <div className="text-sm text-muted-foreground">Notícias</div>
              </div>
              <div className="text-center p-4 bg-card/50 rounded-lg">
                <Zap className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold">{stats?.worldProgress || 0}%</div>
                <div className="text-sm text-muted-foreground">Progresso</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 