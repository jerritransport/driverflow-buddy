import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PendingDonorPassDriver } from '@/hooks/usePendingDonorPass';
import { openEscreenPopup } from '@/lib/escreenPopup';
import { ExternalLink, CheckCircle, Wine, Mail, Phone } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatDriverName, formatState, formatCdlNumber } from '@/lib/utils';
import { formatPhoneDisplay } from '@/lib/phoneUtils';

interface PendingDonorPassCardProps {
  driver: PendingDonorPassDriver;
  onViewDriver?: (driverId: string) => void;
}

export function PendingDonorPassCard({ driver, onViewDriver }: PendingDonorPassCardProps) {
  const hasPass = !!driver.donor_pass_number;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div
            className="cursor-pointer hover:text-primary transition-colors"
            onClick={() => onViewDriver?.(driver.id)}
          >
            <h3 className="font-semibold text-foreground">
              {formatDriverName(driver.first_name, driver.middle_name, driver.last_name)}
            </h3>
            <p className="text-sm text-muted-foreground">
              {driver.cdl_number ? `CDL: ${formatCdlNumber(driver.cdl_number)}${driver.cdl_state ? ` (${formatState(driver.cdl_state)})` : ''}` : 'No CDL on file'}
            </p>
          </div>
          {driver.requires_alcohol_test && (
            <Badge variant="outline" className="gap-1">
              <Wine className="h-3 w-3" />
              Drug + Alcohol
            </Badge>
          )}
        </div>

        {/* Contact Info */}
        <div className="space-y-1.5 text-sm">
          {driver.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <a
                href={`mailto:${driver.email}`}
                className="truncate hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {driver.email}
              </a>
            </div>
          )}
          {driver.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <a
                href={`tel:${driver.phone}`}
                className="hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {formatPhoneDisplay(driver.phone)}
              </a>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Waiting since</span>
            <span className="font-medium">
              {formatDistanceToNow(new Date(driver.updated_at), { addSuffix: true })}
            </span>
          </div>
          {hasPass && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Donor pass #</span>
              <span className="font-mono font-medium">{driver.donor_pass_number}</span>
            </div>
          )}
        </div>

        {/* Action */}
        <div className="pt-2 border-t">
          <Button
            size="sm"
            className="w-full gap-1.5"
            variant={hasPass ? 'outline' : 'default'}
            onClick={openEscreenPopup}
          >
            {hasPass ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Pass created — check eScreen
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4" />
                Create a Donor Pass
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
