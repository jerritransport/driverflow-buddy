import { cn } from '@/lib/utils';
import { DRIVER_STEPS } from '@/lib/constants';

interface StepProgressProps {
  currentStep: number;
  className?: string;
  /** Show labels under dots (compact view shows none) */
  showLabels?: boolean;
}

/**
 * Compact horizontal step indicator (1 → 7) for cards & rows.
 */
export function StepProgress({ currentStep, className, showLabels = false }: StepProgressProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {DRIVER_STEPS.map((s, i) => {
        const isComplete = currentStep > s.step;
        const isCurrent = currentStep === s.step;
        return (
          <div key={s.step} className="flex items-center gap-1">
            <div
              className={cn(
                'h-1.5 w-1.5 rounded-full transition-colors',
                isComplete && 'bg-[hsl(var(--status-success))]',
                isCurrent && 'h-2 w-2 bg-primary ring-2 ring-primary/30',
                !isComplete && !isCurrent && 'bg-muted',
              )}
              title={`Step ${s.step}: ${s.label}`}
            />
            {i < DRIVER_STEPS.length - 1 && (
              <div
                className={cn(
                  'h-px w-2 transition-colors',
                  isComplete ? 'bg-[hsl(var(--status-success))]' : 'bg-muted',
                )}
              />
            )}
          </div>
        );
      })}
      {showLabels && (
        <span className="ml-2 text-xs text-muted-foreground">
          Step {currentStep}/7
        </span>
      )}
    </div>
  );
}
