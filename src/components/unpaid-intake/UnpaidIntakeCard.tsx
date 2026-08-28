import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UnpaidIntakeDriver } from '@/hooks/useUnpaidIntake';
import { formatDriverName, formatState, formatCdlNumber } from '@/lib/utils';
import { formatPhoneDisplay } from '@/lib/phoneUtils';
import { Mail, Phone, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface UnpaidIntakeCardProps {
  driver: UnpaidIntakeDriver;
  onViewDriver?: (driverId: string) => void;
}

export function UnpaidIntakeCard({ driver, onViewDriver }: UnpaidIntakeCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div
          className="cursor-pointer hover:text-primary transition-colors"
          onClick={() => onViewDriver?.(driver.id)}
        >
          <h3 className="font-semibold text-foreground">
            {formatDriverName(driver.first_name, driver.middle_name, driver.last_name)}
          </h3>
          <p className="text-sm text-muted-foreground">
            {driver.cdl_number
              ? `CDL: ${formatCdlNumber(driver.cdl_number)}${driver.cdl_state ? ` (${formatState(driver.cdl_state)})` : ''}`
              : 'No CDL on file'}
          </p>
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
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Signed up</span>
          <span className="font-medium">
            {formatDistanceToNow(new Date(driver.updated_at), { addSuffix: true })}
          </span>
        </div>

        {/* Action */}
        <div className="pt-2 border-t">
          <Button
            size="sm"
            className="w-full gap-1.5"
            onClick={() => onViewDriver?.(driver.id)}
          >
            <DollarSign className="h-4 w-4" />
            Record Payment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
