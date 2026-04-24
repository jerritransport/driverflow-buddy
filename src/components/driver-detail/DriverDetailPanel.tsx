import { useDriver } from '@/hooks/useDrivers';
import { useAdvanceDriverStep } from '@/hooks/useDriverDetails';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { StepTimeline } from './StepTimeline';
import { QuickActions } from './QuickActions';
import { PersonalInfoTab } from './PersonalInfoTab';
import { PaymentHistoryTab } from './PaymentHistoryTab';
import { DocumentsTab } from './DocumentsTab';
import { ActivityLogTab } from './ActivityLogTab';
import { NotesTab } from './NotesTab';
import { CommunicationActions } from './CommunicationActions';
import { PaymentBadge } from '@/components/shared/PaymentBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Phone, Mail, AlertTriangle, Wine, Calendar, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { format, isToday, isPast } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { DRIVER_STEPS } from '@/lib/constants';
import { formatDriverName } from '@/lib/utils';

interface DriverDetailPanelProps {
  driverId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DriverDetailPanel({ driverId, open, onOpenChange }: DriverDetailPanelProps) {
  const { data: driver, isLoading, error } = useDriver(driverId ?? undefined);
  const advanceStep = useAdvanceDriverStep();
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);

  const handleStepRevert = async (step: number) => {
    if (!driver) return;
    const stepInfo = DRIVER_STEPS.find(s => s.step === step);
    if (!stepInfo) return;
    try {
      await advanceStep.mutateAsync({
        driverId: driver.id,
        newStep: step,
        newStatus: stepInfo.statuses[0],
      });
      toast({
        title: 'Step Reverted',
        description: `Driver moved back to Step ${step}: ${stepInfo.label}`,
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to revert step',
        variant: 'destructive',
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className={cn(
          'w-full overflow-hidden p-0 transition-[max-width] duration-300',
          expanded ? 'sm:max-w-[95vw]' : 'sm:max-w-xl'
        )}
      >
        {isLoading ? (
          <PanelSkeleton />
        ) : error ? (
          <div className="flex h-full items-center justify-center p-6">
            <p className="text-sm text-destructive">Failed to load driver details</p>
          </div>
        ) : driver ? (
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="border-b bg-muted/30 p-6">
              <SheetHeader className="space-y-1">
                <div className="flex items-start justify-between">
                  <div>
                    <SheetTitle className="text-xl">
                      {formatDriverName(driver.first_name, driver.middle_name, driver.last_name)}
                    </SheetTitle>
                    <SheetDescription className="flex items-center gap-2 pt-1">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        {driver.cdl_number}
                      </code>
                      <span className="text-xs">{driver.cdl_state}</span>
                    </SheetDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    {driver.payment_hold && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Hold
                      </Badge>
                    )}
                    {driver.requires_alcohol_test && (
                      <Badge variant="secondary" className="gap-1">
                        <Wine className="h-3 w-3" />
                        Alcohol
                      </Badge>
                    )}
                  </div>
                </div>
              </SheetHeader>

              {/* Contact Quick Info */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <a
                  href={`mailto:${driver.email}`}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-primary"
                >
                  <Mail className="h-4 w-4" />
                  {driver.email}
                </a>
                <a
                  href={`tel:${driver.phone}`}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-primary"
                >
                  <Phone className="h-4 w-4" />
                  {driver.phone}
                </a>
              </div>

              {/* Status Badges */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <StatusBadge status={driver.status} />
                <PaymentBadge status={driver.payment_status} />
                {driver.follow_up_date && (
                  <Badge 
                    variant={isPast(new Date(driver.follow_up_date)) && !isToday(new Date(driver.follow_up_date)) 
                      ? "destructive" 
                      : isToday(new Date(driver.follow_up_date)) 
                        ? "default" 
                        : "secondary"
                    } 
                    className="gap-1"
                  >
                    <Calendar className="h-3 w-3" />
                    Follow-up: {format(new Date(driver.follow_up_date), 'MMM d')}
                  </Badge>
                )}
              </div>

              {/* Step Timeline */}
              <StepTimeline currentStep={driver.current_step} status={driver.status} onStepClick={handleStepRevert} />

              {/* Quick Actions */}
              <QuickActions driver={driver} />

              {/* Communication Actions */}
              <div className="mt-4 pt-4 border-t">
                <CommunicationActions driver={driver} />
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="info" className="flex flex-1 flex-col overflow-hidden">
              <TabsList className="mx-6 mt-4 grid w-auto grid-cols-5">
                <TabsTrigger value="info">Info</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
                <TabsTrigger value="documents">Docs</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 px-6 py-4">
                <TabsContent value="info" className="m-0">
                  <PersonalInfoTab driver={driver} />
                </TabsContent>

                <TabsContent value="notes" className="m-0">
                  <NotesTab driverId={driver.id} />
                </TabsContent>

                <TabsContent value="payments" className="m-0">
                  <PaymentHistoryTab driverId={driver.id} />
                </TabsContent>

                <TabsContent value="documents" className="m-0">
                  <DocumentsTab driverId={driver.id} />
                </TabsContent>

                <TabsContent value="activity" className="m-0">
                  <ActivityLogTab driverId={driver.id} />
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function PanelSkeleton() {
  return (
    <div className="p-6">
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-24 w-full" />
        <div className="space-y-2 pt-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
      </div>
    </div>
  );
}
