import { useClinic, ClinicPerformance } from '@/hooks/useClinics';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building2, Info, Users, BarChart3, Star } from 'lucide-react';
import { ClinicInfoTab } from './ClinicInfoTab';
import { ClinicDriversTab } from './ClinicDriversTab';
import { ClinicMetricsCard } from './ClinicMetricsCard';

interface ClinicDetailPanelProps {
  clinicPerformance: ClinicPerformance | null;
  open: boolean;
  onClose: () => void;
}

export function ClinicDetailPanel({ clinicPerformance, open, onClose }: ClinicDetailPanelProps) {
  const { data: clinic, isLoading } = useClinic(clinicPerformance?.id || undefined);

  const renderRating = (rating: number | null) => {
    if (rating === null) return null;
    const stars = Math.round(rating);
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${
              i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        {isLoading || !clinic ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <SheetHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <SheetTitle className="text-lg">{clinic.name}</SheetTitle>
                  <p className="text-sm text-muted-foreground">
                    {clinic.city}, {clinic.state}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Badge variant={clinic.is_active ? 'default' : 'secondary'}>
                  {clinic.is_active ? 'Active' : 'Inactive'}
                </Badge>
                {clinic.offers_observed_collection && (
                  <Badge variant="outline">Observed Collection</Badge>
                )}
                {clinic.offers_alcohol_testing && (
                  <Badge variant="outline">Alcohol Testing</Badge>
                )}
                {clinicPerformance?.reliability_rating && renderRating(clinicPerformance.reliability_rating)}
              </div>
            </SheetHeader>

            <Tabs defaultValue="info" className="mt-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info" className="flex items-center gap-1">
                  <Info className="h-3.5 w-3.5" />
                  Info
                </TabsTrigger>
                <TabsTrigger value="drivers" className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  Drivers
                </TabsTrigger>
                <TabsTrigger value="metrics" className="flex items-center gap-1">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Metrics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="mt-4">
                <ClinicInfoTab clinic={clinic} />
              </TabsContent>

              <TabsContent value="drivers" className="mt-4">
                <ClinicDriversTab clinicId={clinic.id} />
              </TabsContent>

              <TabsContent value="metrics" className="mt-4">
                {clinicPerformance && <ClinicMetricsCard clinic={clinicPerformance} />}
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
