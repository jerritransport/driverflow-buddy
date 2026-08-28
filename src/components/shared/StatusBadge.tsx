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
  INTAKE_RECEIVED: 'bg-[hsl(var(--status-info-bg))] text-[hsl(var(--status-info-text))]',
  INTAKE_PENDING: 'bg-[hsl(var(--status-info-bg))] text-[hsl(var(--status-info-text))]',
  // Step 2
  UNPAID: 'bg-[hsl(var(--status-danger-bg))] text-[hsl(var(--status-danger-text))]',
  PAYMENT_HOLD: 'bg-[hsl(var(--status-hold-bg))] text-[hsl(var(--status-hold-text))]',
  PAYMENT_COMPLETE: 'bg-[hsl(var(--status-success-bg))] text-[hsl(var(--status-success-text))]',
  // Step 3
  SAP_REQUEST_PENDING: 'bg-[hsl(var(--status-warning-bg))] text-[hsl(var(--status-warning-text))]',
  SAP_REQUESTED: 'bg-[hsl(var(--status-warning-bg))] text-[hsl(var(--status-warning-text))]',
  SAP_PAPERWORK_PENDING: 'bg-[hsl(var(--status-warning-bg))] text-[hsl(var(--status-warning-text))]',
  ALCOHOL_FEE_PENDING: 'bg-[hsl(var(--status-warning-bg))] text-[hsl(var(--status-warning-text))]',
  SAP_PAPERWORK_RECEIVED: 'bg-[hsl(var(--status-success-bg))] text-[hsl(var(--status-success-text))]',
  // Step 4 — Clearinghouse
  CLEARINGHOUSE_AUTOMATING: 'bg-[hsl(var(--status-info-bg))] text-[hsl(var(--status-info-text))]',
  CLEARINGHOUSE_2FA_PENDING: 'bg-[hsl(var(--status-warning-bg))] text-[hsl(var(--status-warning-text))]',
  CLEARINGHOUSE_ACCEPTED: 'bg-[hsl(var(--status-success-bg))] text-[hsl(var(--status-success-text))]',
  CLEARINGHOUSE_FAILED: 'bg-[hsl(var(--status-danger-bg))] text-[hsl(var(--status-danger-text))]',
  // Step 5
  DONOR_PASS_PENDING: 'bg-[hsl(var(--status-warning-bg))] text-[hsl(var(--status-warning-text))]',
  DONOR_PASS_SENT: 'bg-[hsl(var(--status-info-bg))] text-[hsl(var(--status-info-text))]',
  // Step 6
  TEST_IN_PROGRESS: 'bg-[hsl(var(--status-info-bg))] text-[hsl(var(--status-info-text))]',
  RESULTS_PENDING: 'bg-[hsl(var(--status-warning-bg))] text-[hsl(var(--status-warning-text))]',
  RESULTS_RECEIVED: 'bg-[hsl(var(--status-info-bg))] text-[hsl(var(--status-info-text))]',
  RESULT_RECEIVED: 'bg-[hsl(var(--status-info-bg))] text-[hsl(var(--status-info-text))]',
  RTD_REPORT_FAILED: 'bg-[hsl(var(--status-danger-bg))] text-[hsl(var(--status-danger-text))]',
  // Step 7
  COMPLETED: 'bg-[hsl(var(--status-success-bg))] text-[hsl(var(--status-success-text))]',
  RTD_COMPLETE: 'bg-[hsl(var(--status-success-bg))] text-[hsl(var(--status-success-text))]',
  // Legacy
  DESIGNATION_PENDING: 'bg-[hsl(var(--status-info-bg))] text-[hsl(var(--status-info-text))]',
  DESIGNATION_AUTOMATING: 'bg-[hsl(var(--status-info-bg))] text-[hsl(var(--status-info-text))]',
  DESIGNATION_COMPLETE: 'bg-[hsl(var(--status-success-bg))] text-[hsl(var(--status-success-text))]',
  CLEARINGHOUSE_PENDING: 'bg-[hsl(var(--status-info-bg))] text-[hsl(var(--status-info-text))]',
  CLEARINGHOUSE_COMPLETE: 'bg-[hsl(var(--status-success-bg))] text-[hsl(var(--status-success-text))]',
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
