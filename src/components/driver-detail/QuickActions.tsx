import { useState } from 'react';
import { Driver } from '@/hooks/useDrivers';
import { useAdvanceDriverStep, useUpdateDriver } from '@/hooks/useDriverDetails';
import { Button } from '@/components/ui/button';
import { DRIVER_STEPS, BASE_PRICE, ALCOHOL_TEST_FEE, STATUS_LABELS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { RecordPaymentDialog } from './RecordPaymentDialog';
import { GenerateDonorPassDialog } from './GenerateDonorPassDialog';
import { SetFollowUpDialog } from './SetFollowUpDialog';
import { SendAlcoholPaymentDialog } from './SendAlcoholPaymentDialog';
import { DeleteDriverDialog } from '@/components/drivers/DeleteDriverDialog';
import { 
  ChevronRight, 
  Loader2, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign, 
  FileText,
  Ban,
  CheckCircle2,
  Calendar,
  Wine,
  Trophy,
  EyeOff,
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
  const [followUpDialogOpen, setFollowUpDialogOpen] = useState(false);
  const [alcoholPaymentDialogOpen, setAlcoholPaymentDialogOpen] = useState(false);
  const [hideDialogOpen, setHideDialogOpen] = useState(false);

  const currentStepInfo = DRIVER_STEPS.find(s => s.step === driver.current_step);
  const nextStepInfo = DRIVER_STEPS.find(s => s.step === driver.current_step + 1);

  const canAdvance = driver.current_step < 7 && !driver.payment_hold;
  const isComplete = driver.current_step === 7 || driver.rtd_completed;
  const canGenerateDonorPass = driver.current_step >= 4 && !driver.donor_pass_number;
  const hasBalance = (driver.amount_due ?? 0) > (driver.amount_paid ?? 0);
  const showAlcoholPaymentButton = driver.requires_alcohol_test && driver.current_step === 3;

  // Pricing
  const totalPrice = driver.requires_alcohol_test ? BASE_PRICE + ALCOHOL_TEST_FEE : BASE_PRICE;

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

  const handleSetStatus = async (status: string) => {
    try {
      await advanceStep.mutateAsync({
        driverId: driver.id,
        newStep: driver.current_step,
        newStatus: status,
      });
      toast({
        title: 'Status Updated',
        description: `Status changed to ${STATUS_LABELS[status] || status}`,
      });
      onSuccess?.();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  // Feature 8: Completion state
  if (isComplete) {
    return (
      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-3 rounded-lg bg-[hsl(var(--status-success))]/10 p-4">
          <Trophy className="h-6 w-6 text-[hsl(var(--status-success))]" />
          <div>
            <p className="text-sm font-semibold text-[hsl(var(--status-success))]">🎉 RTD Complete!</p>
            <p className="text-xs text-muted-foreground">
              Congratulations — {driver.first_name} {driver.last_name} has completed the Return-to-Duty process.
            </p>
          </div>
        </div>
        {/* Price display */}
        <div className="rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Price</span>
            <span className="text-lg font-bold">${totalPrice}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {/* Price Display */}
      <div className="rounded-lg border bg-muted/30 p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Price</span>
          <span className="text-lg font-bold">${totalPrice}</span>
        </div>
        {driver.requires_alcohol_test && (
          <p className="text-xs text-muted-foreground mt-1">
            Base: ${BASE_PRICE} + Alcohol Test: ${ALCOHOL_TEST_FEE}
          </p>
        )}
      </div>

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

      {/* Alcohol Test Payment Alert */}
      {showAlcoholPaymentButton && (
        <div className="flex items-center gap-2 rounded-lg bg-[hsl(var(--status-warning))]/10 p-3">
          <Wine className="h-5 w-5 text-[hsl(var(--status-warning))]" />
          <div className="flex-1">
            <p className="text-sm font-medium text-[hsl(var(--status-warning))]">Alcohol Test Required</p>
            <p className="text-xs text-muted-foreground">
              SAP has indicated this driver needs an alcohol test
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAlcoholPaymentDialogOpen(true)}
            className="shrink-0 border-[hsl(var(--status-warning))] text-[hsl(var(--status-warning))] hover:bg-[hsl(var(--status-warning))]/10"
          >
            <DollarSign className="mr-1 h-4 w-4" />
            Send Payment Link
          </Button>
        </div>
      )}

      {/* Feature 7: SAP Paperwork Step Action Buttons */}
      {driver.current_step === 3 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 min-w-[120px] text-xs"
            onClick={() => handleSetStatus('SAP_PAPERWORK_PENDING')}
            disabled={driver.status === 'SAP_PAPERWORK_PENDING' || advanceStep.isPending}
          >
            Paperwork Pending
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 min-w-[120px] text-xs"
            onClick={() => handleSetStatus('ALCOHOL_FEE_PENDING')}
            disabled={driver.status === 'ALCOHOL_FEE_PENDING' || advanceStep.isPending}
          >
            Alcohol Fee Pending
          </Button>
          <Button
            size="sm"
            className="flex-1 min-w-[120px] text-xs bg-[hsl(var(--status-success))] hover:bg-[hsl(var(--status-success))]/90 text-white"
            onClick={() => handleSetStatus('SAP_PAPERWORK_RECEIVED')}
            disabled={driver.status === 'SAP_PAPERWORK_RECEIVED' || advanceStep.isPending}
          >
            <CheckCircle className="mr-1 h-3 w-3" />
            Paperwork Received
          </Button>
        </div>
      )}

      {/* Step 5: Donor Pass Action Buttons */}
      {driver.current_step === 5 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 min-w-[120px] text-xs"
            onClick={() => handleSetStatus('DONOR_PASS_PENDING')}
            disabled={driver.status === 'DONOR_PASS_PENDING' || advanceStep.isPending}
          >
            Donor Pass Pending
          </Button>
          <Button
            size="sm"
            className="flex-1 min-w-[120px] text-xs bg-[hsl(var(--status-success))] hover:bg-[hsl(var(--status-success))]/90 text-white"
            onClick={() => handleSetStatus('DONOR_PASS_SENT')}
            disabled={driver.status === 'DONOR_PASS_SENT' || advanceStep.isPending}
          >
            <CheckCircle className="mr-1 h-3 w-3" />
            Donor Pass Sent
          </Button>
        </div>
      )}

      {/* Feature 8: Donor Pass / Results Step Action Buttons */}
      {driver.current_step === 6 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 min-w-[120px] text-xs"
            onClick={() => handleSetStatus('RESULTS_PENDING')}
            disabled={driver.status === 'RESULTS_PENDING' || advanceStep.isPending}
          >
            Pending Results
          </Button>
          <Button
            size="sm"
            className="flex-1 min-w-[120px] text-xs bg-[hsl(var(--status-success))] hover:bg-[hsl(var(--status-success))]/90 text-white"
            onClick={async () => {
              try {
                await advanceStep.mutateAsync({
                  driverId: driver.id,
                  newStep: 7,
                  newStatus: 'RTD_COMPLETE',
                });
                toast({
                  title: 'Results Received',
                  description: 'Driver has been moved to completion!',
                });
                onSuccess?.();
              } catch {
                toast({ title: 'Error', description: 'Failed to update', variant: 'destructive' });
              }
            }}
            disabled={advanceStep.isPending}
          >
            <CheckCircle className="mr-1 h-3 w-3" />
            Results Received
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

        {/* Set Follow-up */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFollowUpDialogOpen(true)}
          className="px-2"
          title={driver.follow_up_date ? 'Edit Follow-up' : 'Set Follow-up'}
        >
          <Calendar className={`h-4 w-4 ${driver.follow_up_date ? 'text-primary' : 'text-muted-foreground'}`} />
        </Button>
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

      <SetFollowUpDialog
        open={followUpDialogOpen}
        onOpenChange={setFollowUpDialogOpen}
        driver={driver}
        onSuccess={onSuccess}
      />

      <SendAlcoholPaymentDialog
        open={alcoholPaymentDialogOpen}
        onOpenChange={setAlcoholPaymentDialogOpen}
        driver={driver}
        onSuccess={onSuccess}
      />

      <DeleteDriverDialog
        open={hideDialogOpen}
        onOpenChange={setHideDialogOpen}
        driver={driver}
        onSuccess={onSuccess}
      />

      {/* Hide Driver */}
      <Button
        variant="outline"
        size="sm"
        className="w-full gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
        onClick={() => setHideDialogOpen(true)}
      >
        <EyeOff className="h-4 w-4" />
        Hide Driver
      </Button>
    </div>
  );
}
