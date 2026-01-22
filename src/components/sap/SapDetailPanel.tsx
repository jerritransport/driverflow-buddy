import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSap, useSapDrivers } from '@/hooks/useSaps';
import { SapInfoTab } from './SapInfoTab';
import { SapDriversTab } from './SapDriversTab';
import { SapMetricsCard } from './SapMetricsCard';
import { Stethoscope, User, Users, BarChart3 } from 'lucide-react';

interface SapDetailPanelProps {
  sapId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SapDetailPanel({ sapId, open, onOpenChange }: SapDetailPanelProps) {
  const { data: sap, isLoading: sapLoading } = useSap(sapId ?? undefined);
  const { data: drivers, isLoading: driversLoading } = useSapDrivers(sapId ?? undefined);

  if (!sapId) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        {sapLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : sap ? (
          <>
            <SheetHeader className="space-y-3 pb-4">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Stethoscope className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <SheetTitle className="text-xl">
                    {sap.first_name} {sap.last_name}
                  </SheetTitle>
                  <p className="text-sm text-muted-foreground">
                    {sap.organization || 'Independent SAP'}
                  </p>
                </div>
                <Badge variant={sap.is_active ? 'default' : 'secondary'}>
                  {sap.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </SheetHeader>

            <SapMetricsCard sap={sap} driversCount={drivers?.length ?? 0} />

            <Tabs defaultValue="info" className="mt-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info" className="gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Info
                </TabsTrigger>
                <TabsTrigger value="drivers" className="gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  Drivers
                </TabsTrigger>
                <TabsTrigger value="metrics" className="gap-1.5">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Metrics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="mt-4">
                <SapInfoTab sap={sap} />
              </TabsContent>

              <TabsContent value="drivers" className="mt-4">
                <SapDriversTab 
                  drivers={drivers ?? []} 
                  isLoading={driversLoading} 
                />
              </TabsContent>

              <TabsContent value="metrics" className="mt-4">
                <SapMetricsTab sap={sap} drivers={drivers ?? []} />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">SAP not found</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function SapMetricsTab({ sap, drivers }: { sap: any; drivers: any[] }) {
  const completedDrivers = drivers.filter(d => d.current_step === 7).length;
  const paperworkReceived = drivers.filter(d => d.sap_paperwork_received_at).length;
  const alcoholTestDrivers = drivers.filter(d => d.status?.includes('ALCOHOL')).length;

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        <MetricRow 
          label="Total Drivers Referred" 
          value={sap.total_drivers_referred?.toString() ?? '0'} 
        />
        <MetricRow 
          label="Currently Assigned" 
          value={drivers.length.toString()} 
        />
        <MetricRow 
          label="Paperwork Received" 
          value={paperworkReceived.toString()} 
          subtext={drivers.length > 0 ? `${Math.round((paperworkReceived / drivers.length) * 100)}%` : '0%'}
        />
        <MetricRow 
          label="RTD Completed" 
          value={completedDrivers.toString()} 
          subtext={drivers.length > 0 ? `${Math.round((completedDrivers / drivers.length) * 100)}%` : '0%'}
        />
        <MetricRow 
          label="Alcohol Testing Required" 
          value={alcoholTestDrivers.toString()} 
        />
      </div>
    </div>
  );
}

function MetricRow({ label, value, subtext }: { label: string; value: string; subtext?: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="text-right">
        <span className="font-semibold">{value}</span>
        {subtext && <span className="ml-2 text-xs text-muted-foreground">({subtext})</span>}
      </div>
    </div>
  );
}
