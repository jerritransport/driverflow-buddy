import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardSummary {
  total_drivers: number;
  intake_pending: number;
  payment_pending: number;
  sap_pending: number;
  clearinghouse_pending: number;
  test_pending: number;
  completed: number;
  step_1_count: number;
  step_2_count: number;
  step_3_count: number;
  step_4_count: number;
  step_5_count: number;
  step_6_count: number;
  step_7_count: number;
  payment_hold_count: number;
  alcohol_test_required_count: number;
  total_revenue: number;
  total_outstanding: number;
  completed_last_7_days: number;
  completed_last_30_days: number;
  avg_completion_days: number;
  new_drivers_today: number;
  active_last_hour: number;
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dashboard_summary')
        .select('*')
        .single();

      if (error) throw error;
      return data as DashboardSummary;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
