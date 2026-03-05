import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardSummary } from '@/hooks/useDashboardSummary';
import { DollarSign, TrendingUp } from 'lucide-react';
import { DateRange } from 'react-day-picker';

interface RevenueOutstandingPanelProps {
  dateRange?: DateRange;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function RevenueOutstandingPanel({ dateRange }: RevenueOutstandingPanelProps) {
  const { data: summary, isLoading } = useDashboardSummary();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Financials</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Revenue */}
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-[hsl(var(--status-success))]/10 p-2">
            <DollarSign className="h-4 w-4 text-[hsl(var(--status-success))]" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Revenue</p>
            {isLoading ? (
              <Skeleton className="mt-1 h-6 w-20" />
            ) : (
              <p className="text-lg font-bold">{formatCurrency(summary?.total_revenue || 0)}</p>
            )}
            <p className="text-xs text-muted-foreground">Collected</p>
          </div>
        </div>

        {/* Outstanding */}
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-muted p-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Outstanding</p>
            {isLoading ? (
              <Skeleton className="mt-1 h-6 w-20" />
            ) : (
              <p className="text-lg font-bold">{formatCurrency(summary?.total_outstanding || 0)}</p>
            )}
            <p className="text-xs text-muted-foreground">Pending payment</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
