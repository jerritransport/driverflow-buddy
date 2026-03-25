import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { ViewToggle, ViewMode } from '@/components/dashboard/ViewToggle';
import { TableView } from '@/components/dashboard/TableView';
import { KanbanView } from '@/components/dashboard/KanbanView';
import { QuickStatsPanel } from '@/components/dashboard/QuickStatsPanel';
import { RevenueOutstandingPanel } from '@/components/dashboard/RevenueOutstandingPanel';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
import { DriverDetailPanel } from '@/components/driver-detail';
import { DateRange } from 'react-day-picker';
import { ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const navigate = useNavigate();

  const handleDriverSelect = (driverId: string) => {
    setSelectedDriverId(driverId);
  };

  const handlePanelClose = () => {
    setSelectedDriverId(null);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Return-to-Duty driver pipeline overview
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
            <ViewToggle value={viewMode} onChange={setViewMode} />
          </div>
        </div>

        {/* Summary Cards (4 cards, no Revenue/Outstanding) */}
        <SummaryCards dateRange={dateRange} />

        {/* Driver Pipeline with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Driver Pipeline</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/drivers')}
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1 transition-colors"
                >
                  View All
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <div className="sm:hidden">
                  <ViewToggle value={viewMode} onChange={setViewMode} />
                </div>
              </div>
            </div>
            {viewMode === 'table' ? (
              <TableView onDriverSelect={handleDriverSelect} dateRange={dateRange} />
            ) : (
              <KanbanView onDriverSelect={handleDriverSelect} dateRange={dateRange} />
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block lg:w-64 shrink-0 space-y-4">
            <QuickStatsPanel />
            <RevenueOutstandingPanel dateRange={dateRange} />
          </div>
        </div>
      </div>

      {/* Driver Detail Panel */}
      <DriverDetailPanel
        driverId={selectedDriverId}
        open={!!selectedDriverId}
        onOpenChange={(open) => {
          if (!open) handlePanelClose();
        }}
      />
    </AppLayout>
  );
}
