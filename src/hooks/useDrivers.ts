import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSearchParams } from 'react-router-dom';

export interface Driver {
  id: string;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  email: string;
  phone: string;
  gender: string | null;
  date_of_birth: string | null;
  cdl_number: string | null;
  cdl_state: string | null;
  cdl_expiration: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  employer_name: string | null;
  employer_contact: string | null;
  status: string;
  current_step: number;
  payment_status: string;
  payment_hold: boolean;
  amount_due: number;
  amount_paid: number;
  requires_alcohol_test: boolean;
  sap_id: string | null;
  tenant_id: string | null;
  test_clinic_id: string | null;
  donor_pass_number: string | null;
  donor_pass_generated_at: string | null;
  test_scheduled_date: string | null;
  test_completed_at: string | null;
  test_result: string | null;
  test_result_date: string | null;
  test_type: string | null;
  clearinghouse_prohibited: boolean;
  clearinghouse_query_conducted_at: string | null;
  clearinghouse_query_result: string | null;
  clearinghouse_designation_accepted: boolean;
  sap_paperwork_received_at: string | null;
  rtd_completed: boolean;
  rtd_completed_at: string | null;
  rtd_reported_to_fmcsa_at: string | null;
  follow_up_date: string | null;
  follow_up_note: string | null;
  documents_uploaded: Record<string, boolean> | null;
  created_at: string;
  updated_at: string;
  // Joined field
  tenant_name?: string;
}

interface UseDriversOptions {
  step?: number;
  status?: string;
  paymentStatus?: string;
  search?: string;
  limit?: number;
}

export function useDrivers(options: UseDriversOptions = {}) {
  const [searchParams] = useSearchParams();
  const searchFromUrl = searchParams.get('search');
  
  const { step, status, paymentStatus, search = searchFromUrl, limit = 100 } = options;

  return useQuery({
    queryKey: ['drivers', { step, status, paymentStatus, search, limit }],
    queryFn: async () => {
      let query = supabase
        .from('drivers')
        .select('*, tenants:tenant_id(company_name)')
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (step !== undefined) {
        query = query.eq('current_step', step);
      }

      if (status) {
        query = query.eq('status', status);
      }

      if (paymentStatus) {
        query = query.eq('payment_status', paymentStatus);
      }

      if (search) {
        query = query.or(
          `first_name.ilike.%${search}%,last_name.ilike.%${search}%,cdl_number.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      // Flatten tenant name
      return (data as any[]).map(d => ({
        ...d,
        tenant_name: d.tenants?.company_name || null,
        tenants: undefined,
      })) as Driver[];
    },
    refetchInterval: 30000,
  });
}

export function useDriver(id: string | undefined) {
  return useQuery({
    queryKey: ['driver', id],
    queryFn: async () => {
      if (!id) throw new Error('Driver ID is required');

      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Driver;
    },
    enabled: !!id,
  });
}

export function useDriversByStep() {
  return useQuery({
    queryKey: ['drivers-by-step'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('drivers')
        .select('id, first_name, last_name, cdl_number, status, current_step, payment_status, payment_hold, updated_at, requires_alcohol_test, follow_up_date, documents_uploaded')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Group by step
      const byStep: Record<number, Driver[]> = {
        1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []
      };
      
      (data as Driver[]).forEach(driver => {
        const step = driver.current_step;
        if (byStep[step]) {
          byStep[step].push(driver);
        }
      });

      return byStep;
    },
    refetchInterval: 30000,
  });
}
