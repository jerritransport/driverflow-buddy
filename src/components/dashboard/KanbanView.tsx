import { useDriversByStep, Driver } from '@/hooks/useDrivers';
import { useDriverNotesCount } from '@/hooks/useDriverNotes';
import { useAdvanceDriverStep } from '@/hooks/useDriverDetails';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { PaymentBadge } from '@/components/shared/PaymentBadge';
import { DocumentProgress } from '@/components/shared/DocumentProgress';
import { DRIVER_STEPS } from '@/lib/constants';
import { formatDistanceToNow, isToday, isPast, format } from 'date-fns';
import { AlertTriangle, Wine, MessageSquare, Calendar } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface KanbanViewProps {
  onDriverSelect?: (driverId: string) => void;
}

export function KanbanView({ onDriverSelect }: KanbanViewProps) {
  const { data: driversByStep, isLoading, error } = useDriversByStep();
  const advanceStep = useAdvanceDriverStep();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDragEnd = (result: DropResult) => {
    const { draggableId, destination, source } = result;
    if (!destination) return;

    const sourceStep = parseInt(source.droppableId);
    const destStep = parseInt(destination.droppableId);
    if (sourceStep === destStep) return;

    const stepConfig = DRIVER_STEPS.find(s => s.step === destStep);
    if (!stepConfig) return;

    const newStatus = stepConfig.statuses[0];

    // Optimistic update
    queryClient.setQueryData(['drivers-by-step'], (old: Record<number, Driver[]> | undefined) => {
      if (!old) return old;
      const updated = { ...old };
      const sourceDrivers = [...(updated[sourceStep] || [])];
      const destDrivers = [...(updated[destStep] || [])];
      const driverIndex = sourceDrivers.findIndex(d => d.id === draggableId);
      if (driverIndex === -1) return old;
      const [movedDriver] = sourceDrivers.splice(driverIndex, 1);
      const updatedDriver = { ...movedDriver, current_step: destStep, status: newStatus };
      destDrivers.splice(destination.index, 0, updatedDriver);
      updated[sourceStep] = sourceDrivers;
      updated[destStep] = destDrivers;
      return updated;
    });

    advanceStep.mutate(
      { driverId: draggableId, newStep: destStep, newStatus },
      {
        onSuccess: () => {
          toast({ title: 'Driver Moved', description: `Moved to ${stepConfig.label}` });
        },
        onError: () => {
          queryClient.invalidateQueries({ queryKey: ['drivers-by-step'] });
          toast({ title: 'Error', description: 'Failed to move driver', variant: 'destructive' });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 md:flex-row md:overflow-x-auto md:pb-4">
        {DRIVER_STEPS.map((step) => (
          <div key={step.step} className="w-full shrink-0 md:w-72">
            <Card className="h-auto md:h-[calc(100vh-300px)]">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-card p-6">
        <p className="text-sm text-destructive">Failed to load drivers: {error.message}</p>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-4 md:flex-row md:overflow-x-auto md:pb-4 md:snap-x md:snap-mandatory">
        {DRIVER_STEPS.map((step) => {
          const drivers = driversByStep?.[step.step] || [];
          return (
            <KanbanColumn
              key={step.step}
              step={step.step}
              label={step.label}
              drivers={drivers}
              onDriverClick={(id) => onDriverSelect?.(id)}
            />
          );
        })}
      </div>
    </DragDropContext>
  );
}

interface KanbanColumnProps {
  step: number;
  label: string;
  drivers: Driver[];
  onDriverClick: (id: string) => void;
}

function KanbanColumn({ step, label, drivers, onDriverClick }: KanbanColumnProps) {
  const columnColors: Record<number, string> = {
    1: 'border-t-[hsl(var(--status-info))]',
    2: 'border-t-[hsl(var(--payment-deposit))]',
    3: 'border-t-[hsl(var(--status-warning))]',
    4: 'border-t-[hsl(var(--status-info))]',
    5: 'border-t-[hsl(var(--status-warning))]',
    6: 'border-t-[hsl(var(--status-info))]',
    7: 'border-t-[hsl(var(--status-success))]',
  };

  return (
    <div className="w-full shrink-0 md:w-72 md:snap-start">
      <Card className={`h-auto md:h-[calc(100vh-300px)] border-t-4 ${columnColors[step] || ''}`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm font-medium">
            <span className="truncate">{label}</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs">
              {drivers.length}
            </span>
          </CardTitle>
        </CardHeader>
        <Droppable droppableId={String(step)}>
          {(provided, snapshot) => (
            <ScrollArea className="h-auto max-h-[300px] md:h-[calc(100%-60px)] md:max-h-none">
              <CardContent
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`space-y-2 pb-4 min-h-[60px] transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5 rounded-lg' : ''}`}
              >
                {drivers.length === 0 && !snapshot.isDraggingOver ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No drivers
                  </p>
                ) : (
                  drivers.map((driver, index) => (
                    <Draggable key={driver.id} draggableId={driver.id} index={index}>
                      {(dragProvided, dragSnapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                        >
                          <DriverCard
                            driver={driver}
                            onClick={() => onDriverClick(driver.id)}
                            isDragging={dragSnapshot.isDragging}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </CardContent>
            </ScrollArea>
          )}
        </Droppable>
      </Card>
    </div>
  );
}

interface DriverCardProps {
  driver: Driver;
  onClick: () => void;
  isDragging?: boolean;
}

function DriverCard({ driver, onClick, isDragging }: DriverCardProps) {
  const updatedAt = driver.updated_at
    ? formatDistanceToNow(new Date(driver.updated_at), { addSuffix: true })
    : 'Unknown';

  const hasFollowUp = !!driver.follow_up_date;
  const followUpOverdue = hasFollowUp && isPast(new Date(driver.follow_up_date!)) && !isToday(new Date(driver.follow_up_date!));
  const followUpToday = hasFollowUp && isToday(new Date(driver.follow_up_date!));

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-lg border bg-card p-3 shadow-sm transition-all hover:shadow-md hover:ring-1 hover:ring-primary/20 ${isDragging ? 'shadow-lg ring-2 ring-primary/30 rotate-1' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">
            {driver.first_name} {driver.last_name}
          </p>
          {driver.cdl_number && (
            <code className="text-xs text-muted-foreground">{driver.cdl_number}</code>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {driver.payment_hold && (
            <AlertTriangle className="h-4 w-4 text-[hsl(var(--status-danger))]" />
          )}
          {driver.requires_alcohol_test && (
            <Wine className="h-4 w-4 text-[hsl(var(--payment-hold))]" />
          )}
          {hasFollowUp && (
            <Calendar className={`h-4 w-4 ${followUpOverdue ? 'text-destructive' : followUpToday ? 'text-primary' : 'text-muted-foreground'}`} />
          )}
        </div>
      </div>
      
      {hasFollowUp && (
        <div className={`mt-1 text-xs ${followUpOverdue ? 'text-destructive' : followUpToday ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
          {followUpToday ? '📅 Follow-up today' : followUpOverdue ? `⚠️ Overdue: ${format(new Date(driver.follow_up_date!), 'MMM d')}` : `📅 ${format(new Date(driver.follow_up_date!), 'MMM d')}`}
        </div>
      )}
      
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PaymentBadge status={driver.payment_status} className="text-xs" />
          <DriverNotesCount driverId={driver.id} />
          <DocumentProgress documentsUploaded={driver.documents_uploaded} showTooltip={false} />
        </div>
        <span className="text-xs text-muted-foreground">{updatedAt}</span>
      </div>
    </div>
  );
}

function DriverNotesCount({ driverId }: { driverId: string }) {
  const { data: count } = useDriverNotesCount(driverId);
  
  if (!count || count === 0) return null;
  
  return (
    <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
      <MessageSquare className="h-3 w-3" />
      <span>{count}</span>
    </div>
  );
}
