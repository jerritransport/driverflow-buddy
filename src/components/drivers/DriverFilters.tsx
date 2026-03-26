import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DRIVER_STEPS, STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/constants';
import { DriverFilters as Filters } from '@/hooks/useDriversManagement';
import { Search, X, Filter, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DriverFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function DriverFilters({ filters, onFiltersChange }: DriverFiltersProps) {
  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilter = (key: keyof Filters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const activeFilterCount = Object.keys(filters).filter(
    (key) => filters[key as keyof Filters] !== undefined && filters[key as keyof Filters] !== ''
  ).length;

  // Get all unique statuses
  const allStatuses = DRIVER_STEPS.flatMap((step) => step.statuses);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        {/* Search */}
        <div className="relative w-full sm:flex-1 sm:min-w-[200px] sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, CDL, email, phone..."
            value={filters.search ?? ''}
            onChange={(e) => updateFilter('search', e.target.value || undefined)}
            className="pl-10"
          />
        </div>

        {/* Step Filter */}
        <Select
          value={filters.step?.toString() ?? 'all'}
          onValueChange={(value) =>
            updateFilter('step', value === 'all' ? undefined : parseInt(value))
          }
        >
          <SelectTrigger className="w-[calc(50%-0.25rem)] sm:w-[140px]">
            <SelectValue placeholder="All Steps" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Steps</SelectItem>
            {DRIVER_STEPS.map((step) => (
              <SelectItem key={step.step} value={step.step.toString()}>
                Step {step.step}: {step.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={filters.status ?? 'all'}
          onValueChange={(value) =>
            updateFilter('status', value === 'all' ? undefined : value)
          }
        >
          <SelectTrigger className="w-[calc(50%-0.25rem)] sm:w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {allStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {STATUS_LABELS[status] ?? status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Payment Status Filter */}
        <Select
          value={filters.paymentStatus ?? 'all'}
          onValueChange={(value) =>
            updateFilter('paymentStatus', value === 'all' ? undefined : value)
          }
        >
          <SelectTrigger className="w-[calc(50%-0.25rem)] sm:w-[140px]">
            <SelectValue placeholder="All Payments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            {Object.entries(PAYMENT_STATUS_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Payment Hold Filter */}
        <Select
          value={
            filters.paymentHold === undefined
              ? 'all'
              : filters.paymentHold
              ? 'hold'
              : 'no-hold'
          }
          onValueChange={(value) =>
            updateFilter(
              'paymentHold',
              value === 'all' ? undefined : value === 'hold'
            )
          }
        >
          <SelectTrigger className="w-[calc(50%-0.25rem)] sm:w-[140px]">
            <SelectValue placeholder="Hold Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Holds</SelectItem>
            <SelectItem value="hold">On Hold</SelectItem>
            <SelectItem value="no-hold">No Hold</SelectItem>
          </SelectContent>
        </Select>

        {/* Alcohol Test Filter */}
        <Select
          value={
            filters.requiresAlcoholTest === undefined
              ? 'all'
              : filters.requiresAlcoholTest
              ? 'yes'
              : 'no'
          }
          onValueChange={(value) =>
            updateFilter(
              'requiresAlcoholTest',
              value === 'all' ? undefined : value === 'yes'
            )
          }
        >
          <SelectTrigger className="w-[calc(50%-0.25rem)] sm:w-[140px]">
            <SelectValue placeholder="Alcohol Test" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tests</SelectItem>
            <SelectItem value="yes">Alcohol Required</SelectItem>
            <SelectItem value="no">No Alcohol</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Field Selector */}
        <Select
          value={filters.dateField ?? 'none'}
          onValueChange={(value) =>
            updateFilter('dateField', value === 'none' ? undefined : value as 'created_at' | 'updated_at')
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Date Field" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Date Filter</SelectItem>
            <SelectItem value="created_at">Created Date</SelectItem>
            <SelectItem value="updated_at">Updated Date</SelectItem>
          </SelectContent>
        </Select>

        {/* Date From */}
        {filters.dateField && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[140px] justify-start text-left font-normal",
                  !filters.dateFrom && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateFrom ? format(new Date(filters.dateFrom), "MMM d, yyyy") : "From"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
                onSelect={(date) => updateFilter('dateFrom', date ? format(date, 'yyyy-MM-dd') : undefined)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        )}

        {/* Date To */}
        {filters.dateField && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[140px] justify-start text-left font-normal",
                  !filters.dateTo && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateTo ? format(new Date(filters.dateTo), "MMM d, yyyy") : "To"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateTo ? new Date(filters.dateTo) : undefined}
                onSelect={(date) => updateFilter('dateTo', date ? format(date, 'yyyy-MM-dd') : undefined)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Filter className="h-3 w-3" />
            Active filters:
          </span>
          
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: "{filters.search}"
              <button onClick={() => clearFilter('search')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.step !== undefined && (
            <Badge variant="secondary" className="gap-1">
              Step {filters.step}
              <button onClick={() => clearFilter('step')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.status && (
            <Badge variant="secondary" className="gap-1">
              {STATUS_LABELS[filters.status] ?? filters.status}
              <button onClick={() => clearFilter('status')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.paymentStatus && (
            <Badge variant="secondary" className="gap-1">
              {PAYMENT_STATUS_LABELS[filters.paymentStatus] ?? filters.paymentStatus}
              <button onClick={() => clearFilter('paymentStatus')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.paymentHold !== undefined && (
            <Badge variant="secondary" className="gap-1">
              {filters.paymentHold ? 'On Hold' : 'No Hold'}
              <button onClick={() => clearFilter('paymentHold')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.requiresAlcoholTest !== undefined && (
            <Badge variant="secondary" className="gap-1">
              {filters.requiresAlcoholTest ? 'Alcohol Required' : 'No Alcohol'}
              <button onClick={() => clearFilter('requiresAlcoholTest')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.dateField && (filters.dateFrom || filters.dateTo) && (
            <Badge variant="secondary" className="gap-1">
              {filters.dateField === 'created_at' ? 'Created' : 'Updated'}:{' '}
              {filters.dateFrom && format(new Date(filters.dateFrom), "MMM d")}
              {filters.dateFrom && filters.dateTo && ' - '}
              {filters.dateTo && format(new Date(filters.dateTo), "MMM d")}
              <button onClick={() => {
                clearFilter('dateField');
                clearFilter('dateFrom');
                clearFilter('dateTo');
              }}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-6 px-2 text-xs">
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
