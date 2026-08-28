import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, Merge } from 'lucide-react';
import { SapPerformance, useMergeSaps } from '@/hooks/useSaps';
import { toProperCase, formatEmailDisplay } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface MergeSapsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saps: SapPerformance[];
  onMerged: () => void;
}

export function MergeSapsDialog({ open, onOpenChange, saps, onMerged }: MergeSapsDialogProps) {
  const { toast } = useToast();
  const mergeSaps = useMergeSaps();
  const [keeperId, setKeeperId] = useState<string>('');

  // Default the keeper to whichever selected SAP has the most drivers assigned.
  useEffect(() => {
    if (open && saps.length > 0) {
      const best = [...saps].sort(
        (a, b) => (b.total_drivers_assigned || 0) - (a.total_drivers_assigned || 0)
      )[0];
      setKeeperId(best.id);
    }
  }, [open, saps]);

  const totalDrivers = saps.reduce((sum, s) => sum + (s.total_drivers_assigned || 0), 0);

  const handleMerge = async () => {
    if (!keeperId) return;
    try {
      await mergeSaps.mutateAsync({
        keeperId,
        duplicateIds: saps.map((s) => s.id),
      });
      toast({
        title: 'SAPs merged',
        description: `${saps.length} records combined into one, with ${totalDrivers} driver${totalDrivers === 1 ? '' : 's'} now under it.`,
      });
      onMerged();
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to merge SAPs';
      toast({ title: 'Merge failed', description: message, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !mergeSaps.isPending && onOpenChange(next)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Merge className="h-5 w-5" />
            Merge {saps.length} SAP records
          </DialogTitle>
          <DialogDescription>
            Pick which record to keep. Every driver on the others will be moved onto it,
            and the duplicate records will be removed. This can't be undone.
          </DialogDescription>
        </DialogHeader>

        <RadioGroup value={keeperId} onValueChange={setKeeperId} className="space-y-2 py-2">
          {saps.map((sap) => {
            const email = formatEmailDisplay(sap.email);
            return (
              <label
                key={sap.id}
                htmlFor={`keep-${sap.id}`}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3 hover:bg-muted/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value={sap.id} id={`keep-${sap.id}`} />
                  <div>
                    <p className="text-sm font-medium">
                      {toProperCase(sap.first_name)} {toProperCase(sap.last_name)}
                    </p>
                    <p className="text-xs text-muted-foreground">{email || '—'}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {sap.total_drivers_assigned || 0} driver{sap.total_drivers_assigned === 1 ? '' : 's'}
                </span>
              </label>
            );
          })}
        </RadioGroup>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mergeSaps.isPending}>
            Cancel
          </Button>
          <Button onClick={handleMerge} disabled={!keeperId || mergeSaps.isPending}>
            {mergeSaps.isPending ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                Merging…
              </>
            ) : (
              `Merge into selected — ${totalDrivers} driver${totalDrivers === 1 ? '' : 's'} total`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
