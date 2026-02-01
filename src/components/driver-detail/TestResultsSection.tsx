import { Driver } from '@/hooks/useDrivers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, Wine, FileText, Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface TestResultsSectionProps {
  driver: Driver;
}

const TEST_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  received: 'Received',
  laboratory: 'Laboratory',
  mro: 'MRO Review',
  reported: 'Reported',
  completed: 'Completed',
};

const TEST_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground',
  received: 'bg-[hsl(var(--status-info))] text-white',
  laboratory: 'bg-[hsl(var(--status-warning))] text-white',
  mro: 'bg-[hsl(var(--status-warning))] text-white',
  reported: 'bg-[hsl(var(--status-success))] text-white',
  completed: 'bg-[hsl(var(--status-success))] text-white',
};

export function TestResultsSection({ driver }: TestResultsSectionProps) {
  // Type assertion for new fields that may not be in the Driver interface yet
  const driverWithTestFields = driver as Driver & {
    sample_id?: string | null;
    collection_date?: string | null;
    test_status?: string | null;
    urine_result_url?: string | null;
    alcohol_result_url?: string | null;
    ccf_url?: string | null;
  };

  const status = driverWithTestFields.test_status || 'pending';
  const statusLabel = TEST_STATUS_LABELS[status] || status;
  const statusColor = TEST_STATUS_COLORS[status] || 'bg-muted text-muted-foreground';

  // Only show if driver has a sample ID (has been tested)
  if (!driverWithTestFields.sample_id) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FlaskConical className="h-4 w-4" />
          Test Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Info */}
        <div className="grid gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sample ID (CCF)</span>
            <span className="font-mono font-medium">{driverWithTestFields.sample_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Collection Date</span>
            <span className="font-medium">
              {driverWithTestFields.collection_date 
                ? format(new Date(driverWithTestFields.collection_date), 'MMM d, yyyy')
                : 'N/A'
              }
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge className={statusColor}>{statusLabel}</Badge>
          </div>
          {driver.test_result && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Result</span>
              <Badge variant={driver.test_result === 'NEGATIVE' ? 'default' : 'destructive'}>
                {driver.test_result}
              </Badge>
            </div>
          )}
        </div>

        {/* Download Buttons */}
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <DownloadButton 
            url={driverWithTestFields.urine_result_url}
            label="Urine Result"
            icon={<FlaskConical className="h-3 w-3" />}
          />
          {driver.requires_alcohol_test && (
            <DownloadButton 
              url={driverWithTestFields.alcohol_result_url}
              label="Alcohol Result"
              icon={<Wine className="h-3 w-3" />}
            />
          )}
          <DownloadButton 
            url={driverWithTestFields.ccf_url}
            label="CCF"
            icon={<FileText className="h-3 w-3" />}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function DownloadButton({ url, label, icon }: { url?: string | null; label: string; icon: React.ReactNode }) {
  if (!url) {
    return (
      <Button size="sm" variant="outline" disabled className="gap-1 text-muted-foreground">
        <Loader2 className="h-3 w-3" />
        {label}: Pending
      </Button>
    );
  }

  return (
    <Button size="sm" variant="outline" className="gap-1" asChild>
      <a href={url} target="_blank" rel="noopener noreferrer">
        {icon}
        {label}
        <Download className="h-3 w-3 ml-1" />
      </a>
    </Button>
  );
}
