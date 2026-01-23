import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import { useStepDistribution } from '@/hooks/useReportsData';
import { Skeleton } from '@/components/ui/skeleton';

const STEP_COLORS = [
  'hsl(var(--status-info))',
  'hsl(var(--status-warning))',
  'hsl(var(--primary))',
  'hsl(221, 83%, 63%)',
  'hsl(280, 67%, 48%)',
  'hsl(38, 92%, 50%)',
  'hsl(var(--status-success))',
];

const chartConfig = {
  count: {
    label: 'Drivers',
    color: 'hsl(var(--primary))',
  },
};

export function StepDistributionChart() {
  const { data, isLoading } = useStepDistribution();

  const totalDrivers = data?.reduce((sum, item) => sum + item.count, 0) || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Distribution</CardTitle>
        <CardDescription>
          Current driver count by workflow step ({totalDrivers} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 70, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                dataKey="label"
                type="category"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={65}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value, name, props) => [
                  `${value} drivers`,
                  props.payload?.label || name,
                ]}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {data?.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={STEP_COLORS[index % STEP_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
