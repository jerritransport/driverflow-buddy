import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UnpaidIntakeDriver {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  phone: string;
  cdl_number: string | null;
  cdl_state: string | null;
  status: string;
  payment_status: string;
  staff_member_id: string | null;
  updated_at: string;
}

interface UseUnpaidIntakeOptions {
  search?: string;
}

// Intake is step 1 in the driver workflow (see DRIVER_STEPS in constants.ts).
const INTAKE_STEP = 1;

export function useUnpaidIntake({ search }: UseUnpaidIntakeOptions = {}) {
  return useQuery({
    queryKey: ['unpaid-intake', search],
    queryFn: async () => {
      let query = supabase
        .from('drivers')
        .select('id, first_name, middle_name, last_name, email, phone, cdl_number, cdl_state, status, payment_status, staff_member_id, updated_at')
        .eq('is_hidden', false)
        .eq('current_step', INTAKE_STEP)
        .eq('payment_status', 'UNPAID')
        .order('updated_at', { ascending: false });

      if (search) {
        query = query.or(`first_name.ilike.%${search}%,middle_name.ilike.%${search}%,last_name.ilike.%${search}%,cdl_number.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as UnpaidIntakeDriver[];
    },
    refetchInterval: 30000,
  });
}
