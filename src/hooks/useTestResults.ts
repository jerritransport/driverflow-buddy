import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type TestResultFilter = 'pending' | 'completed' | 'all';

export interface DriverTestResult {
  id: string;
  first_name: string;
  last_name: string;
  sample_id: string | null;
  collection_date: string | null;
  test_status: string | null;
  test_type: string | null;
  requires_alcohol_test: boolean;
  urine_result_url: string | null;
  alcohol_result_url: string | null;
  ccf_url: string | null;
  test_result: string | null;
}

interface UseTestResultsOptions {
  filter: TestResultFilter;
  search?: string;
}

export function useTestResults({ filter, search }: UseTestResultsOptions) {
  return useQuery({
    queryKey: ['test-results', filter, search],
    queryFn: async () => {
      let query = supabase
        .from('drivers')
        .select('id, first_name, last_name, sample_id, collection_date, test_status, test_type, requires_alcohol_test, urine_result_url, alcohol_result_url, ccf_url, test_result')
        .not('sample_id', 'is', null) // Only drivers with test samples
        .order('collection_date', { ascending: false, nullsFirst: false });

      // Apply filter
      if (filter === 'pending') {
        query = query.neq('test_status', 'completed');
      } else if (filter === 'completed') {
        query = query.eq('test_status', 'completed');
      }
      // 'all' - no filter

      // Apply search
      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,sample_id.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as DriverTestResult[];
    },
    refetchInterval: 30000,
  });
}

export const TEST_STATUS_FLOW = [
  'pending',
  'received',
  'laboratory',
  'mro',
  'reported',
  'completed',
] as const;

export const TEST_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  received: 'Received',
  laboratory: 'Laboratory',
  mro: 'MRO Review',
  reported: 'Reported',
  completed: 'Completed',
};

export const TEST_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground',
  received: 'bg-[hsl(var(--status-info))] text-white',
  laboratory: 'bg-[hsl(var(--status-warning))] text-white',
  mro: 'bg-[hsl(var(--status-warning))] text-white',
  reported: 'bg-[hsl(var(--status-success))] text-white',
  completed: 'bg-[hsl(var(--status-success))] text-white',
};
