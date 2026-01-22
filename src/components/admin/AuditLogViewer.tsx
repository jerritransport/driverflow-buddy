import { useState } from 'react';
import { useAuditLogs, AuditLogEntry } from '@/hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, FileText, Plus, Pencil, Trash2, Eye, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

const TABLE_OPTIONS = [
  { value: 'all', label: 'All Tables' },
  { value: 'drivers', label: 'Drivers' },
  { value: 'saps', label: 'SAPs' },
  { value: 'clinics', label: 'Clinics' },
  { value: 'payments', label: 'Payments' },
  { value: 'documents', label: 'Documents' },
  { value: 'communications', label: 'Communications' },
];

const OPERATION_OPTIONS = [
  { value: 'all', label: 'All Operations' },
  { value: 'INSERT', label: 'Insert' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' },
];

function getOperationIcon(operation: string) {
  switch (operation) {
    case 'INSERT':
      return <Plus className="h-3.5 w-3.5" />;
    case 'UPDATE':
      return <Pencil className="h-3.5 w-3.5" />;
    case 'DELETE':
      return <Trash2 className="h-3.5 w-3.5" />;
    default:
      return <FileText className="h-3.5 w-3.5" />;
  }
}

function getOperationVariant(operation: string): 'default' | 'secondary' | 'destructive' {
  switch (operation) {
    case 'INSERT':
      return 'default';
    case 'UPDATE':
      return 'secondary';
    case 'DELETE':
      return 'destructive';
    default:
      return 'secondary';
  }
}

export function AuditLogViewer() {
  const [tableFilter, setTableFilter] = useState('all');
  const [operationFilter, setOperationFilter] = useState('all');
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    entry: AuditLogEntry | null;
  }>({ open: false, entry: null });

  const { data: logs, isLoading, refetch, isRefetching } = useAuditLogs({
    table: tableFilter === 'all' ? undefined : tableFilter,
    operation: operationFilter === 'all' ? undefined : operationFilter,
    limit: 200,
  });

  const formatChangedFields = (entry: AuditLogEntry) => {
    if (!entry.changed_fields || entry.changed_fields.length === 0) {
      return entry.operation === 'INSERT' ? 'New record created' : '-';
    }
    return entry.changed_fields.join(', ');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Audit Log
              </CardTitle>
              <CardDescription>
                View all system changes and modifications. Showing {logs?.length || 0} entries.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-3">
            <Select value={tableFilter} onValueChange={setTableFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by table" />
              </SelectTrigger>
              <SelectContent>
                {TABLE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={operationFilter} onValueChange={setOperationFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by operation" />
              </SelectTrigger>
              <SelectContent>
                {OPERATION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Timestamp</TableHead>
                  <TableHead className="w-[100px]">Table</TableHead>
                  <TableHead className="w-[100px]">Operation</TableHead>
                  <TableHead>Changed Fields</TableHead>
                  <TableHead className="w-[120px]">Changed By</TableHead>
                  <TableHead className="w-[80px]">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs?.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-sm">
                      {entry.changed_at
                        ? format(new Date(entry.changed_at), 'MMM d, h:mm a')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {entry.table_name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getOperationVariant(entry.operation)}
                        className="flex w-fit items-center gap-1"
                      >
                        {getOperationIcon(entry.operation)}
                        {entry.operation}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-sm text-muted-foreground">
                      {formatChangedFields(entry)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {entry.changed_by || 'System'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDetailDialog({ open: true, entry })}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {logs?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No audit log entries found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={detailDialog.open}
        onOpenChange={(open) => setDetailDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Audit Log Details
              {detailDialog.entry && (
                <Badge variant={getOperationVariant(detailDialog.entry.operation)}>
                  {detailDialog.entry.operation}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {detailDialog.entry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Table</p>
                  <p className="font-medium">{detailDialog.entry.table_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Record ID</p>
                  <p className="font-mono text-xs">{detailDialog.entry.record_id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Timestamp</p>
                  <p className="font-medium">
                    {detailDialog.entry.changed_at
                      ? format(new Date(detailDialog.entry.changed_at), 'PPpp')
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Changed By</p>
                  <p className="font-medium">{detailDialog.entry.changed_by || 'System'}</p>
                </div>
              </div>

              {detailDialog.entry.changed_fields && detailDialog.entry.changed_fields.length > 0 && (
                <div>
                  <p className="mb-2 text-sm text-muted-foreground">Changed Fields</p>
                  <div className="flex flex-wrap gap-1">
                    {detailDialog.entry.changed_fields.map((field) => (
                      <Badge key={field} variant="secondary">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {detailDialog.entry.old_values && (
                <div>
                  <p className="mb-2 text-sm text-muted-foreground">Old Values</p>
                  <ScrollArea className="h-32 rounded-md border bg-muted/50 p-3">
                    <pre className="text-xs">
                      {JSON.stringify(detailDialog.entry.old_values, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              )}

              {detailDialog.entry.new_values && (
                <div>
                  <p className="mb-2 text-sm text-muted-foreground">New Values</p>
                  <ScrollArea className="h-32 rounded-md border bg-muted/50 p-3">
                    <pre className="text-xs">
                      {JSON.stringify(detailDialog.entry.new_values, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
