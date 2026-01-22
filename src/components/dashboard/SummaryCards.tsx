import { Card, CardContent } from '@/components/ui/card';
import { useDashboardSummary } from '@/hooks/useDashboardSummary';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  AlertTriangle, 
  DollarSign, 
  CheckCircle, 
  Clock,
  TrendingUp 
} from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

function SummaryCard({ title, value, subtitle, icon, variant = 'default' }: SummaryCardProps) {
  const variantStyles = {
    default: 'border-border',
    success: 'border-l-4 border-l-[hsl(var(--status-success))]',
    warning: 'border-l-4 border-l-[hsl(var(--status-warning))]',
    danger: 'border-l-4 border-l-[hsl(var(--status-danger))]',
  };

  return (
    <Card className={`${variantStyles[variant]}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="rounded-lg bg-muted p-2">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

export function SummaryCards() {
  const { data: summary, isLoading, error } = useDashboardSummary();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SummaryCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error || !summary) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6">
          <p className="text-sm text-destructive">Failed to load dashboard summary</p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <SummaryCard
        title="Total Drivers"
        value={summary.total_drivers || 0}
        subtitle={`${summary.new_drivers_today || 0} new today`}
        icon={<Users className="h-5 w-5 text-muted-foreground" />}
      />
      <SummaryCard
        title="Needs Attention"
        value={summary.payment_hold_count || 0}
        subtitle="Drivers on hold"
        icon={<AlertTriangle className="h-5 w-5 text-[hsl(var(--status-danger))]" />}
        variant="danger"
      />
      <SummaryCard
        title="In Progress"
        value={(summary.total_drivers || 0) - (summary.completed || 0)}
        subtitle="Active pipeline"
        icon={<Clock className="h-5 w-5 text-[hsl(var(--status-warning))]" />}
        variant="warning"
      />
      <SummaryCard
        title="Completed"
        value={summary.completed || 0}
        subtitle={`${summary.completed_last_7_days || 0} this week`}
        icon={<CheckCircle className="h-5 w-5 text-[hsl(var(--status-success))]" />}
        variant="success"
      />
      <SummaryCard
        title="Revenue"
        value={formatCurrency(summary.total_revenue || 0)}
        subtitle="Collected"
        icon={<DollarSign className="h-5 w-5 text-[hsl(var(--status-success))]" />}
        variant="success"
      />
      <SummaryCard
        title="Outstanding"
        value={formatCurrency(summary.total_outstanding || 0)}
        subtitle="Pending payment"
        icon={<TrendingUp className="h-5 w-5 text-muted-foreground" />}
      />
    </div>
  );
}
