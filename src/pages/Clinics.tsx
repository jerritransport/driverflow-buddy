import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ClinicListView, ClinicDetailPanel, ClinicFormDialog } from '@/components/clinic';
import { ClinicPerformance, useClinic, Clinic } from '@/hooks/useClinics';
import { Building2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Clinics() {
  const [selectedClinic, setSelectedClinic] = useState<ClinicPerformance | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingClinicId, setEditingClinicId] = useState<string | null>(null);
  
  const { data: editingClinicData } = useClinic(editingClinicId ?? undefined);

  const handleAddNew = () => {
    setEditingClinicId(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (clinicId: string) => {
    setEditingClinicId(clinicId);
    setFormDialogOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <Building2 className="h-6 w-6" />
              Clinics
            </h1>
            <p className="text-muted-foreground">
              Manage test clinics, view performance metrics, and track observer availability.
            </p>
          </div>
          <Button onClick={handleAddNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Clinic
          </Button>
        </div>

        <ClinicListView 
          onSelectClinic={setSelectedClinic} 
          onEditClinic={handleEdit}
        />

        <ClinicDetailPanel
          clinicPerformance={selectedClinic}
          open={!!selectedClinic}
          onClose={() => setSelectedClinic(null)}
        />

        <ClinicFormDialog
          open={formDialogOpen}
          onOpenChange={setFormDialogOpen}
          clinic={editingClinicData}
        />
      </div>
    </AppLayout>
  );
}
