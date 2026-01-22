import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DriverAlert {
  id: string;
  first_name: string;
  last_name: string;
  cdl_number: string;
  current_step: number;
  status: string;
  alert_reason: string;
  priority: 'high' | 'medium' | 'low';
  days_since_update: number;
}

export interface RecentActivity {
  related_id: string;
  related_name: string;
  activity_type: string;
  activity_description: string;
  activity_status: string;
  activity_timestamp: string;
}

async function fetchDriverAlerts(): Promise<DriverAlert[]> {
  const { data, error } = await supabase
    .from('drivers_needing_attention')
    .select('*')
    .order('priority', { ascending: true })
    .limit(10);

  if (error) throw error;
  
  return (data ?? []).map((item) => ({
    id: item.id as string,
    first_name: item.first_name as string,
    last_name: item.last_name as string,
    cdl_number: item.cdl_number as string,
    current_step: item.current_step as number,
    status: item.status as string,
    alert_reason: item.alert_reason as string,
    priority: item.priority as 'high' | 'medium' | 'low',
    days_since_update: Number(item.days_since_update) || 0,
  }));
}

async function fetchRecentActivity(): Promise<RecentActivity[]> {
  const { data, error } = await supabase
    .from('recent_activity')
    .select('*')
    .order('activity_timestamp', { ascending: false })
    .limit(10);

  if (error) throw error;
  
  return (data ?? []).map((item) => ({
    related_id: item.related_id as string,
    related_name: item.related_name as string,
    activity_type: item.activity_type as string,
    activity_description: item.activity_description as string,
    activity_status: item.activity_status as string,
    activity_timestamp: item.activity_timestamp as string,
  }));
}

export function useDriverAlerts() {
  return useQuery({
    queryKey: ['notifications', 'driver-alerts'],
    queryFn: fetchDriverAlerts,
    staleTime: 60000, // 1 minute
    refetchInterval: 60000,
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['notifications', 'recent-activity'],
    queryFn: fetchRecentActivity,
    staleTime: 60000,
    refetchInterval: 60000,
  });
}

export function useNotifications() {
  const alerts = useDriverAlerts();
  const activity = useRecentActivity();

  return {
    alerts: alerts.data ?? [],
    activity: activity.data ?? [],
    isLoading: alerts.isLoading || activity.isLoading,
    totalCount: (alerts.data?.length ?? 0) + (activity.data?.length ?? 0),
    urgentCount: alerts.data?.filter((a) => a.priority === 'high').length ?? 0,
  };
}
