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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Upload, X, FileCheck2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Driver } from '@/hooks/useDrivers';
import { StepUploadRequirement } from '@/lib/stepUploadRequirements';

const STORAGE_BUCKET = 'rtd-documents';
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ACCEPTED_TYPES =
  '.pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png';

interface PendingFile {
  file: File;
  tag?: 'DRUG' | 'ALCOHOL';
}

interface AdvanceStepUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver: Driver;
  targetStep: number;
  stepLabel: string;
  requirements: StepUploadRequirement[];
  onAdvance: () => Promise<void>;
}

export function AdvanceStepUploadDialog({
  open,
  onOpenChange,
  driver,
  targetStep,
  stepLabel,
  requirements,
  onAdvance,
}: AdvanceStepUploadDialogProps) {
  const { toast } = useToast();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [filesByType, setFilesByType] = useState<Record<string, PendingFile[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setFilesByType({});
  };

  const handleClose = (next: boolean) => {
    if (submitting) return;
    if (!next) reset();
    onOpenChange(next);
  };

  const addFiles = (type: string, req: StepUploadRequirement, incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return;
    setFilesByType((prev) => {
      const existing = prev[type] ?? [];
      const room = req.max - existing.length;
      if (room <= 0) {
        toast({
          title: 'Limit reached',
          description: `${req.label} allows up to ${req.max} file${req.max > 1 ? 's' : ''}.`,
          variant: 'destructive',
        });
        return prev;
      }
      const toAdd: PendingFile[] = [];
      for (let i = 0; i < incoming.length && toAdd.length < room; i++) {
        const file = incoming[i];
        if (file.size > MAX_FILE_SIZE) {
          toast({
            title: 'File too large',
            description: `${file.name} exceeds the 20MB limit.`,
            variant: 'destructive',
          });
          continue;
        }
        toAdd.push({ file });
      }
      return { ...prev, [type]: [...existing, ...toAdd] };
    });
  };

  const removeFile = (type: string, index: number) => {
    setFilesByType((prev) => ({
      ...prev,
      [type]: (prev[type] ?? []).filter((_, i) => i !== index),
    }));
  };

  const setTag = (type: string, index: number, tag: 'DRUG' | 'ALCOHOL') => {
    setFilesByType((prev) => ({
      ...prev,
      [type]: (prev[type] ?? []).map((f, i) => (i === index ? { ...f, tag } : f)),
    }));
  };

  const isRequirementMet = (req: StepUploadRequirement) => {
    const files = filesByType[req.type] ?? [];
    if (files.length < req.min) return false;
    if (req.requiresDrugAlcoholTag && files.some((f) => !f.tag)) return false;
    return true;
  };

  const allMet = requirements.every(isRequirementMet);

  const handleSubmit = async () => {
    if (!allMet) return;
    setSubmitting(true);

    try {
      for (const req of requirements) {
        const files = filesByType[req.type] ?? [];
        for (const pf of files) {
          const ext = pf.file.name.includes('.') ? pf.file.name.split('.').pop() : 'bin';
          const timestamp = Date.now();
          const storagePath = `${driver.id}/${timestamp}-${req.type.toLowerCase()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(storagePath, pf.file, {
              contentType: pf.file.type || 'application/octet-stream',
              upsert: false,
            });
          if (uploadError) throw uploadError;

          const { error: insertError } = await supabase.from('documents').insert({
            driver_id: driver.id,
            document_type: req.type,
            description: pf.tag ?? null,
            file_name: pf.file.name,
            mime_type: pf.file.type || null,
            file_size_bytes: pf.file.size,
            storage_bucket: STORAGE_BUCKET,
            storage_path: storagePath,
            uploaded_by: 'staff',
            uploaded_at: new Date().toISOString(),
          });
          if (insertError) {
            await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
            throw insertError;
          }
        }
      }

      await onAdvance();

      reset();
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload documents';
      toast({ title: 'Upload failed', description: message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Required documents — Step {targetStep}: {stepLabel}</DialogTitle>
          <DialogDescription>
            Upload every required document below before advancing this driver.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {requirements.map((req) => {
            const files = filesByType[req.type] ?? [];
            const met = isRequirementMet(req);
            return (
              <div key={req.type} className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1.5 text-sm font-medium">
                    {req.label}
                    <span className="text-destructive">*</span>
                  </Label>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    {met ? (
                      <FileCheck2 className="h-3.5 w-3.5 text-[hsl(var(--status-success))]" />
                    ) : (
                      <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                    )}
                    {files.length}/{req.max}
                  </span>
                </div>

                {files.map((pf, idx) => (
                  <div key={idx} className="flex items-center gap-2 rounded-md bg-muted/40 p-2 text-xs">
                    <span className="flex-1 truncate">{pf.file.name}</span>
                    {req.requiresDrugAlcoholTag && (
                      <Select
                        value={pf.tag}
                        onValueChange={(v) => setTag(req.type, idx, v as 'DRUG' | 'ALCOHOL')}
                        disabled={submitting}
                      >
                        <SelectTrigger className="h-7 w-28 text-xs">
                          <SelectValue placeholder="Drug/Alcohol" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DRUG">Drug</SelectItem>
                          <SelectItem value="ALCOHOL">Alcohol</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(req.type, idx)}
                      disabled={submitting}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Remove file"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {files.length < req.max && (
                  <>
                    <input
                      ref={(el) => (fileInputRefs.current[req.type] = el)}
                      type="file"
                      accept={ACCEPTED_TYPES}
                      multiple={req.max > 1}
                      disabled={submitting}
                      className="hidden"
                      onChange={(e) => {
                        addFiles(req.type, req, e.target.files);
                        e.target.value = '';
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      disabled={submitting}
                      onClick={() => fileInputRefs.current[req.type]?.click()}
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Add file{req.max > 1 ? 's' : ''}
                    </Button>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!allMet || submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                Uploading…
              </>
            ) : (
              `Upload & Advance to Step ${targetStep}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
