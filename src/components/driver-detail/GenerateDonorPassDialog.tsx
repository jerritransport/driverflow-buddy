import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Driver } from '@/hooks/useDrivers';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, FileText, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface GenerateDonorPassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver: Driver;
}

function generateDonorPassNumber(): string {
  const prefix = 'DP';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function GenerateDonorPassDialog({ open, onOpenChange, driver }: GenerateDonorPassDialogProps) {
  const queryClient = useQueryClient();
  const [donorPassNumber, setDonorPassNumber] = useState(driver.donor_pass_number || generateDonorPassNumber());
  const [copied, setCopied] = useState(false);

  const generatePass = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('drivers')
        .update({
          donor_pass_number: donorPassNumber,
          donor_pass_generated_at: new Date().toISOString(),
          status: 'DONOR_PASS_SENT',
          current_step: driver.current_step < 5 ? 5 : driver.current_step,
          updated_at: new Date().toISOString(),
        })
        .eq('id', driver.id);

      if (error) throw error;
      return donorPassNumber;
    },
    onSuccess: (passNumber) => {
      queryClient.invalidateQueries({ queryKey: ['driver', driver.id] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['drivers-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['drivers-by-step'] });

      toast.success(`Manual donor pass ${passNumber} generated - CRL automation pending`);
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Failed to generate donor pass: ${error.message}`);
    },
  });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(donorPassNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Donor pass number copied to clipboard');
  };

  const handleRegenerate = () => {
    setDonorPassNumber(generateDonorPassNumber());
  };

  const hasExistingPass = !!driver.donor_pass_number;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {hasExistingPass ? 'View Donor Pass' : 'Generate Donor Pass'}
          </DialogTitle>
          <DialogDescription>
            {hasExistingPass
              ? `Donor pass for ${driver.first_name} ${driver.last_name}`
              : `Generate a donor pass number for ${driver.first_name} ${driver.last_name}`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Driver Info Summary */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <span className="ml-2 font-medium">{driver.first_name} {driver.last_name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">CDL:</span>
                <span className="ml-2 font-mono text-xs">{driver.cdl_number}</span>
              </div>
              <div>
                <span className="text-muted-foreground">DOB:</span>
                <span className="ml-2">{driver.date_of_birth}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Test Type:</span>
                <span className="ml-2">{driver.requires_alcohol_test ? 'Drug + Alcohol' : 'Drug Only'}</span>
              </div>
            </div>
          </div>

          {/* Donor Pass Number */}
          <div className="space-y-2">
            <Label htmlFor="donorPass">Donor Pass Number</Label>
            <div className="flex gap-2">
              <Input
                id="donorPass"
                value={donorPassNumber}
                onChange={(e) => setDonorPassNumber(e.target.value)}
                readOnly={hasExistingPass}
                className="font-mono text-lg tracking-wide"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopy}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            {!hasExistingPass && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRegenerate}
                className="text-xs"
              >
                Regenerate Number
              </Button>
            )}
          </div>

          {hasExistingPass && driver.donor_pass_generated_at && (
            <p className="text-xs text-muted-foreground">
              Generated on {new Date(driver.donor_pass_generated_at).toLocaleDateString()} at{' '}
              {new Date(driver.donor_pass_generated_at).toLocaleTimeString()}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {!hasExistingPass && (
            <Button
              onClick={() => generatePass.mutate()}
              disabled={generatePass.isPending || !donorPassNumber}
            >
              {generatePass.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate & Save
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
