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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PaymentBadge } from '@/components/shared/PaymentBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { getStepLabel } from '@/lib/constants';
import { formatDistanceToNow } from 'date-fns';
import { Driver } from '@/hooks/useDrivers';
import { Eye, MoreHorizontal, Pencil, Trash2, AlertTriangle, Wine } from 'lucide-react';

interface DriversTableProps {
  drivers: Driver[];
  isLoading: boolean;
  onView: (driver: Driver) => void;
  onEdit: (driver: Driver) => void;
  onDelete: (driver: Driver) => void;
}

export function DriversTable({
  drivers,
  isLoading,
  onView,
  onEdit,
  onDelete,
}: DriversTableProps) {
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
            {Array.from({ length: 10 }).map((_, i) => (
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

  if (!drivers.length) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <p className="text-muted-foreground">No drivers found matching your criteria</p>
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
              onView={() => onView(driver)}
              onEdit={() => onEdit(driver)}
              onDelete={() => onDelete(driver)}
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
  onEdit: () => void;
  onDelete: () => void;
}

function DriverRow({ driver, onView, onEdit, onDelete }: DriverRowProps) {
  const updatedAt = driver.updated_at
    ? formatDistanceToNow(new Date(driver.updated_at), { addSuffix: true })
    : 'Unknown';

  return (
    <TableRow className="cursor-pointer hover:bg-muted/50" onClick={onView}>
      <TableCell>
        <div className="flex items-center gap-2">
          <div>
            <p className="font-medium">
              {driver.first_name} {driver.last_name}
            </p>
            <p className="text-xs text-muted-foreground">{driver.email}</p>
          </div>
          {driver.payment_hold && (
            <AlertTriangle className="h-4 w-4 text-destructive" />
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
        <span className="inline-flex items-center gap-1.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            {driver.current_step}
          </span>
          <span className="text-sm">{getStepLabel(driver.current_step)}</span>
        </span>
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(); }}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Driver
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Driver
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
