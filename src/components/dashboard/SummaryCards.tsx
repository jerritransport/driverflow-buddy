import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useDashboardSummary } from '@/hooks/useDashboardSummary';
import { Skeleton } from '@/components/ui/skeleton';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
} from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  onClick?: () => void;
}

function SummaryCard({ title, value, subtitle, icon, variant = 'default', onClick }: SummaryCardProps) {
  const variantStyles = {
    default: 'border-border',
    success: 'border-l-4 border-l-[hsl(var(--status-success))]',
    warning: 'border-l-4 border-l-[hsl(var(--status-warning))]',
    danger: 'border-l-4 border-l-[hsl(var(--status-danger))]',
  };

  const isClickable = !!onClick;

  return (
    <Card
      className={cn(
        variantStyles[variant],
        isClickable && 'cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      )}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
    >
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

interface SummaryCardsProps {
  dateRange?: DateRange;
}

export function SummaryCards({ dateRange }: SummaryCardsProps) {
  const { data: summary, isLoading, error } = useDashboardSummary();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
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

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        title="Total Drivers"
        value={summary.total_drivers || 0}
        subtitle={`${summary.new_drivers_today || 0} new today`}
        icon={<Users className="h-5 w-5 text-muted-foreground" />}
        onClick={() => navigate('/drivers')}
      />
      <SummaryCard
        title="Needs Follow-Up"
        value={summary.payment_hold_count || 0}
        subtitle="Action required"
        icon={<AlertTriangle className="h-5 w-5 text-[hsl(var(--status-danger))]" />}
        variant="danger"
        onClick={() => navigate('/follow-ups')}
      />
      <SummaryCard
        title="In Progress"
        value={(summary.total_drivers || 0) - (summary.completed || 0)}
        subtitle="Active pipeline"
        icon={<Clock className="h-5 w-5 text-[hsl(var(--status-warning))]" />}
        variant="warning"
        onClick={() => navigate('/drivers?view=in_progress')}
      />
      <SummaryCard
        title="Completed"
        value={summary.completed || 0}
        subtitle={`${summary.completed_last_7_days || 0} this week`}
        icon={<CheckCircle className="h-5 w-5 text-[hsl(var(--status-success))]" />}
        variant="success"
        onClick={() => navigate('/drivers?view=completed')}
      />
    </div>
  );
}
