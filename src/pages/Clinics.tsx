import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ClinicListView, ClinicDetailPanel, ClinicFormDialog } from '@/components/clinic';
import { ClinicPerformance, useClinic, useClinics } from '@/hooks/useClinics';
import { Building2, Plus, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportClinicsToCSV } from '@/lib/exportUtils';
import { toast } from 'sonner';

export default function Clinics() {
  const [selectedClinic, setSelectedClinic] = useState<ClinicPerformance | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingClinicId, setEditingClinicId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const { data: editingClinicData } = useClinic(editingClinicId ?? undefined);
  const { data: allClinics, isFetching: isFetchingAll } = useClinics();

  const handleAddNew = () => {
    setEditingClinicId(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (clinicId: string) => {
    setEditingClinicId(clinicId);
    setFormDialogOpen(true);
  };

  const handleExport = () => {
    if (!allClinics || allClinics.length === 0) {
      toast.error('No clinics to export');
      return;
    }
    setIsExporting(true);
    try {
      exportClinicsToCSV(allClinics, 'clinics_export');
      toast.success(`Exported ${allClinics.length} clinic${allClinics.length === 1 ? '' : 's'} to CSV`);
    } catch (error) {
      toast.error('Failed to export clinics');
    } finally {
      setIsExporting(false);
    }
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
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleExport} 
              disabled={isExporting || isFetchingAll || !allClinics?.length}
              className="gap-2"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export
            </Button>
            <Button onClick={handleAddNew} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Clinic
            </Button>
          </div>
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
