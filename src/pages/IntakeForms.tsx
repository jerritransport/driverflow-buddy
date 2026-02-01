import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { IntakeFormStats } from '@/components/intake-forms/IntakeFormStats';
import { IntakeFormTable } from '@/components/intake-forms/IntakeFormTable';
import { DriverDetailPanel } from '@/components/driver-detail';
import { FileText } from 'lucide-react';

export default function IntakeForms() {
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <FileText className="h-6 w-6" />
            Intake Forms
          </h1>
          <p className="text-muted-foreground">
            Track BOLO form submissions and intake statistics
          </p>
        </div>

        {/* Statistics Cards */}
        <IntakeFormStats />

        {/* Forms Table */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Recent Submissions</h2>
          <IntakeFormTable onViewDriver={setSelectedDriverId} />
        </div>
      </div>

      {/* Driver Detail Panel */}
      <DriverDetailPanel
        driverId={selectedDriverId}
        open={!!selectedDriverId}
        onOpenChange={(open) => {
          if (!open) setSelectedDriverId(null);
        }}
      />
    </AppLayout>
  );
}
