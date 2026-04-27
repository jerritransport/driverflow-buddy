import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DriverFilters,
  DriversTable,
  DriversPagination,
  DriverFormDialog,
  DeleteDriverDialog,
  BulkActionsBar,
} from '@/components/drivers';
import { DriverDetailPanel } from '@/components/driver-detail/DriverDetailPanel';
import { useDriversPaginated, useAllFilteredDrivers, DriverFilters as FilterType, SortOptions } from '@/hooks/useDriversManagement';
import { Driver } from '@/hooks/useDrivers';
import { exportDriversToCSV } from '@/lib/exportUtils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Users, AlertTriangle, Wine, CheckCircle, Download, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function Drivers() {
  const [searchParams, setSearchParams] = useSearchParams();
  // State management
  const [filters, setFilters] = useState<FilterType>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState<SortOptions>({ field: 'updated_at', direction: 'desc' });

  // Apply view filter from URL (e.g. ?view=completed | in_progress | alcohol | unpaid)
  useEffect(() => {
    const view = searchParams.get('view');
    if (!view) return;
    if (view === 'completed') {
      setFilters((f) => ({ ...f, status: 'RTD_COMPLETE', notStatus: undefined }));
    } else if (view === 'in_progress') {
      setFilters((f) => ({ ...f, status: undefined, notStatus: 'RTD_COMPLETE' }));
    } else if (view === 'alcohol') {
      setFilters((f) => ({ ...f, requiresAlcoholTest: true }));
    } else if (view === 'unpaid') {
      setFilters((f) => ({ ...f, paymentStatus: 'UNPAID' }));
    }
    // Clear the param so the user can later modify filters freely
    searchParams.delete('view');
    setSearchParams(searchParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Selection state for bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Dialog states
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingDriver, setDeletingDriver] = useState<Driver | null>(null);
  
  // Export state
  const [isExporting, setIsExporting] = useState(false);

  // Fetch drivers with pagination and sorting
  const { data, isLoading, error } = useDriversPaginated(filters, { page, pageSize }, sort);
  
  // Fetch all filtered drivers for export (only when exporting)
  const { data: allDrivers, isFetching: isFetchingAll, refetch: refetchAll } = useAllFilteredDrivers(filters, sort, isExporting);

  // Handle export completion
  useEffect(() => {
    if (isExporting && allDrivers && !isFetchingAll) {
      if (allDrivers.length === 0) {
        toast.error('No drivers to export');
      } else {
        exportDriversToCSV(allDrivers, 'drivers_export');
        toast.success(`Exported ${allDrivers.length} driver${allDrivers.length === 1 ? '' : 's'} to CSV`);
      }
      setIsExporting(false);
    }
  }, [isExporting, allDrivers, isFetchingAll]);

  // Handle export all
  const handleExportAll = useCallback(() => {
    setIsExporting(true);
    refetchAll();
  }, [refetchAll]);

  // Reset to page 1 when filters change
  const handleFiltersChange = useCallback((newFilters: FilterType) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  }, []);

  // Driver actions
  const handleView = (driver: Driver) => {
    setSelectedDriver(driver);
    setDetailPanelOpen(true);
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setFormDialogOpen(true);
  };

  const handleDelete = (driver: Driver) => {
    setDeletingDriver(driver);
    setDeleteDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingDriver(null);
    setFormDialogOpen(true);
  };

  // Clear bulk selection
  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Calculate quick stats from data
  const totalDrivers = data?.totalCount ?? 0;
  const drivers = data?.drivers ?? [];
  const totalPages = data?.totalPages ?? 0;

  // Get selected drivers for bulk actions
  const selectedDrivers = useMemo(() => {
    return drivers.filter((d) => selectedIds.has(d.id));
  }, [drivers, selectedIds]);

  return (
    <AppLayout>
      <div className="space-y-4 p-3 sm:space-y-6 sm:p-6 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Driver Management</h1>
            <p className="text-muted-foreground">
              Manage driver records, track their progress, and handle RTD workflow
            </p>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <Button
              variant={filters.showHidden ? 'default' : 'outline'}
              onClick={() => handleFiltersChange({ ...filters, showHidden: !filters.showHidden })}
              className="gap-2 flex-1 sm:flex-none"
            >
              {filters.showHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {filters.showHidden ? 'Hide Hidden' : 'Show Hidden'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExportAll} 
              disabled={isExporting || isFetchingAll}
              className="gap-2 flex-1 sm:flex-none"
            >
              {isExporting || isFetchingAll ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export All
            </Button>
            <Button onClick={handleAddNew} className="gap-2 flex-1 sm:flex-none">
              <Plus className="h-4 w-4" />
              Add Driver
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickStatCard
            icon={Users}
            label="Total Drivers"
            value={totalDrivers.toLocaleString()}
            iconColor="text-primary"
            onClick={() => handleFiltersChange({})}
          />
          <QuickStatCard
            icon={AlertTriangle}
            label="Pending Final Balance"
            value={drivers.filter((d) => d.payment_status === 'UNPAID' || d.payment_status === 'DEPOSIT').length.toString()}
            iconColor="text-[hsl(var(--status-warning))]"
            onClick={() => handleFiltersChange({ ...filters, paymentStatus: 'UNPAID' })}
          />
          <QuickStatCard
            icon={Wine}
            label="Alcohol Test Required"
            value={drivers.filter((d) => d.requires_alcohol_test).length.toString()}
            iconColor="text-[hsl(var(--payment-hold))]"
            onClick={() => handleFiltersChange({ ...filters, requiresAlcoholTest: true })}
          />
          <QuickStatCard
            icon={CheckCircle}
            label="RTD Complete"
            value={drivers.filter((d) => d.rtd_completed).length.toString()}
            iconColor="text-[hsl(var(--status-success))]"
            onClick={() => handleFiltersChange({ ...filters, status: 'rtd_complete' })}
          />
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <DriverFilters filters={filters} onFiltersChange={handleFiltersChange} />
            <div className="mt-4 flex items-center space-x-2">
              <Switch
                id="show-hidden"
                checked={filters.showHidden ?? false}
                onCheckedChange={(checked) =>
                  handleFiltersChange({ ...filters, showHidden: checked })
                }
              />
              <Label htmlFor="show-hidden" className="text-sm text-muted-foreground cursor-pointer">
                Show Hidden Drivers
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-destructive bg-card p-6">
            <p className="text-sm text-destructive">
              Failed to load drivers: {error.message}
            </p>
          </div>
        )}

        {/* Drivers Table */}
        <DriversTable
          drivers={drivers}
          isLoading={isLoading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          sort={sort}
          onSortChange={setSort}
        />

        {/* Pagination */}
        {!isLoading && totalDrivers > 0 && (
          <DriversPagination
            currentPage={page}
            totalPages={totalPages}
            totalCount={totalDrivers}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedDrivers.length > 0 && (
        <BulkActionsBar
          selectedDrivers={selectedDrivers}
          onClearSelection={handleClearSelection}
        />
      )}

      {/* Driver Detail Panel */}
      <DriverDetailPanel
        driverId={selectedDriver?.id ?? null}
        open={detailPanelOpen}
        onOpenChange={setDetailPanelOpen}
      />

      {/* Add/Edit Driver Dialog */}
      <DriverFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        driver={editingDriver}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteDriverDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        driver={deletingDriver}
      />
    </AppLayout>
  );
}

interface QuickStatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  iconColor?: string;
  onClick?: () => void;
}

function QuickStatCard({ icon: Icon, label, value, iconColor, onClick }: QuickStatCardProps) {
  const isClickable = !!onClick;
  return (
    <Card
      className={isClickable ? 'cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring' : undefined}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div className={`rounded-lg bg-muted p-2 ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}