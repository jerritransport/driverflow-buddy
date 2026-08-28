import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Sap {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  organization: string | null;
  certification_number: string | null;
  certification_expiration: string | null;
  is_active: boolean;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  total_drivers_referred: number;
  created_at: string;
  updated_at: string;
}

export interface SapPerformance {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  organization: string | null;
  is_active: boolean;
  total_drivers_referred: number;
  total_drivers_assigned: number;
  paperwork_received_count: number;
  rtd_completed_count: number;
  avg_response_days: number | null;
  alcohol_test_rate_percent: number | null;
  last_updated: string;
}

export interface SapDriver {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  cdl_number: string;
  current_step: number;
  status: string;
  payment_status: string;
  sap_paperwork_received_at: string | null;
  created_at: string;
}

export type CreateSapData = Omit<Sap, 'id' | 'created_at' | 'updated_at' | 'total_drivers_referred'>;
export type UpdateSapData = Partial<CreateSapData>;

export function useSaps() {
  return useQuery({
    queryKey: ['saps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saps')
        .select('*')
        .order('last_name', { ascending: true });

      if (error) throw error;
      return data as Sap[];
    },
    refetchInterval: 30000,
  });
}

export function useSapPerformance() {
  return useQuery({
    queryKey: ['sap-performance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sap_performance')
        .select('*')
        .order('total_drivers_assigned', { ascending: false });

      if (error) throw error;
      return data as SapPerformance[];
    },
    refetchInterval: 30000,
  });
}

export function useSap(id: string | undefined) {
  return useQuery({
    queryKey: ['sap', id],
    queryFn: async () => {
      if (!id) throw new Error('SAP ID is required');
      
      const { data, error } = await supabase
        .from('saps')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Sap;
    },
    enabled: !!id,
  });
}

export function useSapDrivers(sapId: string | undefined) {
  return useQuery({
    queryKey: ['sap-drivers', sapId],
    queryFn: async () => {
      if (!sapId) throw new Error('SAP ID is required');
      
      const { data, error } = await supabase
        .from('drivers')
        .select('id, first_name, last_name, email, phone, cdl_number, current_step, status, payment_status, sap_paperwork_received_at, created_at')
        .eq('sap_id', sapId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SapDriver[];
    },
    enabled: !!sapId,
  });
}

export function useCreateSap() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateSapData) => {
      const { data: newSap, error } = await supabase
        .from('saps')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return newSap;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saps'] });
      queryClient.invalidateQueries({ queryKey: ['sap-performance'] });
    },
  });
}

export function useUpdateSap() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sapId, updates }: { sapId: string; updates: UpdateSapData }) => {
      const { data, error } = await supabase
        .from('saps')
        .update(updates)
        .eq('id', sapId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { sapId }) => {
      queryClient.invalidateQueries({ queryKey: ['saps'] });
      queryClient.invalidateQueries({ queryKey: ['sap', sapId] });
      queryClient.invalidateQueries({ queryKey: ['sap-performance'] });
    },
  });
}

/**
 * Merges duplicate SAP records into one "keeper" record: reassigns every
 * driver pointing at the duplicate SAPs over to the keeper, then removes
 * the duplicate SAP rows (falling back to deactivating them if a hard
 * delete is blocked for any reason).
 */
export function useMergeSaps() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      keeperId,
      duplicateIds,
      keeperUpdates,
    }: {
      keeperId: string;
      duplicateIds: string[];
      keeperUpdates?: Partial<Pick<Sap, 'first_name' | 'last_name' | 'email' | 'organization'>>;
    }) => {
      const idsToMerge = duplicateIds.filter((id) => id !== keeperId);

      if (idsToMerge.length > 0) {
        const { error: reassignError } = await supabase
          .from('drivers')
          .update({ sap_id: keeperId })
          .in('sap_id', idsToMerge);
        if (reassignError) throw reassignError;

        const { error: deleteError } = await supabase
          .from('saps')
          .delete()
          .in('id', idsToMerge);

        if (deleteError) {
          // Fall back to deactivating if a hard delete is blocked (e.g. other references).
          const { error: deactivateError } = await supabase
            .from('saps')
            .update({ is_active: false })
            .in('id', idsToMerge);
          if (deactivateError) throw deactivateError;
        }
      }

      if (keeperUpdates && Object.keys(keeperUpdates).length > 0) {
        const { error: updateError } = await supabase
          .from('saps')
          .update(keeperUpdates)
          .eq('id', keeperId);
        if (updateError) throw updateError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saps'] });
      queryClient.invalidateQueries({ queryKey: ['sap-performance'] });
      queryClient.invalidateQueries({ queryKey: ['sap-drivers'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['drivers-by-step'] });
      queryClient.invalidateQueries({ queryKey: ['drivers-all-filtered'] });
      queryClient.invalidateQueries({ queryKey: ['drivers-paginated'] });
    },
  });
}
