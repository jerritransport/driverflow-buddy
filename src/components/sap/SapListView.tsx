import { SapPerformance } from '@/hooks/useSaps';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, TrendingUp, Users, CheckCircle2, Clock } from 'lucide-react';

interface SapListViewProps {
  saps: SapPerformance[];
  onSelectSap: (sapId: string) => void;
}

export function SapListView({ saps, onSelectSap }: SapListViewProps) {
  const getCompletionRate = (sap: SapPerformance) => {
    if (!sap.total_drivers_assigned || sap.total_drivers_assigned === 0) return 0;
    return Math.round((sap.rtd_completed_count / sap.total_drivers_assigned) * 100);
  };

  const getPaperworkRate = (sap: SapPerformance) => {
    if (!sap.total_drivers_assigned || sap.total_drivers_assigned === 0) return 0;
    return Math.round((sap.paperwork_received_count / sap.total_drivers_assigned) * 100);
  };

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Users className="h-3.5 w-3.5" />
                Drivers
              </div>
            </TableHead>
            <TableHead className="text-center">
              <div className="flex items-center justify-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Paperwork
              </div>
            </TableHead>
            <TableHead className="text-center">
              <div className="flex items-center justify-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                Completion
              </div>
            </TableHead>
            <TableHead className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Avg Response
              </div>
            </TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {saps.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                No SAPs found
              </TableCell>
            </TableRow>
          ) : (
            saps.map((sap) => (
              <TableRow
                key={sap.id}
                className="cursor-pointer"
                onClick={() => onSelectSap(sap.id)}
              >
                <TableCell>
                  <div>
                    <p className="font-medium">{sap.first_name} {sap.last_name}</p>
                    <p className="text-xs text-muted-foreground">{sap.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {sap.organization || '—'}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={sap.is_active ? 'default' : 'secondary'}>
                    {sap.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-medium">{sap.total_drivers_assigned || 0}</span>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center">
                    <span className="font-medium">{sap.paperwork_received_count || 0}</span>
                    <span className="text-xs text-muted-foreground">
                      {getPaperworkRate(sap)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center">
                    <span className="font-medium">{sap.rtd_completed_count || 0}</span>
                    <span className="text-xs text-muted-foreground">
                      {getCompletionRate(sap)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-sm">
                    {sap.avg_response_days != null
                      ? `${sap.avg_response_days.toFixed(1)} days`
                      : '—'}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSap(sap.id);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
