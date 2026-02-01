import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DriverTestResult, TEST_STATUS_LABELS, TEST_STATUS_COLORS } from '@/hooks/useTestResults';
import { Download, FileText, FlaskConical, Wine, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface TestResultCardProps {
  result: DriverTestResult;
  onViewDriver?: (driverId: string) => void;
}

export function TestResultCard({ result, onViewDriver }: TestResultCardProps) {
  const status = result.test_status || 'pending';
  const statusLabel = TEST_STATUS_LABELS[status] || status;
  const statusColor = TEST_STATUS_COLORS[status] || 'bg-muted text-muted-foreground';

  const testType = result.requires_alcohol_test ? 'Drug + Alcohol' : 'Drug Only';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div 
            className="cursor-pointer hover:text-primary transition-colors"
            onClick={() => onViewDriver?.(result.id)}
          >
            <h3 className="font-semibold text-foreground">
              {result.first_name} {result.last_name}
            </h3>
            <p className="text-sm text-muted-foreground">{testType}</p>
          </div>
          <Badge className={statusColor}>
            {statusLabel}
          </Badge>
        </div>

        {/* Test Details */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sample ID (CCF)</span>
            <span className="font-mono font-medium">{result.sample_id || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Collection Date</span>
            <span className="font-medium">
              {result.collection_date 
                ? format(new Date(result.collection_date), 'MMM d, yyyy')
                : 'N/A'
              }
            </span>
          </div>
          {result.test_result && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Result</span>
              <Badge variant={result.test_result === 'NEGATIVE' ? 'default' : 'destructive'}>
                {result.test_result}
              </Badge>
            </div>
          )}
        </div>

        {/* Download Buttons */}
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <DownloadButton 
            url={result.urine_result_url}
            label="Urine Result"
            icon={<FlaskConical className="h-3 w-3" />}
          />
          {result.requires_alcohol_test && (
            <DownloadButton 
              url={result.alcohol_result_url}
              label="Alcohol Result"
              icon={<Wine className="h-3 w-3" />}
            />
          )}
          <DownloadButton 
            url={result.ccf_url}
            label="CCF"
            icon={<FileText className="h-3 w-3" />}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function DownloadButton({ url, label, icon }: { url: string | null; label: string; icon: React.ReactNode }) {
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
