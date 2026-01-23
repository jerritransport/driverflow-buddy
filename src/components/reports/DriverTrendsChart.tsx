import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useDriverTrends, useWeeklyDriverTrends } from '@/hooks/useReportsData';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

const chartConfig = {
  created: {
    label: 'New Drivers',
    color: 'hsl(var(--primary))',
  },
  completed: {
    label: 'Completed',
    color: 'hsl(var(--status-success))',
  },
};

export function DriverTrendsChart() {
  const [view, setView] = useState<'monthly' | 'weekly'>('monthly');
  const { data: monthlyData, isLoading: monthlyLoading } = useDriverTrends();
  const { data: weeklyData, isLoading: weeklyLoading } = useWeeklyDriverTrends();

  const data = view === 'monthly' ? monthlyData : weeklyData;
  const isLoading = view === 'monthly' ? monthlyLoading : weeklyLoading;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Driver Trends</CardTitle>
          <CardDescription>New drivers vs. completed RTD processes over time</CardDescription>
        </div>
        <Tabs value={view} onValueChange={(v) => setView(v as 'monthly' | 'weekly')}>
          <TabsList className="h-8">
            <TabsTrigger value="monthly" className="text-xs">
              Monthly
            </TabsTrigger>
            <TabsTrigger value="weekly" className="text-xs">
              Weekly
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--status-success))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--status-success))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="period"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="created"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#colorCreated)"
              />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="hsl(var(--status-success))"
                strokeWidth={2}
                fill="url(#colorCompleted)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
