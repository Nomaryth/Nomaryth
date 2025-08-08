'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { badgeRegistry } from '@/lib/badges';
import { useAuth } from '@/context/auth-context';
import { Shield } from 'lucide-react';
import Link from 'next/link';

export default function AdminBadgesPage() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Acesso negado</CardTitle>
            <CardDescription>Somente administradores podem visualizar esta página.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const badges = Object.values(badgeRegistry);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-headline font-bold">Badges Disponíveis</h1>
          <p className="text-muted-foreground">Lista de conquistas que podem ser desbloqueadas pelos usuários.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {badges.map((b) => (
          <Card key={b.id} className="bg-card/60 border-border/60">
            <CardHeader className="flex flex-row items-center gap-3">
              <b.icon className="h-5 w-5 text-amber-400" />
              <div>
                <CardTitle className="text-base">{b.title}</CardTitle>
                <CardDescription>ID: {b.id}{b.secret ? ' • (Secreta)' : ''}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{b.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


