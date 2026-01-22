import { useUsersWithRoles, useAuditLogs } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, FileText, Activity } from 'lucide-react';

export function AdminStats() {
  const { data: users } = useUsersWithRoles();
  const { data: recentLogs } = useAuditLogs({ limit: 24 });

  const adminCount = users?.filter((u) => u.role === 'admin').length || 0;
  const staffCount = users?.filter((u) => u.role === 'staff').length || 0;
  const totalUsers = users?.length || 0;
  const recentChanges = recentLogs?.length || 0;

  const stats = [
    {
      title: 'Total Users',
      value: totalUsers,
      icon: Users,
      description: 'Registered accounts',
    },
    {
      title: 'Administrators',
      value: adminCount,
      icon: Shield,
      description: 'Users with admin role',
    },
    {
      title: 'Staff Members',
      value: staffCount,
      icon: Users,
      description: 'Users with staff role',
    },
    {
      title: 'Recent Changes',
      value: recentChanges,
      icon: Activity,
      description: 'Last 24 hours activity',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
