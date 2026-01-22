import { useDriverDocuments } from '@/hooks/useDriverDetails';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { FileText, Download, AlertCircle, File, Image, FileSpreadsheet } from 'lucide-react';

interface DocumentsTabProps {
  driverId: string;
}

export function DocumentsTab({ driverId }: DocumentsTabProps) {
  const { data: documents, isLoading, error } = useDriverDocuments(driverId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive bg-destructive/10 p-4">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <p className="text-sm text-destructive">Failed to load documents</p>
      </div>
    );
  }

  if (!documents?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <FileText className="mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No documents uploaded</p>
        <Button variant="outline" size="sm" className="mt-4">
          Upload Document
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
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
          <Button variant="ghost" size="icon" className="shrink-0">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}

function DocumentIcon({ mimeType }: { mimeType: string | null }) {
  if (mimeType?.startsWith('image/')) {
    return <Image className="h-5 w-5 text-primary" />;
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
