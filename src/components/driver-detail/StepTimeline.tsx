import { useState } from 'react';
import { DRIVER_STEPS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
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

interface StepTimelineProps {
  currentStep: number;
  status: string;
  onStepClick?: (step: number) => void;
}

export function StepTimeline({ currentStep, status, onStepClick }: StepTimelineProps) {
  const [confirmStep, setConfirmStep] = useState<number | null>(null);

  const handleStepClick = (step: number) => {
    if (!onStepClick) return;
    const isCompleted = step < currentStep;
    if (isCompleted) {
      // Completed step clicked — confirm undo
      setConfirmStep(step);
    }
  };

  const handleConfirmUndo = () => {
    if (confirmStep !== null && onStepClick) {
      onStepClick(confirmStep);
    }
    setConfirmStep(null);
  };

  const confirmStepInfo = confirmStep !== null
    ? DRIVER_STEPS.find(s => s.step === confirmStep)
    : null;

  return (
    <>
      <div className="py-4">
        <div className="flex items-center justify-between">
          {DRIVER_STEPS.map((step, index) => {
            const isCompleted = step.step < currentStep;
            const isCurrent = step.step === currentStep;
            const isUpcoming = step.step > currentStep;

            return (
              <div key={step.step} className="flex flex-1 items-center">
                {/* Step circle */}
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => handleStepClick(step.step)}
                    disabled={!onStepClick || !isCompleted}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all',
                      isCompleted && 'border-[hsl(var(--status-success))] bg-[hsl(var(--status-success))] text-white',
                      isCompleted && onStepClick && 'cursor-pointer hover:opacity-80 hover:ring-2 hover:ring-[hsl(var(--status-success))]/30',
                      isCurrent && 'border-primary bg-primary text-primary-foreground ring-4 ring-primary/20',
                      isUpcoming && 'border-muted-foreground/30 bg-muted text-muted-foreground',
                      (!onStepClick || !isCompleted) && 'cursor-default'
                    )}
                    title={isCompleted && onStepClick ? `Click to revert to ${step.label}` : undefined}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : step.step}
                  </button>
                  <span
                    className={cn(
                      'mt-2 text-[10px] font-medium whitespace-nowrap',
                      isCurrent && 'text-primary',
                      isCompleted && 'text-[hsl(var(--status-success))]',
                      isUpcoming && 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector line */}
                {index < DRIVER_STEPS.length - 1 && (
                  <div
                    className={cn(
                      'mx-1 h-0.5 flex-1',
                      step.step < currentStep && 'bg-[hsl(var(--status-success))]',
                      step.step >= currentStep && 'bg-muted-foreground/30'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Undo Confirmation Dialog */}
      <AlertDialog open={confirmStep !== null} onOpenChange={(open) => { if (!open) setConfirmStep(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revert to Step {confirmStep}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will move the driver back to <strong>{confirmStepInfo?.label}</strong> (Step {confirmStep}).
              All progress after this step will need to be re-completed. This action should only be used to correct mistakes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUndo} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Revert Step
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
