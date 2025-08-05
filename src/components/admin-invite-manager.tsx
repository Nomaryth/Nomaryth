'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { Mail, UserPlus, X, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface AdminInvite {
  id: string;
  targetEmail: string;
  invitedBy: string;
  invitedByEmail: string;
  role: 'admin' | 'moderator';
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  createdAt: any;
  expiresAt: any;
}

export function AdminInviteManager() {
  const [invites, setInvites] = useState<AdminInvite[]>([]);
  const [loading, setLoading] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'moderator'>('admin');
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadInvites = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/admin/invites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInvites(data.invites || []);
      } else {
        console.error('Failed to load invites');
      }
    } catch (error) {
      console.error('Error loading invites:', error);
    } finally {
      setLoading(false);
    }
  };

  const createInvite = async () => {
    if (!user || !newEmail.trim()) return;
    
    setCreating(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          targetEmail: newEmail.trim(),
          role: newRole
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Convite criado',
          description: `Convite enviado para ${newEmail}`,
        });
        setNewEmail('');
        loadInvites();
      } else {
        toast({
          title: 'Erro',
          description: data.error || 'Erro ao criar convite',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error creating invite:', error);
      toast({
        title: 'Erro',
        description: 'Erro interno do servidor',
        variant: 'destructive'
      });
    } finally {
      setCreating(false);
    }
  };

  const cancelInvite = async (inviteId: string) => {
    if (!user) return;
    
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/admin/invites', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inviteId })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Convite cancelado',
          description: 'Convite foi cancelado com sucesso',
        });
        loadInvites();
      } else {
        toast({
          title: 'Erro',
          description: data.error || 'Erro ao cancelar convite',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error cancelling invite:', error);
      toast({
        title: 'Erro',
        description: 'Erro interno do servidor',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    loadInvites();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'expired':
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'accepted':
        return <Badge variant="default">Aceito</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expirado</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Criar Convite de Admin
          </CardTitle>
          <CardDescription>
            Envie um convite para dar privilégios administrativos a um usuário
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email do usuário</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@exemplo.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                disabled={creating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Função</Label>
              <Select value={newRole} onValueChange={(value: 'admin' | 'moderator') => setNewRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="moderator">Moderador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button 
            onClick={createInvite} 
            disabled={!newEmail.trim() || creating}
            className="w-full md:w-auto"
          >
            {creating ? 'Criando...' : 'Criar Convite'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Convites Pendentes
          </CardTitle>
          <CardDescription>
            Gerencie os convites de administrador enviados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Carregando convites...</p>
            </div>
          ) : invites.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum convite pendente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(invite.status)}
                    <div>
                      <p className="font-medium">{invite.targetEmail}</p>
                      <p className="text-sm text-muted-foreground">
                        Convidado por {invite.invitedByEmail}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Criado em {invite.createdAt?.toDate ? format(invite.createdAt.toDate(), 'dd/MM/yyyy HH:mm') : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={invite.role === 'admin' ? 'default' : 'secondary'}>
                      {invite.role === 'admin' ? 'Admin' : 'Moderador'}
                    </Badge>
                    {getStatusBadge(invite.status)}
                    {invite.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cancelInvite(invite.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 