import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { useSapComparison } from '@/hooks/useReportsData';
import { Skeleton } from '@/components/ui/skeleton';

const chartConfig = {
  assigned: {
    label: 'Assigned',
    color: 'hsl(var(--primary))',
  },
  completed: {
    label: 'Completed',
    color: 'hsl(var(--status-success))',
  },
};

export function SapPerformanceChart() {
  const { data, isLoading } = useSapComparison();

  return (
    <Card>
      <CardHeader>
        <CardTitle>SAP Performance</CardTitle>
        <CardDescription>Drivers assigned vs. completed by Substance Abuse Professional</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : data && data.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value, name, props) => {
                  const rate = props.payload?.completionRate;
                  if (name === 'completed') {
                    return [`${value} (${rate}% rate)`, 'Completed'];
                  }
                  return [value, name];
                }}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="assigned" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" fill="hsl(var(--status-success))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No SAP data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
