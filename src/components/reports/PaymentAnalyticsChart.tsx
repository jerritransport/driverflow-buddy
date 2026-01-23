import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { usePaymentTrends } from '@/hooks/useReportsData';
import { useDashboardSummary } from '@/hooks/useDashboardSummary';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, TrendingUp, CreditCard, AlertCircle } from 'lucide-react';

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'hsl(var(--status-success))',
  },
  refunds: {
    label: 'Refunds',
    color: 'hsl(var(--status-danger))',
  },
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value);
}

export function PaymentAnalyticsChart() {
  const { data: paymentData, isLoading: paymentsLoading } = usePaymentTrends();
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();

  const isLoading = paymentsLoading || summaryLoading;

  const stats = [
    {
      label: 'Total Revenue',
      value: summary ? formatCurrency(summary.total_revenue || 0) : '$0',
      icon: DollarSign,
      color: 'text-status-success',
    },
    {
      label: 'Outstanding',
      value: summary ? formatCurrency(summary.total_outstanding || 0) : '$0',
      icon: AlertCircle,
      color: 'text-status-warning',
    },
    {
      label: 'Avg Completion',
      value: summary ? `${Math.round(summary.avg_completion_days || 0)} days` : '0 days',
      icon: TrendingUp,
      color: 'text-primary',
    },
    {
      label: 'Payment Holds',
      value: summary?.payment_hold_count || 0,
      icon: CreditCard,
      color: 'text-status-danger',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Analytics</CardTitle>
        <CardDescription>Revenue and payment metrics over time</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-lg border bg-card p-3"
            >
              <div className={`rounded-full bg-muted p-2 ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                {isLoading ? (
                  <Skeleton className="mt-1 h-5 w-16" />
                ) : (
                  <p className="text-lg font-semibold">{stat.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        {isLoading ? (
          <Skeleton className="h-[250px] w-full" />
        ) : paymentData && paymentData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart data={paymentData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="period"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
                width={50}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="revenue" fill="hsl(var(--status-success))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="refunds" fill="hsl(var(--status-danger))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            No payment data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
