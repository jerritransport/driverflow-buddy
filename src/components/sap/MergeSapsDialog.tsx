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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');

  // Default the keeper to whichever selected SAP has the most drivers assigned,
  // and pre-fill the editable fields from that record (cleaned up for display).
  useEffect(() => {
    if (open && saps.length > 0) {
      const best = [...saps].sort(
        (a, b) => (b.total_drivers_assigned || 0) - (a.total_drivers_assigned || 0)
      )[0];
      setKeeperId(best.id);
      setFirstName(toProperCase(best.first_name || ''));
      setLastName(toProperCase(best.last_name || ''));
      setEmail(formatEmailDisplay(best.email));
      setOrganization(best.organization ? toProperCase(best.organization) : '');
    }
  }, [open, saps]);

  // When the person switches which record to keep, refresh the editable
  // fields to that record's data so they're not stuck editing the old one.
  const handleSelectKeeper = (id: string) => {
    setKeeperId(id);
    const chosen = saps.find((s) => s.id === id);
    if (chosen) {
      setFirstName(toProperCase(chosen.first_name || ''));
      setLastName(toProperCase(chosen.last_name || ''));
      setEmail(formatEmailDisplay(chosen.email));
      setOrganization(chosen.organization ? toProperCase(chosen.organization) : '');
    }
  };

  const totalDrivers = saps.reduce((sum, s) => sum + (s.total_drivers_assigned || 0), 0);

  const handleMerge = async () => {
    if (!keeperId || !firstName.trim() || !lastName.trim()) return;
    try {
      await mergeSaps.mutateAsync({
        keeperId,
        duplicateIds: saps.map((s) => s.id),
        keeperUpdates: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          organization: organization.trim() || null,
        },
      });
      toast({
        title: 'SAPs merged',
        description: `${saps.length} records combined into one, with ${totalDrivers} driver${totalDrivers === 1 ? '' : 's'} now under it.`,
      });
      onMerged();
      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to merge SAPs';
      toast({ title: 'Merge failed', description: message, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !mergeSaps.isPending && onOpenChange(next)}>
      <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden sm:max-w-lg">
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

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto py-2 pr-1">
          <RadioGroup value={keeperId} onValueChange={handleSelectKeeper} className="space-y-2">
            {saps.map((sap) => {
              const sapEmail = formatEmailDisplay(sap.email);
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
                      <p className="text-xs text-muted-foreground">{sapEmail || '—'}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {sap.total_drivers_assigned || 0} driver{sap.total_drivers_assigned === 1 ? '' : 's'}
                  </span>
                </label>
              );
            })}
          </RadioGroup>

          {/* Correct the final info before merging */}
          <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground">
              Correct the info for the merged record
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="merge-first-name" className="text-xs">First Name</Label>
                <Input
                  id="merge-first-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="merge-last-name" className="text-xs">Last Name</Label>
                <Input
                  id="merge-last-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="merge-email" className="text-xs">Email</Label>
              <Input
                id="merge-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="merge-organization" className="text-xs">Organization</Label>
              <Input
                id="merge-organization"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Organization (optional)"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mergeSaps.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleMerge}
            disabled={!keeperId || !firstName.trim() || !lastName.trim() || mergeSaps.isPending}
          >
            {mergeSaps.isPending ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                Merging…
              </>
            ) : (
              `Merge — ${totalDrivers} driver${totalDrivers === 1 ? '' : 's'} total`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
