import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { ViewToggle, ViewMode } from '@/components/dashboard/ViewToggle';
import { TableView } from '@/components/dashboard/TableView';
import { KanbanView } from '@/components/dashboard/KanbanView';
import { DriverDetailPanel } from '@/components/driver-detail';

export default function Dashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

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
          <ViewToggle value={viewMode} onChange={setViewMode} />
        </div>

        {/* Summary Cards */}
        <SummaryCards />

        {/* Driver Pipeline */}
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Driver Pipeline</h2>
            <div className="sm:hidden">
              <ViewToggle value={viewMode} onChange={setViewMode} />
            </div>
          </div>
          {viewMode === 'table' ? (
            <TableView onDriverSelect={handleDriverSelect} />
          ) : (
            <KanbanView onDriverSelect={handleDriverSelect} />
          )}
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
