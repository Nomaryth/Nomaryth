'use client';

import { db } from '@/lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { AdminDashboardClient, type DashboardData } from '@/components/admin-dashboard-client';
import { Skeleton } from '@/components/ui/skeleton';
import { addDays, subDays, startOfMonth, endOfMonth, format } from 'date-fns';
import { useAuth } from '@/context/auth-context';
import { ErrorDisplay } from '@/components/error-display';
import { Lock } from 'lucide-react';

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role?: string;
  type?: 'login' | 'signup';
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  };
   lastLoginAt?: {
    seconds: number;
    nanoseconds: number;
  };
}

function AdminPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdmin, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setError('Usuário não autenticado');
      setLoading(false);
      return;
    }

    if (!isAdmin) {
      setError('Acesso negado. Apenas administradores podem acessar esta página.');
      setLoading(false);
      return;
    }

    async function getAdminDashboardData() {
      if (!db) {
        setLoading(false);
        setData({ totalUsers: 0, adminUsers: 0, contentPages: 4, activeSessions: 0, userSignups: [], userRoles: [], recentActivity: [] });
        return;
      }

      try {
        const usersSnapshot = await getDocs(query(collection(db, 'users')));
        
        const usersList = usersSnapshot.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        })) as UserData[];

        const totalUsers = usersList.length;
        const adminUsers = usersList.filter(user => user.role === 'admin').length;
        const normalUsers = totalUsers - adminUsers;

        const recentSignups = usersList
          .filter(u => u.createdAt)
          .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
          .slice(0, 5);
        
        const recentLogins = usersList
          .filter(u => u.lastLoginAt)
          .sort((a, b) => (b.lastLoginAt?.seconds ?? 0) - (a.lastLoginAt?.seconds ?? 0))
          .slice(0, 5);

        const recentActivity: UserData[] = [...recentSignups.map(u => ({...u, type: 'signup' as const})), ...recentLogins.map(u => ({...u, type: 'login' as const}))]
          
          .sort((a, b) => ((b.lastLoginAt?.seconds || b.createdAt?.seconds) ?? 0) - ((a.lastLoginAt?.seconds || a.createdAt?.seconds) ?? 0))
          .slice(0, 5);
        
        const today = new Date();
        const userSignups = Array.from({ length: 12 }, (_, i) => {
          const date = subDays(today, i * 3);
          return {
            date: format(date, 'MMM d'),
            signups: Math.floor(Math.random() * 15) + 5,
            logins: Math.floor(Math.random() * 40) + 20,
          };
        }).reverse();
        

        const dashboardData = {
             totalUsers, 
             adminUsers,
             contentPages: 4, 
             activeSessions: usersList.filter(u => u.lastLoginAt && subDays(new Date(), 1).getTime() < u.lastLoginAt.seconds * 1000).length,
             userSignups,
             userRoles: [
                { name: 'Admin', value: adminUsers, fill: 'hsl(var(--chart-1))' },
                { name: 'User', value: normalUsers, fill: 'hsl(var(--chart-2))' },
             ],
             recentActivity,
        };

        setData(dashboardData);

      } catch (error) {
        console.error('Could not fetch dashboard data, likely due to Firestore rules:', error);
        setError('Erro ao buscar dados do dashboard. Verifique suas permissões de administrador.');
        const userSignups = Array.from({ length: 12 }, (_, i) => {
          const date = subDays(new Date(), i * 3);
          return {
            date: format(date, 'MMM d'),
            signups: 0,
            logins: 0,
          };
        }).reverse();
        setData({ totalUsers: 0, adminUsers: 0, contentPages: 4, activeSessions: 0, userSignups, userRoles: [], recentActivity: [] });
      } finally {
        setLoading(false);
      }
    }
    
    getAdminDashboardData();
  }, [user, isAdmin, authLoading]);

  if (authLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="lg:col-span-2 h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <ErrorDisplay
        errorCode="401"
        title="Não Autenticado"
        description="Você precisa estar logado para acessar esta página."
        icon={<Lock className="w-16 h-16 text-accent/20 mt-8" />}
      />
    );
  }

  if (!isAdmin) {
    return (
      <ErrorDisplay
        errorCode="403"
        title="Acesso Negado"
        description="Apenas administradores podem acessar esta área."
        icon={<Lock className="w-16 h-16 text-accent/20 mt-8" />}
      />
    );
  }

  if (error) {
    return (
      <ErrorDisplay
        errorCode="500"
        title="Erro do Sistema"
        description={error}
        icon={<Lock className="w-16 h-16 text-accent/20 mt-8" />}
      />
    );
  }

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="lg:col-span-2 h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return <AdminDashboardClient data={data} />;
}

export default AdminPage;