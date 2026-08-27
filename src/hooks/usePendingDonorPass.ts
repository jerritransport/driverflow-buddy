import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PendingDonorPassDriver {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  cdl_number: string | null;
  cdl_state: string | null;
  status: string;
  donor_pass_number: string | null;
  donor_pass_generated_at: string | null;
  requires_alcohol_test: boolean;
  updated_at: string;
}

interface UsePendingDonorPassOptions {
  search?: string;
}

// Donor Pass is step 5 in the driver workflow (see DRIVER_STEPS in constants.ts).
const DONOR_PASS_STEP = 5;

export function usePendingDonorPass({ search }: UsePendingDonorPassOptions = {}) {
  return useQuery({
    queryKey: ['pending-donor-pass', search],
    queryFn: async () => {
      let query = supabase
        .from('drivers')
        .select('id, first_name, middle_name, last_name, cdl_number, cdl_state, status, donor_pass_number, donor_pass_generated_at, requires_alcohol_test, updated_at')
        .eq('is_hidden', false)
        .eq('current_step', DONOR_PASS_STEP)
        .order('updated_at', { ascending: true });

      if (search) {
        query = query.or(`first_name.ilike.%${search}%,middle_name.ilike.%${search}%,last_name.ilike.%${search}%,cdl_number.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as PendingDonorPassDriver[];
    },
    refetchInterval: 30000,
  });
}
