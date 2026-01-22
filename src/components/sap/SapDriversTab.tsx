import { SapDriver } from '@/hooks/useSaps';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PaymentBadge } from '@/components/shared/PaymentBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { CheckCircle2, Clock, User } from 'lucide-react';
import { getStepLabel } from '@/lib/constants';

interface SapDriversTabProps {
  drivers: SapDriver[];
  isLoading: boolean;
}

export function SapDriversTab({ drivers, isLoading }: SapDriversTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (drivers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <User className="mb-2 h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No drivers assigned to this SAP</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {drivers.map((driver) => (
        <DriverCard key={driver.id} driver={driver} />
      ))}
    </div>
  );
}

function DriverCard({ driver }: { driver: SapDriver }) {
  const hasPaperwork = !!driver.sap_paperwork_received_at;
  const isComplete = driver.current_step === 7;

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">
            {driver.first_name} {driver.last_name}
          </p>
          <p className="truncate text-xs text-muted-foreground">{driver.email}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {isComplete ? (
            <Badge variant="default" className="bg-primary">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Complete
            </Badge>
          ) : (
            <Badge variant="secondary">
              Step {driver.current_step}: {getStepLabel(driver.current_step)}
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <StatusBadge status={driver.status} />
        <PaymentBadge status={driver.payment_status} />
        {hasPaperwork && (
          <Badge variant="outline" className="text-xs">
            <CheckCircle2 className="mr-1 h-3 w-3 text-primary" />
            Paperwork Received
          </Badge>
        )}
      </div>

      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
        <span>CDL: {driver.cdl_number}</span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {format(new Date(driver.created_at), 'MMM d, yyyy')}
        </span>
      </div>
    </div>
  );
}
