import { useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAdvanceDriverStep } from '@/hooks/useDriverDetails';
import { Driver } from '@/hooks/useDrivers';

const SAP_PAPERWORK_RECEIVED_WEBHOOK =
  'https://n8n.srv1186934.hstgr.cloud/webhook/sap-paperwork-received';

const ACCEPTED_TYPES =
  '.pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png';

interface UploadSapPaperworkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver: Driver;
  onSuccess?: () => void;
}

export function UploadSapPaperworkDialog({
  open,
  onOpenChange,
  driver,
  onSuccess,
}: UploadSapPaperworkDialogProps) {
  const { toast } = useToast();
  const advanceStep = useAdvanceDriverStep();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [requiresAlcoholTest, setRequiresAlcoholTest] = useState(false);
  const [uploading, setUploading] = useState(false);

  const reset = () => {
    setFile(null);
    setRequiresAlcoholTest(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = (next: boolean) => {
    if (uploading) return;
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please choose a file to upload.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    const storageBucket = 'rtd-documents';
    const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
    const timestamp = Date.now();
    const storagePath = `${driver.id}/${timestamp}-sap_paperwork.${ext}`;
    let uploaded = false;

    try {
      const { error: uploadError } = await supabase.storage
        .from(storageBucket)
        .upload(storagePath, file, {
          contentType: file.type || 'application/octet-stream',
          upsert: false,
        });
      if (uploadError) throw uploadError;
      uploaded = true;

      const { error: insertError } = await supabase.from('documents').insert({
        driver_id: driver.id,
        document_type: 'SAP_PAPERWORK',
        file_name: file.name,
        mime_type: file.type || null,
        file_size_bytes: file.size,
        storage_bucket: storageBucket,
        storage_path: storagePath,
        uploaded_by: 'staff',
        uploaded_at: new Date().toISOString(),
      });
      if (insertError) {
        // cleanup orphan
        await supabase.storage.from(storageBucket).remove([storagePath]);
        uploaded = false;
        throw insertError;
      }

      // Generate a 24h signed URL (bucket is private)
      const { data: signed, error: signErr } = await supabase.storage
        .from(storageBucket)
        .createSignedUrl(storagePath, 60 * 60 * 24);
      if (signErr || !signed?.signedUrl) {
        throw signErr ?? new Error('Could not generate document URL');
      }

      await advanceStep.mutateAsync({
        driverId: driver.id,
        newStep: driver.current_step,
        newStatus: 'SAP_PAPERWORK_RECEIVED',
      });

      await fetch(SAP_PAPERWORK_RECEIVED_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driver_id: driver.id,
          document_url: signed.signedUrl,
          requires_alcohol_test: requiresAlcoholTest,
        }),
      });

      toast({
        title: 'Paperwork uploaded',
        description: 'SAP paperwork uploaded and sent to automation.',
      });
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload paperwork';
      toast({ title: 'Upload failed', description: message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload SAP Paperwork</DialogTitle>
          <DialogDescription>
            Accepted: PDF, DOC, DOCX, JPG, PNG.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="sap-file">File</Label>
            <input
              id="sap-file"
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES}
              disabled={uploading}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
            />
            {file && (
              <p className="text-xs text-muted-foreground truncate">
                Selected: {file.name} ({Math.round(file.size / 1024)} KB)
              </p>
            )}
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="requires-alcohol-test"
              checked={requiresAlcoholTest}
              onCheckedChange={(c) => setRequiresAlcoholTest(c === true)}
              disabled={uploading}
            />
            <Label
              htmlFor="requires-alcohol-test"
              className="text-sm font-normal leading-snug cursor-pointer"
            >
              This SAP paperwork requires an alcohol test (urine + breath)
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={uploading || !file}>
            {uploading ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <Upload className="mr-1 h-4 w-4" />
                Submit
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
