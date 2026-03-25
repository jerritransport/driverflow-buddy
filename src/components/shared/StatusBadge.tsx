import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { STATUS_LABELS } from '@/lib/constants';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const STATUS_COLORS: Record<string, string> = {
  INTAKE_PENDING: 'bg-[hsl(var(--status-info))] text-white',
  PAYMENT_HOLD: 'bg-[hsl(var(--payment-hold))] text-white',
  PAYMENT_COMPLETE: 'bg-[hsl(var(--status-success))] text-white',
  SAP_REQUEST_PENDING: 'bg-[hsl(var(--status-warning))] text-white',
  SAP_PAPERWORK_PENDING: 'bg-[hsl(var(--status-warning))] text-white',
  SAP_PAPERWORK_RECEIVED: 'bg-[hsl(var(--status-success))] text-white',
  ALCOHOL_FEE_PENDING: 'bg-[hsl(var(--status-warning))] text-white',
  DESIGNATION_PENDING: 'bg-[hsl(var(--status-info))] text-white',
  DESIGNATION_AUTOMATING: 'bg-[hsl(var(--status-info))] text-white',
  DESIGNATION_COMPLETE: 'bg-[hsl(var(--status-success))] text-white',
  DONOR_PASS_PENDING: 'bg-[hsl(var(--status-warning))] text-white',
  DONOR_PASS_SENT: 'bg-[hsl(var(--status-info))] text-white',
  TEST_IN_PROGRESS: 'bg-[hsl(var(--status-info))] text-white',
  RESULTS_PENDING: 'bg-[hsl(var(--status-warning))] text-white',
  RESULTS_RECEIVED: 'bg-[hsl(var(--status-info))] text-white',
  RESULT_RECEIVED: 'bg-[hsl(var(--status-info))] text-white',
  RTD_COMPLETE: 'bg-[hsl(var(--status-success))] text-white',
  // Legacy
  CLEARINGHOUSE_PENDING: 'bg-[hsl(var(--status-info))] text-white',
  CLEARINGHOUSE_AUTOMATING: 'bg-[hsl(var(--status-info))] text-white',
  CLEARINGHOUSE_COMPLETE: 'bg-[hsl(var(--status-success))] text-white',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const label = STATUS_LABELS[status] || status;
  const colorClass = STATUS_COLORS[status] || 'bg-muted text-muted-foreground';

  return (
    <Badge className={cn(colorClass, 'font-medium', className)}>
      {label}
    </Badge>
  );
}
