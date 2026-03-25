import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UnmatchedPayment {
  id: string;
  stripe_payment_id: string | null;
  payer_name: string | null;
  payer_email: string | null;
  amount: number | null;
  payment_date: string | null;
  matched_driver_id: string | null;
  matched_at: string | null;
  matched_by: string | null;
  status: string;
  created_at: string;
}

export function useUnmatchedPayments(statusFilter: string = 'unmatched') {
  return useQuery({
    queryKey: ['unmatched-payments', statusFilter],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unmatched_payments')
        .select('*')
        .eq('status', statusFilter)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as UnmatchedPayment[];
    },
  });
}

export function useMatchPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ paymentId, driverId, userId }: { paymentId: string; driverId: string; userId: string }) => {
      const { error } = await supabase
        .from('unmatched_payments')
        .update({
          matched_driver_id: driverId,
          matched_at: new Date().toISOString(),
          matched_by: userId,
          status: 'matched',
        })
        .eq('id', paymentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unmatched-payments'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}

export function useMergePayments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sourceId, targetId }: { sourceId: string; targetId: string }) => {
      // Get source payment
      const { data: source, error: fetchError } = await supabase
        .from('unmatched_payments')
        .select('amount')
        .eq('id', sourceId)
        .single();
      if (fetchError) throw fetchError;

      // Get target payment
      const { data: target, error: fetchError2 } = await supabase
        .from('unmatched_payments')
        .select('amount')
        .eq('id', targetId)
        .single();
      if (fetchError2) throw fetchError2;

      // Update target with combined amount
      const { error: updateError } = await supabase
        .from('unmatched_payments')
        .update({ amount: (target.amount || 0) + (source.amount || 0) })
        .eq('id', targetId);
      if (updateError) throw updateError;

      // Mark source as merged
      const { error: mergeError } = await supabase
        .from('unmatched_payments')
        .update({ status: 'merged' })
        .eq('id', sourceId);
      if (mergeError) throw mergeError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unmatched-payments'] });
    },
  });
}
