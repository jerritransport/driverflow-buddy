import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ComposedChart, Line } from 'recharts';
import { useClinicComparison } from '@/hooks/useReportsData';
import { Skeleton } from '@/components/ui/skeleton';

const chartConfig = {
  testsCompleted: {
    label: 'Tests Completed',
    color: 'hsl(var(--primary))',
  },
  avgTurnaround: {
    label: 'Avg Turnaround (days)',
    color: 'hsl(var(--status-warning))',
  },
};

export function ClinicPerformanceChart() {
  const { data, isLoading } = useClinicComparison();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clinic Performance</CardTitle>
        <CardDescription>Tests completed and average turnaround time by clinic</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : data && data.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ComposedChart data={data} margin={{ top: 10, right: 40, left: 0, bottom: 40 }}>
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
                yAxisId="left"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={40}
                tickFormatter={(value) => `${value}d`}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value, name, props) => {
                  if (name === 'avgTurnaround') {
                    return [`${value} days`, 'Avg Turnaround'];
                  }
                  if (name === 'testsCompleted') {
                    const rate = props.payload?.positiveRate;
                    return [`${value} (${rate}% positive)`, 'Tests Completed'];
                  }
                  return [value, name];
                }}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar
                yAxisId="left"
                dataKey="testsCompleted"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgTurnaround"
                stroke="hsl(var(--status-warning))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--status-warning))', strokeWidth: 0 }}
              />
            </ComposedChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No clinic data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
