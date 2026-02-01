import { useIntakeForms } from '@/hooks/useIntakeForms';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText, User, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface IntakeFormTableProps {
  onViewDriver?: (driverId: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  received: 'bg-[hsl(var(--status-info))] text-white',
  processing: 'bg-[hsl(var(--status-warning))] text-white',
  completed: 'bg-[hsl(var(--status-success))] text-white',
};

export function IntakeFormTable({ onViewDriver }: IntakeFormTableProps) {
  const { data: forms, isLoading, error } = useIntakeForms();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Failed to load intake forms
      </div>
    );
  }

  if (!forms || forms.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No intake forms yet</p>
        <p className="text-sm mt-1">Forms will appear here when drivers submit BOLO forms</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Driver Name</TableHead>
            <TableHead>Submission Date</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {forms.map((form) => (
            <TableRow key={form.id}>
              <TableCell className="font-medium">
                {form.driver 
                  ? `${form.driver.first_name} ${form.driver.last_name}`
                  : 'Unknown Driver'
                }
              </TableCell>
              <TableCell>
                {format(new Date(form.submission_date), 'MMM d, yyyy h:mm a')}
              </TableCell>
              <TableCell className="capitalize">{form.source}</TableCell>
              <TableCell>
                <Badge className={STATUS_COLORS[form.status] || 'bg-muted text-muted-foreground'}>
                  {form.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {form.form_pdf_url && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={form.form_pdf_url} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-3 w-3 mr-1" />
                        PDF
                      </a>
                    </Button>
                  )}
                  {form.driver_id && onViewDriver && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onViewDriver(form.driver_id!)}
                    >
                      <User className="h-3 w-3 mr-1" />
                      Driver
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
