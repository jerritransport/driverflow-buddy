import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ClinicListView, ClinicDetailPanel } from '@/components/clinic';
import { ClinicPerformance } from '@/hooks/useClinics';
import { Building2 } from 'lucide-react';

export default function Clinics() {
  const [selectedClinic, setSelectedClinic] = useState<ClinicPerformance | null>(null);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Building2 className="h-6 w-6" />
            Clinics
          </h1>
          <p className="text-muted-foreground">
            Manage test clinics, view performance metrics, and track observer availability.
          </p>
        </div>

        <ClinicListView onSelectClinic={setSelectedClinic} />

        <ClinicDetailPanel
          clinicPerformance={selectedClinic}
          open={!!selectedClinic}
          onClose={() => setSelectedClinic(null)}
        />
      </div>
    </AppLayout>
  );
}
