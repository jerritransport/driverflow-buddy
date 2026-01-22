import { Driver } from '@/hooks/useDrivers';
import { useAdvanceDriverStep } from '@/hooks/useDriverDetails';
import { Button } from '@/components/ui/button';
import { DRIVER_STEPS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { ChevronRight, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

interface QuickActionsProps {
  driver: Driver;
  onSuccess?: () => void;
}

export function QuickActions({ driver, onSuccess }: QuickActionsProps) {
  const { toast } = useToast();
  const advanceStep = useAdvanceDriverStep();

  const currentStepInfo = DRIVER_STEPS.find(s => s.step === driver.current_step);
  const nextStepInfo = DRIVER_STEPS.find(s => s.step === driver.current_step + 1);

  const canAdvance = driver.current_step < 7 && !driver.payment_hold;
  const isComplete = driver.current_step === 7 || driver.rtd_completed;

  const handleAdvance = async () => {
    if (!nextStepInfo) return;

    const nextStatus = nextStepInfo.statuses[0];

    try {
      await advanceStep.mutateAsync({
        driverId: driver.id,
        newStep: nextStepInfo.step,
        newStatus: nextStatus,
      });

      toast({
        title: 'Step Advanced',
        description: `Driver moved to Step ${nextStepInfo.step}: ${nextStepInfo.label}`,
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to advance driver step',
        variant: 'destructive',
      });
    }
  };

  if (isComplete) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-[hsl(var(--status-success))]/10 p-3">
        <CheckCircle className="h-5 w-5 text-[hsl(var(--status-success))]" />
        <div>
          <p className="text-sm font-medium text-[hsl(var(--status-success))]">RTD Complete</p>
          <p className="text-xs text-muted-foreground">This driver has completed the RTD process</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Payment Hold Warning */}
      {driver.payment_hold && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <div>
            <p className="text-sm font-medium text-destructive">Payment Hold</p>
            <p className="text-xs text-muted-foreground">
              Clear payment hold before advancing to next step
            </p>
          </div>
        </div>
      )}

      {/* Advance to Next Step */}
      {canAdvance && nextStepInfo && (
        <Button
          onClick={handleAdvance}
          disabled={advanceStep.isPending}
          className="w-full justify-between"
          size="lg"
        >
          <span className="flex items-center gap-2">
            {advanceStep.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Advance to Step {nextStepInfo.step}
          </span>
          <span className="flex items-center gap-1 text-sm opacity-80">
            {nextStepInfo.label}
            <ChevronRight className="h-4 w-4" />
          </span>
        </Button>
      )}

      {/* Quick Status Actions based on current step */}
      <div className="flex gap-2">
        {currentStepInfo?.statuses.slice(1).map((status) => (
          <Button
            key={status}
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={async () => {
              try {
                await advanceStep.mutateAsync({
                  driverId: driver.id,
                  newStep: driver.current_step,
                  newStatus: status,
                });
                toast({
                  title: 'Status Updated',
                  description: `Status changed to ${status.replace(/_/g, ' ')}`,
                });
                onSuccess?.();
              } catch {
                toast({
                  title: 'Error',
                  description: 'Failed to update status',
                  variant: 'destructive',
                });
              }
            }}
            disabled={driver.status === status || advanceStep.isPending}
          >
            {status.replace(/_/g, ' ')}
          </Button>
        ))}
      </div>
    </div>
  );
}
