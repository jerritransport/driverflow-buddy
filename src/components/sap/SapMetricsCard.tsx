import { Sap } from '@/hooks/useSaps';
import { Users, FileCheck, CheckCircle2, TrendingUp } from 'lucide-react';

interface SapMetricsCardProps {
  sap: Sap;
  driversCount: number;
}

export function SapMetricsCard({ sap, driversCount }: SapMetricsCardProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <MetricItem
        icon={Users}
        label="Drivers Referred"
        value={sap.total_drivers_referred?.toString() ?? '0'}
      />
      <MetricItem
        icon={FileCheck}
        label="Current Drivers"
        value={driversCount.toString()}
      />
    </div>
  );
}

interface MetricItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

function MetricItem({ icon: Icon, label, value }: MetricItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-lg font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
