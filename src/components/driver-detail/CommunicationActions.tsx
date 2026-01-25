import { Driver } from '@/hooks/useDrivers';
import { Button } from '@/components/ui/button';
import { Mail, Send, PartyPopper } from 'lucide-react';
import { toast } from 'sonner';

interface CommunicationActionsProps {
  driver: Driver;
}

export function CommunicationActions({ driver }: CommunicationActionsProps) {
  const handleResendWelcome = () => {
    console.log('Resending welcome email to:', driver.email);
    toast.info('Email resend triggered - Will be connected to automation webhooks');
  };

  const handleResendDonorPass = () => {
    console.log('Resending donor pass to:', driver.email, 'Pass:', driver.donor_pass_number);
    toast.info('Donor pass email triggered - Will be connected to automation webhooks');
  };

  const handleResendCongratulations = () => {
    console.log('Resending congratulations email to:', driver.email);
    toast.info('Congratulations email triggered - Will be connected to automation webhooks');
  };

  const canResendDonorPass = !!driver.donor_pass_number;
  const isComplete = driver.current_step === 7 || driver.rtd_completed;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Resend Communications
      </p>
      <div className="flex flex-wrap gap-2">
        {/* Resend Welcome Email - Available for Step 1+ */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleResendWelcome}
          className="gap-1.5"
        >
          <Mail className="h-4 w-4" />
          Welcome Email
        </Button>

        {/* Resend Donor Pass - Only if donor pass exists */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleResendDonorPass}
          disabled={!canResendDonorPass}
          className="gap-1.5"
          title={!canResendDonorPass ? 'No donor pass generated yet' : undefined}
        >
          <Send className="h-4 w-4" />
          Donor Pass
        </Button>

        {/* Resend Congratulations - Only for completed drivers */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleResendCongratulations}
          disabled={!isComplete}
          className="gap-1.5"
          title={!isComplete ? 'Driver has not completed RTD process' : undefined}
        >
          <PartyPopper className="h-4 w-4" />
          Congratulations
        </Button>
      </div>
    </div>
  );
}
