import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FollowUpDriver } from '@/hooks/useFollowUps';
import { Phone, Calendar, CheckCircle, RefreshCw, Eye } from 'lucide-react';
import { format, isToday, isPast } from 'date-fns';

interface FollowUpCardProps {
  driver: FollowUpDriver;
  onComplete: (driverId: string) => void;
  onReschedule: (driverId: string) => void;
  onView: (driverId: string) => void;
}

export function FollowUpCard({ driver, onComplete, onReschedule, onView }: FollowUpCardProps) {
  const followUpDate = driver.follow_up_date ? new Date(driver.follow_up_date) : null;
  const isOverdue = followUpDate && isPast(followUpDate) && !isToday(followUpDate);
  const isDueToday = followUpDate && isToday(followUpDate);

  return (
    <Card className={`${isOverdue ? 'border-l-4 border-l-destructive' : isDueToday ? 'border-l-4 border-l-[hsl(var(--status-warning))]' : ''}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-foreground">
              {driver.first_name} {driver.last_name}
            </h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <Phone className="h-3 w-3" />
              {driver.phone}
            </div>
          </div>
          {isOverdue && (
            <Badge variant="destructive" className="text-xs">Overdue</Badge>
          )}
          {isDueToday && (
            <Badge className="bg-[hsl(var(--status-warning))] text-white text-xs">Due Today</Badge>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className={isOverdue ? 'text-destructive font-medium' : 'text-foreground'}>
            {followUpDate ? format(followUpDate, 'MMM d, yyyy') : 'No date'}
          </span>
        </div>

        {driver.follow_up_note && (
          <p className="text-sm text-muted-foreground bg-muted/50 rounded p-2">
            {driver.follow_up_note}
          </p>
        )}

        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 gap-1"
            onClick={() => onComplete(driver.id)}
          >
            <CheckCircle className="h-3 w-3" />
            Complete
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 gap-1"
            onClick={() => onReschedule(driver.id)}
          >
            <RefreshCw className="h-3 w-3" />
            Reschedule
          </Button>
          <Button 
            size="sm" 
            variant="default" 
            className="gap-1"
            onClick={() => onView(driver.id)}
          >
            <Eye className="h-3 w-3" />
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
