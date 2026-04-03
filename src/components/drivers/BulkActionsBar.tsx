import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Driver } from '@/hooks/useDrivers';
import { useBulkUpdateDrivers } from '@/hooks/useBulkDriverActions';
import { exportDriversToCSV } from '@/lib/exportUtils';
import { DRIVER_STATUSES, WORKFLOW_STEPS } from '@/lib/constants';
import { 
  X, 
  Download, 
  ChevronDown, 
  Loader2,
  ListChecks,
  ArrowUpCircle,
  Ban,
  CheckCircle,
  EyeOff,
} from 'lucide-react';

interface BulkActionsBarProps {
  selectedDrivers: Driver[];
  onClearSelection: () => void;
}

export function BulkActionsBar({ selectedDrivers, onClearSelection }: BulkActionsBarProps) {
  const { mutate: bulkUpdate, isPending } = useBulkUpdateDrivers();
  const [hideConfirmOpen, setHideConfirmOpen] = useState(false);
  const selectedIds = selectedDrivers.map((d) => d.id);
  const count = selectedDrivers.length;

  const handleStatusUpdate = (status: string) => {
    bulkUpdate({ driverIds: selectedIds, updateData: { status } });
  };

  const handleStepUpdate = (step: number) => {
    bulkUpdate({ driverIds: selectedIds, updateData: { current_step: step } });
  };

  const handlePaymentHoldToggle = (paymentHold: boolean) => {
    bulkUpdate({ driverIds: selectedIds, updateData: { payment_hold: paymentHold } });
  };

  const handleHideDrivers = () => {
    bulkUpdate(
      { driverIds: selectedIds, updateData: { is_hidden: true } as any },
      { onSuccess: () => { setHideConfirmOpen(false); onClearSelection(); } }
    );
  };

  const handleExport = () => {
    exportDriversToCSV(selectedDrivers, 'selected_drivers');
  };

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-bottom-4 fade-in duration-200">
      <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-3 shadow-lg">
        {/* Selection Count */}
        <div className="flex items-center gap-2 pr-2 border-r">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            {count}
          </div>
          <span className="text-sm font-medium">selected</span>
        </div>

        {/* Status Update */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isPending} className="gap-1">
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ListChecks className="h-4 w-4" />
              )}
              Status
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {DRIVER_STATUSES.map((status) => (
              <DropdownMenuItem
                key={status.value}
                onClick={() => handleStatusUpdate(status.value)}
              >
                {status.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Step Update */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isPending} className="gap-1">
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUpCircle className="h-4 w-4" />
              )}
              Step
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuLabel>Set Step</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {WORKFLOW_STEPS.map((step) => (
              <DropdownMenuItem
                key={step.step}
                onClick={() => handleStepUpdate(step.step)}
              >
                <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs">
                  {step.step}
                </span>
                {step.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Payment Hold Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isPending} className="gap-1">
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Ban className="h-4 w-4" />
              )}
              Hold
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuLabel>Payment Hold</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handlePaymentHoldToggle(true)}>
              <Ban className="mr-2 h-4 w-4 text-destructive" />
              Set Payment Hold
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePaymentHoldToggle(false)}>
              <CheckCircle className="mr-2 h-4 w-4 text-[hsl(var(--status-success))]" />
              Remove Payment Hold
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Hide Drivers */}
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          className="gap-1 text-destructive hover:text-destructive"
          onClick={() => setHideConfirmOpen(true)}
        >
          <EyeOff className="h-4 w-4" />
          Hide
        </Button>

        {/* Export */}
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-1">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>

        {/* Clear Selection */}
        <Button variant="ghost" size="sm" onClick={onClearSelection} className="ml-2">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Hide Confirmation Dialog */}
      <AlertDialog open={hideConfirmOpen} onOpenChange={setHideConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hide {count} Driver{count !== 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to hide {count} driver{count !== 1 ? 's' : ''}? They will be removed from the active dashboard but their records will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleHideDrivers}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Hide Driver{count !== 1 ? 's' : ''}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
