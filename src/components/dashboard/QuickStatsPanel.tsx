import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Send, Users, Calendar } from 'lucide-react';

export function QuickStatsPanel() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['quick-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      // Get donor passes generated today
      const { count: donorPassCount } = await supabase
        .from('drivers')
        .select('*', { count: 'exact', head: true })
        .gte('donor_pass_generated_at', todayStart.toISOString());

      // Get pending drivers (steps 1-6)
      const { count: pendingCount } = await supabase
        .from('drivers')
        .select('*', { count: 'exact', head: true })
        .lt('current_step', 7);

      // Get follow-ups due today
      const { count: followUpCount } = await supabase
        .from('drivers')
        .select('*', { count: 'exact', head: true })
        .eq('follow_up_date', today);

      return {
        donorPassToday: donorPassCount || 0,
        pendingDrivers: pendingCount || 0,
        followUpsDueToday: followUpCount || 0,
      };
    },
    refetchInterval: 30000,
  });

  return (
    <Card className="h-fit">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Quick Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <StatItem
          icon={<Send className="h-4 w-4 text-[hsl(var(--status-success))]" />}
          label="Donor Pass Today"
          value={stats?.donorPassToday}
          isLoading={isLoading}
        />
        <StatItem
          icon={<Users className="h-4 w-4 text-[hsl(var(--status-warning))]" />}
          label="Pending Drivers"
          value={stats?.pendingDrivers}
          isLoading={isLoading}
        />
        <StatItem
          icon={<Calendar className="h-4 w-4 text-primary" />}
          label="Follow-Ups Due"
          value={stats?.followUpsDueToday}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}

function StatItem({ 
  icon, 
  label, 
  value, 
  isLoading 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value?: number; 
  isLoading: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      {isLoading ? (
        <Skeleton className="h-5 w-8" />
      ) : (
        <span className="font-semibold">{value ?? 0}</span>
      )}
    </div>
  );
}
