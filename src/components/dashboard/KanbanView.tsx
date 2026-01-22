import { useNavigate } from 'react-router-dom';
import { useDriversByStep, Driver } from '@/hooks/useDrivers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { PaymentBadge } from '@/components/shared/PaymentBadge';
import { DRIVER_STEPS } from '@/lib/constants';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, Wine } from 'lucide-react';

export function KanbanView() {
  const { data: driversByStep, isLoading, error } = useDriversByStep();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {DRIVER_STEPS.map((step) => (
          <div key={step.step} className="w-72 shrink-0">
            <Card className="h-[calc(100vh-300px)]">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-card p-6">
        <p className="text-sm text-destructive">Failed to load drivers: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {DRIVER_STEPS.map((step) => {
        const drivers = driversByStep?.[step.step] || [];
        return (
          <KanbanColumn
            key={step.step}
            step={step.step}
            label={step.label}
            drivers={drivers}
            onDriverClick={(id) => navigate(`/drivers/${id}`)}
          />
        );
      })}
    </div>
  );
}

interface KanbanColumnProps {
  step: number;
  label: string;
  drivers: Driver[];
  onDriverClick: (id: string) => void;
}

function KanbanColumn({ step, label, drivers, onDriverClick }: KanbanColumnProps) {
  const columnColors: Record<number, string> = {
    1: 'border-t-[hsl(var(--status-info))]',
    2: 'border-t-[hsl(var(--payment-deposit))]',
    3: 'border-t-[hsl(var(--status-warning))]',
    4: 'border-t-[hsl(var(--status-info))]',
    5: 'border-t-[hsl(var(--status-warning))]',
    6: 'border-t-[hsl(var(--status-info))]',
    7: 'border-t-[hsl(var(--status-success))]',
  };

  return (
    <div className="w-72 shrink-0">
      <Card className={`h-[calc(100vh-300px)] border-t-4 ${columnColors[step] || ''}`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm font-medium">
            <span>{label}</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs">
              {drivers.length}
            </span>
          </CardTitle>
        </CardHeader>
        <ScrollArea className="h-[calc(100%-60px)]">
          <CardContent className="space-y-2 pb-4">
            {drivers.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No drivers
              </p>
            ) : (
              drivers.map((driver) => (
                <DriverCard
                  key={driver.id}
                  driver={driver}
                  onClick={() => onDriverClick(driver.id)}
                />
              ))
            )}
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
}

interface DriverCardProps {
  driver: Driver;
  onClick: () => void;
}

function DriverCard({ driver, onClick }: DriverCardProps) {
  const updatedAt = driver.updated_at
    ? formatDistanceToNow(new Date(driver.updated_at), { addSuffix: true })
    : 'Unknown';

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-lg border bg-card p-3 shadow-sm transition-all hover:shadow-md hover:ring-1 hover:ring-primary/20"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">
            {driver.first_name} {driver.last_name}
          </p>
          <code className="text-xs text-muted-foreground">{driver.cdl_number}</code>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {driver.payment_hold && (
            <AlertTriangle className="h-4 w-4 text-[hsl(var(--status-danger))]" />
          )}
          {driver.requires_alcohol_test && (
            <Wine className="h-4 w-4 text-[hsl(var(--payment-hold))]" />
          )}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <PaymentBadge status={driver.payment_status} className="text-xs" />
        <span className="text-xs text-muted-foreground">{updatedAt}</span>
      </div>
    </div>
  );
}
