import { useClinicDrivers } from '@/hooks/useClinics';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface ClinicDriversTabProps {
  clinicId: string;
}

export function ClinicDriversTab({ clinicId }: ClinicDriversTabProps) {
  const { data: drivers, isLoading } = useClinicDrivers(clinicId);

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!drivers || drivers.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-muted-foreground">
        No drivers assigned to this clinic.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Driver</TableHead>
            <TableHead>CDL</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Test Scheduled</TableHead>
            <TableHead>Result</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers.map((driver) => (
            <TableRow key={driver.id}>
              <TableCell>
                <div>
                  <p className="font-medium">
                    {driver.first_name} {driver.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">{driver.email}</p>
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm">
                {driver.cdl_number}
              </TableCell>
              <TableCell>
                <StatusBadge status={driver.status} />
              </TableCell>
              <TableCell className="text-sm">
                {driver.test_scheduled_date
                  ? format(new Date(driver.test_scheduled_date), 'MMM d, yyyy')
                  : '-'}
              </TableCell>
              <TableCell>
                {driver.test_result ? (
                  <span
                    className={`text-sm font-medium ${
                      driver.test_result === 'NEGATIVE'
                        ? 'text-primary'
                        : driver.test_result === 'POSITIVE'
                        ? 'text-destructive'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {driver.test_result}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">Pending</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
