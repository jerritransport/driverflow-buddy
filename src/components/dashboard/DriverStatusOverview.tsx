import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface StatusData {
  label: string;
  count: number;
  color: string;
}

export function DriverStatusOverview() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['driver-status-overview'],
    queryFn: async () => {
      // Get all drivers for status counts
      const { data: drivers, error } = await supabase
        .from('drivers')
        .select('status, payment_status, follow_up_date, rtd_completed');

      if (error) throw error;

      const today = new Date().toISOString().split('T')[0];
      
      // Calculate counts
      const pending = drivers?.filter(d => 
        d.status?.toLowerCase().includes('pending')
      ).length || 0;

      const followUp = drivers?.filter(d => 
        d.status === 'FOLLOW_UP' || 
        (d.follow_up_date && d.follow_up_date >= today)
      ).length || 0;

      const paid = drivers?.filter(d => 
        d.payment_status === 'PAID' || d.payment_status === 'PAID_IN_FULL'
      ).length || 0;

      const completed = drivers?.filter(d => 
        d.rtd_completed === true || d.status === 'RTD_COMPLETE'
      ).length || 0;

      const total = drivers?.length || 1;

      return {
        total,
        statuses: [
          { label: 'Pending', count: pending, color: 'bg-muted-foreground/60' },
          { label: 'Follow-Up', count: followUp, color: 'bg-[hsl(var(--status-warning))]' },
          { label: 'Paid', count: paid, color: 'bg-primary' },
          { label: 'Completed', count: completed, color: 'bg-[hsl(var(--status-success))]' },
        ] as StatusData[],
      };
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-8" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const total = stats?.total || 1;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Driver Status Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stats?.statuses.map((status) => (
          <StatusRow 
            key={status.label}
            label={status.label}
            count={status.count}
            total={total}
            color={status.color}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function StatusRow({ 
  label, 
  count, 
  total, 
  color 
}: { 
  label: string; 
  count: number; 
  total: number; 
  color: string;
}) {
  const percentage = Math.round((count / total) * 100);
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{count}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-secondary">
        <div 
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${Math.max(percentage, 2)}%` }}
        />
      </div>
    </div>
  );
}
