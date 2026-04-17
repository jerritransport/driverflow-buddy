import { useMemo } from 'react';
import { useDrivers, Driver } from '@/hooks/useDrivers';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PaymentBadge } from '@/components/shared/PaymentBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { getStepLabel } from '@/lib/constants';
import { formatDistanceToNow, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { Eye, AlertTriangle, Wine } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { formatDriverName } from '@/lib/utils';
import { StepProgress } from '@/components/shared/StepProgress';

interface TableViewProps {
  onDriverSelect?: (driverId: string) => void;
  dateRange?: DateRange;
}

export function TableView({ onDriverSelect, dateRange }: TableViewProps) {
  const { data: allDrivers, isLoading, error } = useDrivers();

  const drivers = useMemo(() => {
    if (!allDrivers || !dateRange?.from) return allDrivers;
    return allDrivers.filter((d) => {
      const created = new Date(d.created_at);
      return isWithinInterval(created, {
        start: startOfDay(dateRange.from!),
        end: dateRange.to ? endOfDay(dateRange.to) : endOfDay(new Date()),
      });
    });
  }, [allDrivers, dateRange]);

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Driver</TableHead>
              <TableHead>CDL</TableHead>
              <TableHead>Step</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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

  if (!drivers?.length) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <p className="text-muted-foreground">No drivers found</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Driver</TableHead>
            <TableHead>CDL</TableHead>
            <TableHead>Step</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers.map((driver) => (
            <DriverRow 
              key={driver.id} 
              driver={driver} 
              onView={() => onDriverSelect?.(driver.id)} 
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

interface DriverRowProps {
  driver: Driver;
  onView: () => void;
}

function DriverRow({ driver, onView }: DriverRowProps) {
  const updatedAt = driver.updated_at 
    ? formatDistanceToNow(new Date(driver.updated_at), { addSuffix: true })
    : 'Unknown';

  return (
    <TableRow className="cursor-pointer hover:bg-muted/50" onClick={onView}>
      <TableCell>
        <div className="flex items-center gap-2">
          <div>
            <p className="font-medium">
              {formatDriverName(driver.first_name, driver.middle_name, driver.last_name)}
            </p>
            <p className="text-xs text-muted-foreground">{driver.email}</p>
          </div>
          {driver.payment_hold && (
            <AlertTriangle className="h-4 w-4 text-[hsl(var(--status-danger))]" />
          )}
          {driver.requires_alcohol_test && (
            <Wine className="h-4 w-4 text-[hsl(var(--payment-hold))]" />
          )}
        </div>
      </TableCell>
      <TableCell>
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
          {driver.cdl_number}
        </code>
        <span className="ml-1 text-xs text-muted-foreground">{driver.cdl_state}</span>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center gap-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
              {driver.current_step}
            </span>
            <span className="text-sm">{getStepLabel(driver.current_step)}</span>
          </span>
          <StepProgress currentStep={driver.current_step} />
        </div>
      </TableCell>
      <TableCell>
        <StatusBadge status={driver.status} />
      </TableCell>
      <TableCell>
        <PaymentBadge status={driver.payment_status} />
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {updatedAt}
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onView(); }}>
          <Eye className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
