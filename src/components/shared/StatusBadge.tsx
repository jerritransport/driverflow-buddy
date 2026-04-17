import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { STATUS_LABELS } from '@/lib/constants';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const STATUS_COLORS: Record<string, string> = {
  // Step 1
  INTAKE_RECEIVED: 'bg-[hsl(var(--status-info))] text-white',
  INTAKE_PENDING: 'bg-[hsl(var(--status-info))] text-white',
  // Step 2
  UNPAID: 'bg-[hsl(var(--payment-unpaid))] text-white',
  PAYMENT_HOLD: 'bg-[hsl(var(--payment-hold))] text-white',
  PAYMENT_COMPLETE: 'bg-[hsl(var(--status-success))] text-white',
  // Step 3
  SAP_REQUEST_PENDING: 'bg-[hsl(var(--status-warning))] text-white',
  SAP_REQUESTED: 'bg-[hsl(var(--status-warning))] text-white',
  SAP_PAPERWORK_PENDING: 'bg-[hsl(var(--status-warning))] text-white',
  ALCOHOL_FEE_PENDING: 'bg-[hsl(var(--status-warning))] text-white',
  SAP_PAPERWORK_RECEIVED: 'bg-[hsl(var(--status-success))] text-white',
  // Step 4 — Clearinghouse
  CLEARINGHOUSE_AUTOMATING: 'bg-[hsl(var(--status-info))] text-white',
  CLEARINGHOUSE_2FA_PENDING: 'bg-[hsl(var(--status-warning))] text-white',
  CLEARINGHOUSE_ACCEPTED: 'bg-[hsl(var(--status-success))] text-white',
  CLEARINGHOUSE_FAILED: 'bg-destructive text-destructive-foreground',
  // Step 5
  DONOR_PASS_PENDING: 'bg-[hsl(var(--status-warning))] text-white',
  DONOR_PASS_SENT: 'bg-[hsl(var(--status-info))] text-white',
  // Step 6
  TEST_IN_PROGRESS: 'bg-[hsl(var(--status-info))] text-white',
  RESULTS_PENDING: 'bg-[hsl(var(--status-warning))] text-white',
  RESULTS_RECEIVED: 'bg-[hsl(var(--status-info))] text-white',
  RESULT_RECEIVED: 'bg-[hsl(var(--status-info))] text-white',
  RTD_REPORT_FAILED: 'bg-destructive text-destructive-foreground',
  // Step 7
  COMPLETED: 'bg-[hsl(var(--status-success))] text-white',
  RTD_COMPLETE: 'bg-[hsl(var(--status-success))] text-white',
  // Legacy
  DESIGNATION_PENDING: 'bg-[hsl(var(--status-info))] text-white',
  DESIGNATION_AUTOMATING: 'bg-[hsl(var(--status-info))] text-white',
  DESIGNATION_COMPLETE: 'bg-[hsl(var(--status-success))] text-white',
  CLEARINGHOUSE_PENDING: 'bg-[hsl(var(--status-info))] text-white',
  CLEARINGHOUSE_COMPLETE: 'bg-[hsl(var(--status-success))] text-white',
};

const FAILED_STATUSES = new Set(['CLEARINGHOUSE_FAILED', 'RTD_REPORT_FAILED']);
const COMPLETE_STATUSES = new Set(['COMPLETED', 'RTD_COMPLETE']);

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const label = STATUS_LABELS[status] || status;
  const colorClass = STATUS_COLORS[status] || 'bg-muted text-muted-foreground';
  const isFailed = FAILED_STATUSES.has(status);
  const isComplete = COMPLETE_STATUSES.has(status);

  return (
    <Badge className={cn(colorClass, 'font-medium gap-1', className)}>
      {isFailed && <AlertTriangle className="h-3 w-3" />}
      {isComplete && <CheckCircle2 className="h-3 w-3" />}
      {label}
    </Badge>
  );
}
