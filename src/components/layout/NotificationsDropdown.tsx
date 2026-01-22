import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useNotifications, DriverAlert, RecentActivity } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import {
  Bell,
  AlertTriangle,
  Clock,
  Activity,
  User,
  ChevronRight,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { alerts, activity, isLoading, urgentCount } = useNotifications();

  const handleAlertClick = (alert: DriverAlert) => {
    setOpen(false);
    navigate(`/drivers?selected=${alert.id}`);
  };

  const handleActivityClick = (item: RecentActivity) => {
    setOpen(false);
    if (item.related_id) {
      navigate(`/drivers?selected=${item.related_id}`);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-[hsl(var(--payment-hold))]" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/10 border-destructive/20';
      case 'medium':
        return 'bg-[hsl(var(--payment-hold))]/10 border-[hsl(var(--payment-hold))]/20';
      default:
        return 'bg-muted border-border';
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {urgentCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {urgentCount > 9 ? '9+' : urgentCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="font-semibold">Notifications</h4>
          {urgentCount > 0 && (
            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
              {urgentCount} urgent
            </span>
          )}
        </div>

        <Tabs defaultValue="alerts" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="alerts"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Alerts ({alerts.length})
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Activity ({activity.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="m-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="h-10 w-10 text-[hsl(var(--status-success))] mb-2" />
                <p className="text-sm font-medium">All caught up!</p>
                <p className="text-xs text-muted-foreground">No drivers need attention right now</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-1 p-2">
                  {alerts.map((alert) => (
                    <button
                      key={alert.id}
                      onClick={() => handleAlertClick(alert)}
                      className={`w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent ${getPriorityBg(alert.priority)}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">{getPriorityIcon(alert.priority)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">
                              {alert.first_name} {alert.last_name}
                            </p>
                            <code className="rounded bg-muted px-1 py-0.5 text-[10px]">
                              {alert.cdl_number}
                            </code>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {alert.alert_reason}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Step {alert.current_step} • {alert.days_since_update} days since update
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="activity" className="m-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : activity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Activity className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">No recent activity</p>
                <p className="text-xs text-muted-foreground">Activity will appear here as changes occur</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-1 p-2">
                  {activity.map((item, index) => (
                    <button
                      key={`${item.related_id}-${index}`}
                      onClick={() => handleActivityClick(item)}
                      className="w-full rounded-lg border bg-card p-3 text-left transition-colors hover:bg-accent"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.related_name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {item.activity_description}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {item.activity_timestamp
                              ? formatDistanceToNow(new Date(item.activity_timestamp), { addSuffix: true })
                              : 'Unknown time'}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>

        <Separator />
        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full justify-center text-sm"
            onClick={() => {
              setOpen(false);
              navigate('/drivers?filter=needs_attention');
            }}
          >
            View all drivers needing attention
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
