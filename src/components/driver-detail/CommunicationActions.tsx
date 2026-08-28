import { useRef, useState } from 'react';
import { Driver } from '@/hooks/useDrivers';
import { supabase } from '@/integrations/supabase/client';
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
import { Mail, Send, PartyPopper, Clock, FileText, Loader2, Paperclip, X, Image as ImageIcon } from 'lucide-react';
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

const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10MB

interface PendingAttachment {
  id: string;
  file: File;
  previewUrl: string | null;
}

// Escapes HTML special characters, then converts blank-line breaks to
// paragraphs and single newlines to <br> — turns the plain-text body the
// person edited into safe, readable HTML.
function textToHtmlParagraphs(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return escaped
    .split(/\n\s*\n/)
    .map((para) => `<p style="margin:0 0 16px;">${para.replace(/\n/g, '<br>')}</p>`)
    .join('');
}

// Wraps the email body in a simple branded theme (header bar + footer).
function wrapEmailHtml(bodyText: string): string {
  const bodyHtml = textToHtmlParagraphs(bodyText);
  return `
<div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto;">
  <div style="background: linear-gradient(90deg, #7cc142, #d81f4b); padding: 20px 24px; border-radius: 8px 8px 0 0;">
    <span style="color: #ffffff; font-size: 18px; font-weight: 700;">GOOP RTD Dashboard</span>
  </div>
  <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px; color: #1f2937; font-size: 14px; line-height: 1.6;">
    ${bodyHtml}
  </div>
  <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 16px;">
    Sent via GOOP RTD Dashboard
  </p>
</div>`.trim();
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the "data:<mime>;base64," prefix — Gmail API wants raw base64.
      resolve(result.split(',')[1] ?? '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function CommunicationActions({ driver }: CommunicationActionsProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectTemplate = (templateId: string) => {
    const template = EMAIL_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    setSelectedTemplateId(templateId);
    setEditedSubject(template.getSubject(driver));
    setEditedBody(template.getBody(driver));
    setAttachments([]);
    setDialogOpen(true);
  };

  const addAttachments = (files: FileList | File[]) => {
    const incoming = Array.from(files);
    setAttachments((prev) => {
      const room = MAX_ATTACHMENTS - prev.length;
      if (room <= 0) {
        toast.error(`You can attach up to ${MAX_ATTACHMENTS} files.`);
        return prev;
      }
      const accepted: PendingAttachment[] = [];
      for (const file of incoming.slice(0, room)) {
        if (file.size > MAX_ATTACHMENT_SIZE) {
          toast.error(`${file.name} is over the 10MB limit.`);
          continue;
        }
        accepted.push({
          id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
          file,
          previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        });
      }
      return [...prev, ...accepted];
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((a) => a.id !== id);
    });
  };

  // Lets the person paste a screenshot straight from the clipboard into the
  // email body, the same way Gmail lets you paste an image into a compose window.
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const imageFiles: File[] = [];
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) imageFiles.push(file);
      }
    }
    if (imageFiles.length > 0) {
      e.preventDefault();
      addAttachments(imageFiles);
      toast.success(`${imageFiles.length > 1 ? 'Screenshots' : 'Screenshot'} attached.`);
    }
  };

  const handleSend = async () => {
    setSending(true);
    try {
      const attachmentPayload = await Promise.all(
        attachments.map(async (a) => ({
          filename: a.file.name || 'attachment',
          mime_type: a.file.type || 'application/octet-stream',
          content_base64: await fileToBase64(a.file),
        }))
      );

      const { data, error } = await supabase.functions.invoke('send-driver-email', {
        body: {
          to: driver.email,
          subject: editedSubject,
          body_html: wrapEmailHtml(editedBody),
          attachments: attachmentPayload,
          tenant_id: driver.tenant_id ?? null,
        },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      toast.success(`Email sent to ${driver.email}`, {
        description: `Template: ${EMAIL_TEMPLATES.find(t => t.id === selectedTemplateId)?.label}`,
      });
      attachments.forEach((a) => { if (a.previewUrl) URL.revokeObjectURL(a.previewUrl); });
      setAttachments([]);
      setDialogOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send email';
      toast.error('Failed to send email', { description: message });
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
      <Dialog
        open={dialogOpen}
        onOpenChange={(next) => {
          if (sending) return;
          if (!next) {
            attachments.forEach((a) => { if (a.previewUrl) URL.revokeObjectURL(a.previewUrl); });
            setAttachments([]);
          }
          setDialogOpen(next);
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
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
                onPaste={handlePaste}
                rows={10}
                className="font-mono text-sm"
                placeholder="Tip: paste a screenshot directly here to attach it"
              />
            </div>

            {/* Attachments */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Attachments</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) addAttachments(e.target.files);
                    e.target.value = '';
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={attachments.length >= MAX_ATTACHMENTS}
                >
                  <Paperclip className="h-3.5 w-3.5" />
                  Attach file
                </Button>
              </div>

              {attachments.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {attachments.map((a) => (
                    <div key={a.id} className="relative rounded-md border p-2">
                      <button
                        type="button"
                        onClick={() => removeAttachment(a.id)}
                        className="absolute -right-1.5 -top-1.5 rounded-full bg-destructive p-0.5 text-destructive-foreground"
                        aria-label="Remove attachment"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {a.previewUrl ? (
                        <img src={a.previewUrl} alt={a.file.name} className="h-16 w-full rounded object-cover" />
                      ) : (
                        <div className="flex h-16 w-full items-center justify-center rounded bg-muted">
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <p className="mt-1 truncate text-xs text-muted-foreground">{a.file.name}</p>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Paste a screenshot directly into the body field, or attach files — up to {MAX_ATTACHMENTS}.
              </p>
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
