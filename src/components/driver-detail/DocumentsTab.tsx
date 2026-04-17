import { useRef, useState } from 'react';
import { useDriverDocuments } from '@/hooks/useDriverDetails';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import {
  FileText,
  Download,
  AlertCircle,
  File,
  Image as ImageIcon,
  FileSpreadsheet,
  Upload,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

interface DocumentsTabProps {
  driverId: string;
}

const DOCUMENT_TYPES = [
  { value: 'BOLO_FORM', label: 'BOLO Form' },
  { value: 'SAP_PAPERWORK', label: 'SAP Paperwork' },
  { value: 'TEST_RESULT', label: 'Test Result' },
  { value: 'CDL_COPY', label: 'CDL Copy' },
  { value: 'DONOR_PASS', label: 'Donor Pass' },
  { value: 'OTHER', label: 'Other' },
];

const STORAGE_BUCKET = 'rtd-documents';
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export function DocumentsTab({ driverId }: DocumentsTabProps) {
  const { data: documents, isLoading, error } = useDriverDocuments(driverId);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<string>('OTHER');
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleSelectFile = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting same file
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 20MB.',
        variant: 'destructive',
      });
      return;
    }
    setPendingFile(file);
    setDocType('OTHER');
  };

  const handleUpload = async () => {
    if (!pendingFile) return;
    setUploading(true);
    try {
      const ext = pendingFile.name.split('.').pop() ?? 'bin';
      const path = `${driverId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, pendingFile, {
          contentType: pendingFile.type || 'application/octet-stream',
          upsert: false,
        });
      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from('documents').insert({
        driver_id: driverId,
        document_type: docType,
        file_name: pendingFile.name,
        file_size_bytes: pendingFile.size,
        mime_type: pendingFile.type || null,
        storage_bucket: STORAGE_BUCKET,
        storage_path: path,
        uploaded_by: user?.email ?? null,
      });
      if (insertError) {
        // Clean up orphan file
        await supabase.storage.from(STORAGE_BUCKET).remove([path]);
        throw insertError;
      }

      toast({ title: 'Document uploaded' });
      setPendingFile(null);
      await queryClient.invalidateQueries({ queryKey: ['driver-documents', driverId] });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      toast({ title: 'Upload failed', description: message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (docId: string, bucket: string, path: string, fileName: string) => {
    setDownloadingId(docId);
    try {
      const { data, error: dlError } = await supabase.storage
        .from(bucket || STORAGE_BUCKET)
        .createSignedUrl(path, 60);
      if (dlError) throw dlError;
      if (!data?.signedUrl) throw new Error('No URL returned');

      // Trigger download
      const a = document.createElement('a');
      a.href = data.signedUrl;
      a.download = fileName;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Download failed';
      toast({ title: 'Download failed', description: message, variant: 'destructive' });
    } finally {
      setDownloadingId(null);
    }
  };

  const renderUploadButton = (variant: 'default' | 'outline' = 'outline', size: 'sm' | 'default' = 'sm') => (
    <Button variant={variant} size={size} onClick={handleSelectFile} type="button">
      <Upload className="mr-2 h-4 w-4" />
      Upload Document
    </Button>
  );

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 rounded-lg border border-destructive bg-destructive/10 p-4">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <p className="text-sm text-destructive">Failed to load documents</p>
        </div>
      ) : !documents?.length ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <FileText className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No documents uploaded</p>
          <div className="mt-4">{renderUploadButton()}</div>
        </div>
      ) : (
        <>
          <div className="flex justify-end">{renderUploadButton()}</div>
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <DocumentIcon mimeType={doc.mime_type} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{doc.file_name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <DocumentTypeBadge type={doc.document_type} />
                  <span>•</span>
                  <span>
                    {doc.uploaded_at
                      ? format(new Date(doc.uploaded_at), 'MMM d, yyyy')
                      : 'Unknown date'}
                  </span>
                  {doc.file_size_bytes && (
                    <>
                      <span>•</span>
                      <span>{formatFileSize(doc.file_size_bytes)}</span>
                    </>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() =>
                  handleDownload(
                    doc.id,
                    (doc as { storage_bucket?: string }).storage_bucket || STORAGE_BUCKET,
                    doc.storage_path,
                    doc.file_name,
                  )
                }
                disabled={downloadingId === doc.id}
              >
                {downloadingId === doc.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </>
      )}

      <Dialog open={!!pendingFile} onOpenChange={(o) => !o && !uploading && setPendingFile(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Choose a document type for <span className="font-medium">{pendingFile?.name}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="doc-type">Document Type</Label>
            <Select value={docType} onValueChange={setDocType} disabled={uploading}>
              <SelectTrigger id="doc-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {pendingFile && (
              <p className="text-xs text-muted-foreground">
                {formatFileSize(pendingFile.size)} · {pendingFile.type || 'unknown type'}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingFile(null)} disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DocumentIcon({ mimeType }: { mimeType: string | null }) {
  if (mimeType?.startsWith('image/')) {
    return <ImageIcon className="h-5 w-5 text-primary" />;
  }
  if (mimeType?.includes('spreadsheet') || mimeType?.includes('excel')) {
    return <FileSpreadsheet className="h-5 w-5 text-primary" />;
  }
  return <File className="h-5 w-5 text-primary" />;
}

function DocumentTypeBadge({ type }: { type: string }) {
  const labels: Record<string, string> = {
    BOLO_FORM: 'BOLO Form',
    SAP_PAPERWORK: 'SAP Paperwork',
    TEST_RESULT: 'Test Result',
    CDL_COPY: 'CDL Copy',
    DONOR_PASS: 'Donor Pass',
    OTHER: 'Other',
  };

  return (
    <Badge variant="outline" className="text-[10px]">
      {labels[type] || type}
    </Badge>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
