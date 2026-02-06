import { useState } from 'react';
import { Driver } from '@/hooks/useDrivers';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Copy, Send, Wine } from 'lucide-react';

interface SendAlcoholPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver: Driver;
  onSuccess?: () => void;
}

const ALCOHOL_TEST_FEE = 75; // Standard alcohol test fee

export function SendAlcoholPaymentDialog({
  open,
  onOpenChange,
  driver,
  onSuccess,
}: SendAlcoholPaymentDialogProps) {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  
  const paymentLink = `https://pay.rtdservices.com/alcohol-test/${driver.id}`;
  
  const defaultMessage = `Hi ${driver.first_name},

Your SAP counselor has indicated that an alcohol test is required as part of your return-to-duty process.

The alcohol test fee is $${ALCOHOL_TEST_FEE}. Please complete your payment using the secure link below:

${paymentLink}

Once payment is received, we will provide instructions for scheduling your alcohol test.

If you have any questions, please don't hesitate to reach out.

Thank you,
RTD Services Team`;

  const [message, setMessage] = useState(defaultMessage);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(paymentLink);
    toast({
      title: 'Link Copied',
      description: 'Payment link copied to clipboard',
    });
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message);
    toast({
      title: 'Message Copied',
      description: 'Full message copied to clipboard',
    });
  };

  const handleSendSMS = async () => {
    setIsSending(true);
    try {
      // TODO: Integrate with SMS provider
      // For now, simulate sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Message Sent',
        description: `Alcohol test payment link sent to ${driver.phone}`,
      });
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendEmail = async () => {
    setIsSending(true);
    try {
      // TODO: Integrate with email provider
      // For now, simulate sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Email Sent',
        description: `Alcohol test payment link sent to ${driver.email}`,
      });
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wine className="h-5 w-5 text-primary" />
            Send Alcohol Test Payment Link
          </DialogTitle>
          <DialogDescription>
            Send a payment link to {driver.first_name} {driver.last_name} for the alcohol test fee (${ALCOHOL_TEST_FEE}).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Payment Link</Label>
            <div className="flex gap-2">
              <Input 
                value={paymentLink} 
                readOnly 
                className="bg-muted text-sm"
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleCopyLink}
                title="Copy link"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Message Template</Label>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleCopyMessage}
                className="h-7 text-xs"
              >
                <Copy className="mr-1 h-3 w-3" />
                Copy Message
              </Button>
            </div>
            <Textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={10}
              className="text-sm"
            />
          </div>

          <div className="rounded-lg border bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">
              <strong>Driver Contact:</strong><br />
              Phone: {driver.phone}<br />
              Email: {driver.email}
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={handleSendEmail}
            disabled={isSending || !driver.email}
          >
            <Send className="mr-2 h-4 w-4" />
            Send Email
          </Button>
          <Button
            onClick={handleSendSMS}
            disabled={isSending || !driver.phone}
          >
            <Send className="mr-2 h-4 w-4" />
            Send SMS
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
