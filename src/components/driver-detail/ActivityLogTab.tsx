import { useDriverActivity } from '@/hooks/useDriverDetails';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Activity, AlertCircle, ArrowRight, Edit, Plus, Trash } from 'lucide-react';
import { STATUS_LABELS } from '@/lib/constants';

interface ActivityLogTabProps {
  driverId: string;
}

export function ActivityLogTab({ driverId }: ActivityLogTabProps) {
  const { data: activities, isLoading, error } = useDriverActivity(driverId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive bg-destructive/10 p-4">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <p className="text-sm text-destructive">Failed to load activity log</p>
      </div>
    );
  }

  if (!activities?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Activity className="mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No activity recorded</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-0">
      {/* Timeline line */}
      <div className="absolute left-[15px] top-2 h-[calc(100%-16px)] w-px bg-border" />

      {activities.map((activity, index) => (
        <div key={activity.id} className="relative flex gap-4 pb-4">
          {/* Timeline dot */}
          <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background">
            <OperationIcon operation={activity.operation} />
          </div>

          <div className="flex-1 pt-1">
            <p className="text-sm font-medium">
              {describeActivity(activity)}
            </p>
            {activity.changed_fields && activity.changed_fields.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {activity.changed_fields.slice(0, 4).map((field) => (
                  <span
                    key={field}
                    className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                  >
                    {formatFieldName(field)}
                  </span>
                ))}
                {activity.changed_fields.length > 4 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{activity.changed_fields.length - 4} more
                  </span>
                )}
              </div>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {activity.changed_at
                ? formatDistanceToNow(new Date(activity.changed_at), { addSuffix: true })
                : 'Unknown time'}
              {activity.changed_by && ` by ${activity.changed_by}`}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function OperationIcon({ operation }: { operation: string }) {
  switch (operation.toUpperCase()) {
    case 'INSERT':
      return <Plus className="h-4 w-4 text-[hsl(var(--status-success))]" />;
    case 'UPDATE':
      return <Edit className="h-4 w-4 text-primary" />;
    case 'DELETE':
      return <Trash className="h-4 w-4 text-destructive" />;
    default:
      return <ArrowRight className="h-4 w-4 text-muted-foreground" />;
  }
}

function describeActivity(activity: { 
  operation: string; 
  changed_fields: string[] | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
}): string {
  const operation = activity.operation.toUpperCase();

  if (operation === 'INSERT') {
    return 'Driver record created';
  }

  if (operation === 'DELETE') {
    return 'Driver record deleted';
  }

  // For updates, try to create a meaningful description
  if (activity.changed_fields?.includes('status') && activity.new_values?.status) {
    const newStatus = activity.new_values.status as string;
    const label = STATUS_LABELS[newStatus] || newStatus;
    return `Status changed to "${label}"`;
  }

  if (activity.changed_fields?.includes('current_step') && activity.new_values?.current_step) {
    return `Advanced to Step ${activity.new_values.current_step}`;
  }

  if (activity.changed_fields?.includes('payment_status')) {
    return `Payment status updated`;
  }

  if (activity.changed_fields?.length === 1) {
    return `${formatFieldName(activity.changed_fields[0])} updated`;
  }

  return `Driver information updated`;
}

function formatFieldName(field: string): string {
  return field
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
