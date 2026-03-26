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
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PaymentBadge } from '@/components/shared/PaymentBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DocumentProgress } from '@/components/shared/DocumentProgress';
import { getStepLabel } from '@/lib/constants';
import { formatDistanceToNow } from 'date-fns';
import { Driver } from '@/hooks/useDrivers';
import { SortField, SortOptions } from '@/hooks/useDriversManagement';
import { Eye, MoreHorizontal, Pencil, Trash2, AlertTriangle, Wine, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

interface DriversTableProps {
  drivers: Driver[];
  isLoading: boolean;
  onView: (driver: Driver) => void;
  onEdit: (driver: Driver) => void;
  onDelete: (driver: Driver) => void;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  sort?: SortOptions;
  onSortChange?: (sort: SortOptions) => void;
}

export function DriversTable({
  drivers,
  isLoading,
  onView,
  onEdit,
  onDelete,
  selectedIds = new Set(),
  onSelectionChange,
  sort = { field: 'updated_at', direction: 'desc' },
  onSortChange,
}: DriversTableProps) {
  const isSelectable = !!onSelectionChange;
  const isSortable = !!onSortChange;
  const allSelected = drivers.length > 0 && drivers.every((d) => selectedIds.has(d.id));
  const someSelected = drivers.some((d) => selectedIds.has(d.id)) && !allSelected;

  const handleSort = (field: SortField) => {
    if (!onSortChange) return;
    
    if (sort.field === field) {
      // Toggle direction
      onSortChange({ field, direction: sort.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      // New field, default to descending for dates, ascending for others
      onSortChange({ field, direction: field === 'updated_at' ? 'desc' : 'asc' });
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sort.field !== field) {
      return <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground/50" />;
    }
    return sort.direction === 'asc' 
      ? <ArrowUp className="ml-1 h-3 w-3" /> 
      : <ArrowDown className="ml-1 h-3 w-3" />;
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      const newSelection = new Set(selectedIds);
      drivers.forEach((d) => newSelection.add(d.id));
      onSelectionChange(newSelection);
    } else {
      const newSelection = new Set(selectedIds);
      drivers.forEach((d) => newSelection.delete(d.id));
      onSelectionChange(newSelection);
    }
  };

  const handleSelectOne = (driverId: string, checked: boolean) => {
    if (!onSelectionChange) return;
    const newSelection = new Set(selectedIds);
    if (checked) {
      newSelection.add(driverId);
    } else {
      newSelection.delete(driverId);
    }
    onSelectionChange(newSelection);
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {isSelectable && <TableHead className="w-[50px]" />}
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
                {isSelectable && <TableCell><Skeleton className="h-4 w-4" /></TableCell>}
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
    <div className="rounded-lg border bg-card overflow-x-auto">
      <Table className="min-w-[800px]">
        <TableHeader>
          <TableRow>
            {isSelectable && (
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={allSelected}
                  ref={(el) => {
                    if (el) {
                      (el as HTMLButtonElement & { indeterminate?: boolean }).indeterminate = someSelected;
                    }
                  }}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  aria-label="Select all drivers"
                />
              </TableHead>
            )}
            <TableHead>
              {isSortable ? (
                <button
                  onClick={() => handleSort('name')}
                  className="inline-flex items-center hover:text-foreground transition-colors"
                >
                  Driver{getSortIcon('name')}
                </button>
              ) : (
                'Driver'
              )}
            </TableHead>
            <TableHead>CDL</TableHead>
            <TableHead>
              {isSortable ? (
                <button
                  onClick={() => handleSort('current_step')}
                  className="inline-flex items-center hover:text-foreground transition-colors"
                >
                  Step{getSortIcon('current_step')}
                </button>
              ) : (
                'Step'
              )}
            </TableHead>
            <TableHead>
              {isSortable ? (
                <button
                  onClick={() => handleSort('status')}
                  className="inline-flex items-center hover:text-foreground transition-colors"
                >
                  Status{getSortIcon('status')}
                </button>
              ) : (
                'Status'
              )}
            </TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Staff</TableHead>
            <TableHead>Docs</TableHead>
            <TableHead>
              {isSortable ? (
                <button
                  onClick={() => handleSort('updated_at')}
                  className="inline-flex items-center hover:text-foreground transition-colors"
                >
                  Updated{getSortIcon('updated_at')}
                </button>
              ) : (
                'Updated'
              )}
            </TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers.map((driver) => (
            <DriverRow
              key={driver.id}
              driver={driver}
              isSelected={selectedIds.has(driver.id)}
              isSelectable={isSelectable}
              onSelect={(checked) => handleSelectOne(driver.id, checked)}
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
  isSelected: boolean;
  isSelectable: boolean;
  onSelect: (checked: boolean) => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function DriverRow({ driver, isSelected, isSelectable, onSelect, onView, onEdit, onDelete }: DriverRowProps) {
  const updatedAt = driver.updated_at
    ? formatDistanceToNow(new Date(driver.updated_at), { addSuffix: true })
    : 'Unknown';

  return (
    <TableRow 
      className={`cursor-pointer hover:bg-muted/50 ${isSelected ? 'bg-muted/30' : ''}`} 
      onClick={onView}
    >
      {isSelectable && (
        <TableCell onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(!!checked)}
            aria-label={`Select ${driver.first_name} ${driver.last_name}`}
          />
        </TableCell>
      )}
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
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {(driver as any).staff_member_name || driver.tenant_name || '—'}
        </span>
      </TableCell>
      <TableCell>
        <DocumentProgress documentsUploaded={driver.documents_uploaded} />
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