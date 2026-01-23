import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { SapListView, SapDetailPanel, SapFormDialog } from '@/components/sap';
import { useSapPerformance, useSap, Sap, useSaps } from '@/hooks/useSaps';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Users, TrendingUp, CheckCircle2, Download, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { exportSapsToCSV } from '@/lib/exportUtils';
import { toast } from 'sonner';

export default function Saps() {
  const [selectedSapId, setSelectedSapId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingSap, setEditingSap] = useState<Sap | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const { data: saps, isLoading } = useSapPerformance();
  const { data: allSaps, isFetching: isFetchingAll } = useSaps();
  const { data: selectedSapData } = useSap(editingSap?.id);

  const filteredSaps = saps?.filter((sap) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      sap.first_name?.toLowerCase().includes(query) ||
      sap.last_name?.toLowerCase().includes(query) ||
      sap.email?.toLowerCase().includes(query) ||
      sap.organization?.toLowerCase().includes(query)
    );
  });

  // Calculate summary stats
  const totalSaps = saps?.length ?? 0;
  const activeSaps = saps?.filter(s => s.is_active).length ?? 0;
  const totalDriversAssigned = saps?.reduce((sum, s) => sum + (s.total_drivers_assigned ?? 0), 0) ?? 0;
  const totalCompleted = saps?.reduce((sum, s) => sum + (s.rtd_completed_count ?? 0), 0) ?? 0;

  const handleAddNew = () => {
    setEditingSap(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (sapId: string) => {
    // We need to fetch the full SAP data for editing
    setEditingSap({ id: sapId } as Sap);
    setFormDialogOpen(true);
  };

  const handleExport = () => {
    if (!allSaps || allSaps.length === 0) {
      toast.error('No SAPs to export');
      return;
    }
    setIsExporting(true);
    try {
      exportSapsToCSV(allSaps, 'saps_export');
      toast.success(`Exported ${allSaps.length} SAP${allSaps.length === 1 ? '' : 's'} to CSV`);
    } catch (error) {
      toast.error('Failed to export SAPs');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">SAP Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage Substance Abuse Professionals and track performance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleExport} 
              disabled={isExporting || isFetchingAll || !allSaps?.length}
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
              Add SAP
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            icon={Users}
            label="Total SAPs"
            value={totalSaps}
            subtext={`${activeSaps} active`}
          />
          <SummaryCard
            icon={Users}
            label="Drivers Assigned"
            value={totalDriversAssigned}
          />
          <SummaryCard
            icon={CheckCircle2}
            label="RTD Completed"
            value={totalCompleted}
          />
          <SummaryCard
            icon={TrendingUp}
            label="Avg Completion Rate"
            value={totalDriversAssigned > 0 
              ? `${Math.round((totalCompleted / totalDriversAssigned) * 100)}%`
              : '0%'
            }
          />
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search SAPs by name, email, or organization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* SAP List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <SapListView
            saps={filteredSaps ?? []}
            onSelectSap={setSelectedSapId}
            onEditSap={handleEdit}
          />
        )}

        {/* Detail Panel */}
        <SapDetailPanel
          sapId={selectedSapId}
          open={!!selectedSapId}
          onOpenChange={(open) => !open && setSelectedSapId(null)}
        />

        {/* Add/Edit SAP Dialog */}
        <SapFormDialog
          open={formDialogOpen}
          onOpenChange={setFormDialogOpen}
          sap={selectedSapData}
        />
      </div>
    </AppLayout>
  );
}

interface SummaryCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  subtext?: string;
}

function SummaryCard({ icon: Icon, label, value, subtext }: SummaryCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">
            {label}
            {subtext && <span className="ml-1">({subtext})</span>}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
