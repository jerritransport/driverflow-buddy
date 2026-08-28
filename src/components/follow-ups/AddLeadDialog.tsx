import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, UserPlus } from 'lucide-react';
import { useCreateLead } from '@/hooks/useLeads';
import { useStaffMembers } from '@/hooks/useStaffMembers';
import { formatPhoneInput, formatPhoneFinal, isValidUSPhone } from '@/lib/phoneUtils';
import { useToast } from '@/hooks/use-toast';

interface AddLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddLeadDialog({ open, onOpenChange }: AddLeadDialogProps) {
  const { toast } = useToast();
  const createLead = useCreateLead();
  const { data: staffMembers } = useStaffMembers();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [sapCounselor, setSapCounselor] = useState('');
  const [howHeard, setHowHeard] = useState('');
  const [agentId, setAgentId] = useState('');

  const reset = () => {
    setFirstName('');
    setLastName('');
    setPhone('');
    setSapCounselor('');
    setHowHeard('');
    setAgentId('');
  };

  const handleClose = (next: boolean) => {
    if (createLead.isPending) return;
    if (!next) reset();
    onOpenChange(next);
  };

  const isValid =
    firstName.trim() &&
    lastName.trim() &&
    isValidUSPhone(phone) &&
    sapCounselor.trim() &&
    agentId;

  const handleSubmit = async () => {
    if (!isValid) return;
    try {
      await createLead.mutateAsync({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: formatPhoneFinal(phone),
        sap_counselor: sapCounselor.trim(),
        how_heard: howHeard.trim() || null,
        staff_member_id: agentId,
      });
      toast({ title: 'Lead added', description: `${firstName} ${lastName} added to Follow-Ups.` });
      reset();
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add lead';
      toast({ title: 'Failed to add lead', description: message, variant: 'destructive' });
    }
  };

  const activeStaff = staffMembers?.filter((s) => s.is_active) ?? [];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Lead
          </DialogTitle>
          <DialogDescription>
            Log a prospective driver here. Once their intake form comes in (matched by phone
            number), this entry converts automatically and the sales agent tag carries over.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="lead-first-name">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lead-first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-last-name">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lead-last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lead-phone">
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lead-phone"
              value={phone}
              onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
              placeholder="(555) 123-4567"
              inputMode="tel"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lead-sap-counselor">
              SAP Counselor <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lead-sap-counselor"
              value={sapCounselor}
              onChange={(e) => setSapCounselor(e.target.value)}
              placeholder="SAP Counselor name"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lead-agent">
              Agent Name <span className="text-destructive">*</span>
            </Label>
            <Select value={agentId} onValueChange={setAgentId}>
              <SelectTrigger id="lead-agent">
                <SelectValue placeholder="Select agent" />
              </SelectTrigger>
              <SelectContent>
                {activeStaff.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lead-how-heard">How did they hear about us?</Label>
            <Input
              id="lead-how-heard"
              value={howHeard}
              onChange={(e) => setHowHeard(e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={createLead.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || createLead.isPending}>
            {createLead.isPending ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                Adding…
              </>
            ) : (
              'Add Lead'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
