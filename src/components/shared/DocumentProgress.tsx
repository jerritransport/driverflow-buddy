import { FileText } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Document types to track
export const DOCUMENT_TYPES = [
  'Intake Form',
  'CDL Photo',
  'Clearinghouse Query',
  'Clearinghouse Consent',
  'SAP Paperwork',
  'Test Result',
  'Chain of Custody',
] as const;

export type DocumentType = typeof DOCUMENT_TYPES[number];

interface DocumentProgressProps {
  documentsUploaded: Record<string, boolean> | null | undefined;
  className?: string;
  showTooltip?: boolean;
}

export function DocumentProgress({ 
  documentsUploaded, 
  className = '',
  showTooltip = true 
}: DocumentProgressProps) {
  const uploaded = documentsUploaded || {};
  const uploadedCount = DOCUMENT_TYPES.filter(doc => uploaded[doc]).length;
  const totalCount = DOCUMENT_TYPES.length;

  const progressContent = (
    <div className={`flex items-center gap-1 text-xs text-muted-foreground ${className}`}>
      <FileText className="h-3 w-3" />
      <span>{uploadedCount}/{totalCount}</span>
    </div>
  );

  if (!showTooltip) {
    return progressContent;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {progressContent}
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[200px]">
        <p className="font-medium mb-1">Documents ({uploadedCount}/{totalCount})</p>
        <ul className="text-xs space-y-0.5">
          {DOCUMENT_TYPES.map((doc) => (
            <li key={doc} className="flex items-center gap-1">
              <span className={uploaded[doc] ? 'text-green-500' : 'text-muted-foreground'}>
                {uploaded[doc] ? '✓' : '○'}
              </span>
              <span className={uploaded[doc] ? '' : 'text-muted-foreground'}>
                {doc}
              </span>
            </li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}
