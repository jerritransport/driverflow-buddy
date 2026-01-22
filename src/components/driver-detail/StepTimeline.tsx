import { DRIVER_STEPS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepTimelineProps {
  currentStep: number;
  status: string;
}

export function StepTimeline({ currentStep, status }: StepTimelineProps) {
  return (
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
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all',
                    isCompleted && 'border-[hsl(var(--status-success))] bg-[hsl(var(--status-success))] text-white',
                    isCurrent && 'border-primary bg-primary text-primary-foreground ring-4 ring-primary/20',
                    isUpcoming && 'border-muted-foreground/30 bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : step.step}
                </div>
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
  );
}
