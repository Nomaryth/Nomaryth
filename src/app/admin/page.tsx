'use client';

import { db } from '@/lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { AdminDashboardClient, type DashboardData } from '@/components/admin-dashboard-client';
import { Skeleton } from '@/components/ui/skeleton';
import { addDays, subDays, startOfMonth, endOfMonth, format } from 'date-fns';

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role?: string;
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

  useEffect(() => {
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

        const recentActivity = [...recentSignups.map(u => ({...u, type: 'signup'})), ...recentLogins.map(u => ({...u, type: 'login'}))]
          
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
        

        setData({
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
        });

      } catch (error) {
        console.error('Could not fetch dashboard data, likely due to Firestore rules:', error);
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
  }, []);

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
