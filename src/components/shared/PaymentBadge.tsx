import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS } from '@/lib/constants';

interface PaymentBadgeProps {
  status: string;
  className?: string;
}

export function PaymentBadge({ status, className }: PaymentBadgeProps) {
  const label = PAYMENT_STATUS_LABELS[status] || status;
  const colorClass = PAYMENT_STATUS_COLORS[status] || 'bg-muted text-muted-foreground';

  return (
    <Badge className={cn(colorClass, 'font-medium', className)}>
      {label}
    </Badge>
  );
}
