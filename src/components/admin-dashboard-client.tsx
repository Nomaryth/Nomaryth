'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
} from 'recharts';
import {
  Users,
  FileText,
  Shield,
  Activity,
  UserPlus,
  LogIn,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import type { ChartConfig } from '@/components/ui/chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role?: string;
  type?: 'signup' | 'login';
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  };
  lastLoginAt?: {
    seconds: number;
    nanoseconds: number;
  };
}

export interface DashboardData {
  totalUsers: number;
  adminUsers: number;
  contentPages: number;
  activeSessions: number;
  userSignups: { date: string; signups: number; logins: number }[];
  userRoles: { name: string; value: number; fill: string }[];
  recentActivity: UserData[];
}

const chartConfig = {
  users: {
    label: 'Users',
  },
  admin: {
    label: 'Admin',
  },
  signups: {
    label: 'Signups',
    color: 'hsl(var(--chart-2))',
  },
  logins: {
    label: 'Logins',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

const RecentActivityList = ({ users }: { users: UserData[] }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>User</TableHead>
        <TableHead>Activity</TableHead>
        <TableHead className="text-right">Time</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {users.length > 0 ? (
        users.map((user) => (
          <TableRow key={user.uid + (user.type ?? '')}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.photoURL} alt={user.displayName} />
                  <AvatarFallback>
                    {user.displayName?.charAt(0) ?? 'N'}
                  </AvatarFallback>
                </Avatar>
                <div className="font-medium">{user.displayName}</div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={user.type === 'signup' ? 'default' : 'secondary'}>
                {user.type === 'signup'
                  ? 'New user registered'
                  : 'User logged in'}
              </Badge>
            </TableCell>
            <TableCell className="text-right text-muted-foreground">
              {user.type === 'signup' && user.createdAt
                ? formatDistanceToNow(new Date(user.createdAt.seconds * 1000), {
                    addSuffix: true,
                  })
                : ''}
              {user.type === 'login' && user.lastLoginAt
                ? formatDistanceToNow(
                    new Date(user.lastLoginAt.seconds * 1000),
                    { addSuffix: true }
                  )
                : ''}
            </TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={3} className="h-24 text-center">
            No recent user activity.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
);

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export function AdminDashboardClient({ data }: { data: DashboardData }) {
  const {
    totalUsers,
    adminUsers,
    contentPages,
    activeSessions,
    userSignups,
    userRoles,
    recentActivity,
  } = data;
  const totalRoleUsers = userRoles.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={totalUsers.toLocaleString()}
          description="+2.5% from last month"
          icon={Users}
        />
        <StatCard
          title="Admin Users"
          value={adminUsers.toLocaleString()}
          description="Users with elevated privileges"
          icon={Shield}
        />
        <StatCard
          title="Content Pages"
          value={contentPages.toLocaleString()}
          description="Static documentation pages"
          icon={FileText}
        />
        <StatCard
          title="Active Now"
          value={`+${activeSessions.toLocaleString()}`}
          description="Users active in the last 24h"
          icon={Activity}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
            <CardDescription>
              Daily signups and logins over the last month.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart accessibilityLayer data={userSignups}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 6)}
                />
                <YAxis />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="logins"
                  fill="var(--color-logins)"
                  radius={4}
                  name="Logins"
                />
                <Bar
                  dataKey="signups"
                  fill="var(--color-signups)"
                  radius={4}
                  name="Signups"
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle>User Roles</CardTitle>
            <CardDescription>
              Distribution of user vs. admin roles.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 items-center justify-center pb-0">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square h-[200px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={userRoles}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  {userRoles.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent nameKey="name" />}
                  className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>The latest user signups and logins.</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentActivityList users={recentActivity} />
        </CardContent>
      </Card>
    </div>
  );
}
