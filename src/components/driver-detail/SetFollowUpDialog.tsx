import { useState } from 'react';
import { Driver } from '@/hooks/useDrivers';
import { useUpdateDriver } from '@/hooks/useDriverDetails';
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
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface SetFollowUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver: Driver;
  onSuccess?: () => void;
}

export function SetFollowUpDialog({ open, onOpenChange, driver, onSuccess }: SetFollowUpDialogProps) {
  const updateDriver = useUpdateDriver();
  
  const [followUpDate, setFollowUpDate] = useState(
    driver.follow_up_date || format(new Date(), 'yyyy-MM-dd')
  );
  const [followUpNote, setFollowUpNote] = useState(driver.follow_up_note || '');

  const hasExistingFollowUp = !!driver.follow_up_date;

  const handleSave = async () => {
    try {
      await updateDriver.mutateAsync({
        driverId: driver.id,
        updates: {
          follow_up_date: followUpDate || null,
          follow_up_note: followUpNote || null,
        },
      });

      toast.success('Follow-up reminder saved');
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error('Failed to save follow-up');
    }
  };

  const handleClear = async () => {
    try {
      await updateDriver.mutateAsync({
        driverId: driver.id,
        updates: {
          follow_up_date: null,
          follow_up_note: null,
        },
      });

      setFollowUpDate('');
      setFollowUpNote('');
      toast.success('Follow-up cleared');
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error('Failed to clear follow-up');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Set Follow-Up Reminder
          </DialogTitle>
          <DialogDescription>
            Schedule a follow-up for {driver.first_name} {driver.last_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="followUpDate">Follow-Up Date</Label>
            <Input
              id="followUpDate"
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="followUpNote">Note / Reason</Label>
            <Textarea
              id="followUpNote"
              placeholder="e.g., Call to confirm payment, Check on SAP paperwork..."
              value={followUpNote}
              onChange={(e) => setFollowUpNote(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {hasExistingFollowUp && (
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              disabled={updateDriver.isPending}
              className="gap-1"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateDriver.isPending || !followUpDate}
          >
            {updateDriver.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Follow-Up
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
