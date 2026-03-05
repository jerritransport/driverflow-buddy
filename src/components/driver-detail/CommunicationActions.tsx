import { useState } from 'react';
import { Driver } from '@/hooks/useDrivers';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Send, PartyPopper, Clock, FileText, ChevronDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CommunicationActionsProps {
  driver: Driver;
}

interface EmailTemplate {
  id: string;
  label: string;
  icon: React.ReactNode;
  getSubject: (driver: Driver) => string;
  getBody: (driver: Driver) => string;
  isAvailable: (driver: Driver) => boolean;
  disabledReason?: string;
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'welcome',
    label: 'Welcome Email',
    icon: <Mail className="h-4 w-4" />,
    getSubject: (d) => `Welcome to the Return-to-Duty Program, ${d.first_name}!`,
    getBody: (d) =>
      `Hi ${d.first_name},\n\nWelcome to the Return-to-Duty (RTD) program. We're here to guide you through the process and ensure your successful return to duty.\n\nYour next step is to complete the consent form and provide payment. Please follow the instructions in the attached materials.\n\nIf you have questions, don't hesitate to reach out.\n\nBest regards,\nRTD Team`,
    isAvailable: () => true,
  },
  {
    id: 'donor_pass',
    label: 'Donor Pass',
    icon: <Send className="h-4 w-4" />,
    getSubject: (d) => `Your Donor Pass – ${d.first_name} ${d.last_name}`,
    getBody: (d) =>
      `Hi ${d.first_name},\n\nYour donor pass has been generated.${d.donor_pass_number ? `\n\nDonor Pass #: ${d.donor_pass_number}` : ''}\n\nPlease schedule your test at the assigned clinic and present this donor pass at check-in.\n\nIf you have questions about scheduling, please contact us.\n\nBest regards,\nRTD Team`,
    isAvailable: (d) => !!d.donor_pass_number,
    disabledReason: 'No donor pass generated yet',
  },
  {
    id: 'congratulations',
    label: 'Congratulations',
    icon: <PartyPopper className="h-4 w-4" />,
    getSubject: (d) => `Congratulations, ${d.first_name}! RTD Process Complete`,
    getBody: (d) =>
      `Hi ${d.first_name},\n\nCongratulations! You have successfully completed the Return-to-Duty process.\n\nYour clearance has been processed and reported. You are now eligible to return to duty.\n\nThank you for your cooperation throughout this process. We wish you all the best!\n\nBest regards,\nRTD Team`,
    isAvailable: (d) => d.current_step === 7 || d.rtd_completed === true,
    disabledReason: 'Driver has not completed RTD process',
  },
  {
    id: 'payment_reminder',
    label: 'Payment Reminder',
    icon: <Clock className="h-4 w-4" />,
    getSubject: (d) => `Payment Reminder – ${d.first_name} ${d.last_name}`,
    getBody: (d) => {
      const balance = (d.amount_due ?? 0) - (d.amount_paid ?? 0);
      return `Hi ${d.first_name},\n\nThis is a friendly reminder that you have an outstanding balance of $${balance.toFixed(2)} for your Return-to-Duty program.\n\nPlease submit your payment at your earliest convenience so we can continue progressing your case.\n\nIf you've already made a payment, please disregard this notice.\n\nBest regards,\nRTD Team`;
    },
    isAvailable: (d) => (d.amount_due ?? 0) > (d.amount_paid ?? 0),
    disabledReason: 'No outstanding balance',
  },
  {
    id: 'sap_followup',
    label: 'SAP Follow-Up',
    icon: <FileText className="h-4 w-4" />,
    getSubject: (d) => `SAP Counselor Follow-Up – ${d.first_name} ${d.last_name}`,
    getBody: (d) =>
      `Hi ${d.first_name},\n\nWe're following up on your SAP counselor assignment. Please confirm that you have been in contact with your assigned SAP and that your evaluation is progressing.\n\nIf you need assistance finding a SAP counselor or have any questions about the process, please let us know.\n\nTimely completion of your SAP evaluation is essential for your return-to-duty clearance.\n\nBest regards,\nRTD Team`,
    isAvailable: (d) => d.current_step >= 3,
    disabledReason: 'Driver has not reached SAP step',
  },
  {
    id: 'test_reminder',
    label: 'Test Scheduling Reminder',
    icon: <Clock className="h-4 w-4" />,
    getSubject: (d) => `Test Scheduling Reminder – ${d.first_name} ${d.last_name}`,
    getBody: (d) =>
      `Hi ${d.first_name},\n\nThis is a reminder to schedule your drug test at your assigned clinic. Please use your donor pass when you arrive.\n\n${d.test_scheduled_date ? `Your test is scheduled for: ${d.test_scheduled_date}` : 'Please schedule your test as soon as possible.'}\n\nIf you have questions about the testing process or need to reschedule, please contact us.\n\nBest regards,\nRTD Team`,
    isAvailable: (d) => d.current_step >= 5,
    disabledReason: 'Driver has not reached testing step',
  },
];

export function CommunicationActions({ driver }: CommunicationActionsProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [sending, setSending] = useState(false);

  const handleSelectTemplate = (templateId: string) => {
    const template = EMAIL_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    setSelectedTemplateId(templateId);
    setEditedSubject(template.getSubject(driver));
    setEditedBody(template.getBody(driver));
    setDialogOpen(true);
  };

  const handleSend = async () => {
    setSending(true);
    try {
      // Placeholder: will connect to email automation
      console.log('Sending email:', {
        to: driver.email,
        subject: editedSubject,
        body: editedBody,
        templateId: selectedTemplateId,
      });

      await new Promise(resolve => setTimeout(resolve, 800));

      toast.success(`Email sent to ${driver.email}`, {
        description: `Template: ${EMAIL_TEMPLATES.find(t => t.id === selectedTemplateId)?.label}`,
      });
      setDialogOpen(false);
    } catch {
      toast.error('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const selectedTemplate = EMAIL_TEMPLATES.find(t => t.id === selectedTemplateId);

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Resend Communications
      </p>

      <div className="flex gap-2">
        <Select value="" onValueChange={handleSelectTemplate}>
          <SelectTrigger className="flex-1">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Select a follow-up to send..." />
            </div>
          </SelectTrigger>
          <SelectContent>
            {EMAIL_TEMPLATES.map((template) => {
              const available = template.isAvailable(driver);
              return (
                <SelectItem
                  key={template.id}
                  value={template.id}
                  disabled={!available}
                  className="flex items-center gap-2"
                >
                  <div className="flex items-center gap-2">
                    {template.icon}
                    <span>{template.label}</span>
                    {!available && template.disabledReason && (
                      <span className="text-xs text-muted-foreground ml-1">
                        ({template.disabledReason})
                      </span>
                    )}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Quick action buttons for the 3 most common */}
      <div className="flex flex-wrap gap-2">
        {EMAIL_TEMPLATES.slice(0, 3).map((template) => {
          const available = template.isAvailable(driver);
          return (
            <Button
              key={template.id}
              variant="outline"
              size="sm"
              onClick={() => handleSelectTemplate(template.id)}
              disabled={!available}
              className="gap-1.5"
              title={!available ? template.disabledReason : undefined}
            >
              {template.icon}
              {template.label}
            </Button>
          );
        })}
      </div>

      {/* Email Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTemplate?.icon}
              {selectedTemplate?.label}
            </DialogTitle>
            <DialogDescription>
              Edit the email before sending to {driver.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-to">To</Label>
              <Input id="email-to" value={driver.email} disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                value={editedSubject}
                onChange={(e) => setEditedSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-body">Body</Label>
              <Textarea
                id="email-body"
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={sending}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={sending || !editedSubject.trim() || !editedBody.trim()}>
              {sending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
