import { ClinicPerformance } from '@/hooks/useClinics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Users, CheckCircle, Clock, TrendingUp, ThumbsUp, ThumbsDown } from 'lucide-react';

interface ClinicMetricsCardProps {
  clinic: ClinicPerformance;
}

export function ClinicMetricsCard({ clinic }: ClinicMetricsCardProps) {
  const metrics = [
    {
      label: 'Total Assigned',
      value: clinic.total_drivers_assigned || 0,
      icon: Users,
    },
    {
      label: 'Tests Completed',
      value: clinic.tests_completed || 0,
      icon: CheckCircle,
    },
    {
      label: 'Avg Turnaround',
      value: clinic.avg_turnaround_days
        ? `${Number(clinic.avg_turnaround_days).toFixed(1)} days`
        : 'N/A',
      icon: Clock,
    },
  ];

  const completionRate = clinic.completion_rate_percent || 0;
  const totalResults = (clinic.negative_results || 0) + (clinic.positive_results || 0);
  const negativeRate = totalResults > 0 
    ? ((clinic.negative_results || 0) / totalResults) * 100 
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <metric.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{metric.label}</span>
              </div>
              <p className="mt-1 text-2xl font-bold">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <TrendingUp className="h-4 w-4" />
            Completion Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Progress value={completionRate} className="h-3 flex-1" />
            <span className="text-lg font-bold">{completionRate.toFixed(0)}%</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Test Results Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ThumbsUp className="h-4 w-4 text-primary" />
                <span>Negative Results</span>
              </div>
              <span className="font-medium text-primary">
                {clinic.negative_results || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ThumbsDown className="h-4 w-4 text-destructive" />
                <span>Positive Results</span>
              </div>
              <span className="font-medium text-destructive">
                {clinic.positive_results || 0}
              </span>
            </div>
            {totalResults > 0 && (
              <div className="mt-2">
                <Progress value={negativeRate} className="h-2" />
                <p className="mt-1 text-xs text-muted-foreground">
                  {negativeRate.toFixed(1)}% negative rate
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
