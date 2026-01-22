import { useDriverPayments } from '@/hooks/useDriverDetails';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { DollarSign, ExternalLink, AlertCircle } from 'lucide-react';

interface PaymentHistoryTabProps {
  driverId: string;
}

export function PaymentHistoryTab({ driverId }: PaymentHistoryTabProps) {
  const { data: payments, isLoading, error } = useDriverPayments(driverId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive bg-destructive/10 p-4">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <p className="text-sm text-destructive">Failed to load payments</p>
      </div>
    );
  }

  if (!payments?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <DollarSign className="mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No payments recorded</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {payments.map((payment) => (
        <div key={payment.id} className="rounded-lg border bg-muted/30 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">
                  ${payment.amount.toFixed(2)}
                </span>
                <PaymentStatusBadge status={payment.status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {payment.payment_type.replace(/_/g, ' ')}
                {payment.payment_method_type && ` • ${payment.payment_method_type}`}
              </p>
              {payment.failure_reason && (
                <p className="mt-1 text-xs text-destructive">
                  {payment.failure_reason}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">
                {payment.initiated_at 
                  ? format(new Date(payment.initiated_at), 'MMM d, yyyy h:mm a')
                  : 'N/A'
                }
              </p>
              {payment.receipt_url && (
                <a
                  href={payment.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  Receipt <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const variants: Record<string, { className: string; label: string }> = {
    completed: { className: 'bg-[hsl(var(--status-success))] text-white', label: 'Completed' },
    pending: { className: 'bg-[hsl(var(--status-warning))] text-white', label: 'Pending' },
    failed: { className: 'bg-destructive text-destructive-foreground', label: 'Failed' },
    refunded: { className: 'bg-muted text-muted-foreground', label: 'Refunded' },
  };

  const variant = variants[status] || variants.pending;

  return (
    <Badge className={variant.className}>
      {variant.label}
    </Badge>
  );
}
