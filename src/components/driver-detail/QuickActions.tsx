import { useState } from 'react';
import { Driver } from '@/hooks/useDrivers';
import { useAdvanceDriverStep, useUpdateDriver } from '@/hooks/useDriverDetails';
import { Button } from '@/components/ui/button';
import { DRIVER_STEPS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { RecordPaymentDialog } from './RecordPaymentDialog';
import { GenerateDonorPassDialog } from './GenerateDonorPassDialog';
import { 
  ChevronRight, 
  Loader2, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign, 
  FileText,
  Ban,
  CheckCircle2
} from 'lucide-react';

interface QuickActionsProps {
  driver: Driver;
  onSuccess?: () => void;
}

export function QuickActions({ driver, onSuccess }: QuickActionsProps) {
  const { toast } = useToast();
  const advanceStep = useAdvanceDriverStep();
  const updateDriver = useUpdateDriver();
  
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [donorPassDialogOpen, setDonorPassDialogOpen] = useState(false);

  const currentStepInfo = DRIVER_STEPS.find(s => s.step === driver.current_step);
  const nextStepInfo = DRIVER_STEPS.find(s => s.step === driver.current_step + 1);

  const canAdvance = driver.current_step < 7 && !driver.payment_hold;
  const isComplete = driver.current_step === 7 || driver.rtd_completed;
  const canGenerateDonorPass = driver.current_step >= 4 && !driver.donor_pass_number;
  const hasBalance = (driver.amount_due ?? 0) > (driver.amount_paid ?? 0);

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

  const handleTogglePaymentHold = async () => {
    try {
      await updateDriver.mutateAsync({
        driverId: driver.id,
        updates: { payment_hold: !driver.payment_hold },
      });

      toast({
        title: driver.payment_hold ? 'Payment Hold Removed' : 'Payment Hold Applied',
        description: driver.payment_hold 
          ? 'Driver can now proceed with the workflow'
          : 'Driver workflow is paused until hold is cleared',
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update payment hold status',
        variant: 'destructive',
      });
    }
  };

  if (isComplete) {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-lg bg-[hsl(var(--status-success))]/10 p-3">
        <CheckCircle className="h-5 w-5 text-[hsl(var(--status-success))]" />
        <div>
          <p className="text-sm font-medium text-[hsl(var(--status-success))]">RTD Complete</p>
          <p className="text-xs text-muted-foreground">This driver has completed the RTD process</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {/* Payment Hold Warning */}
      {driver.payment_hold && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">Payment Hold</p>
            <p className="text-xs text-muted-foreground">
              Clear payment hold before advancing to next step
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTogglePaymentHold}
            disabled={updateDriver.isPending}
            className="shrink-0"
          >
            {updateDriver.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="mr-1 h-4 w-4" />
                Clear Hold
              </>
            )}
          </Button>
        </div>
      )}

      {/* Primary Actions Row */}
      <div className="flex gap-2">
        {/* Record Payment */}
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5"
          onClick={() => setPaymentDialogOpen(true)}
        >
          <DollarSign className="h-4 w-4" />
          <span className="hidden sm:inline">Record</span> Payment
          {hasBalance && (
            <span className="ml-1 rounded bg-[hsl(var(--status-warning))]/20 px-1.5 py-0.5 text-[10px] font-medium text-[hsl(var(--status-warning))]">
              ${((driver.amount_due ?? 0) - (driver.amount_paid ?? 0)).toFixed(0)} due
            </span>
          )}
        </Button>

        {/* Generate/View Donor Pass */}
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5"
          onClick={() => setDonorPassDialogOpen(true)}
          disabled={driver.current_step < 4}
        >
          <FileText className="h-4 w-4" />
          {driver.donor_pass_number ? 'View' : 'Generate'} Pass
          {driver.donor_pass_number && (
            <CheckCircle className="ml-1 h-3 w-3 text-[hsl(var(--status-success))]" />
          )}
        </Button>

        {/* Toggle Payment Hold (if not already on hold) */}
        {!driver.payment_hold && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleTogglePaymentHold}
            disabled={updateDriver.isPending}
            className="px-2"
            title="Apply Payment Hold"
          >
            {updateDriver.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Ban className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        )}
      </div>

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
      {currentStepInfo && currentStepInfo.statuses.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {currentStepInfo.statuses.slice(1).map((status) => (
            <Button
              key={status}
              variant="outline"
              size="sm"
              className="flex-1 min-w-[100px] text-xs"
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
      )}

      {/* Dialogs */}
      <RecordPaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        driver={driver}
      />

      <GenerateDonorPassDialog
        open={donorPassDialogOpen}
        onOpenChange={setDonorPassDialogOpen}
        driver={driver}
      />
    </div>
  );
}
