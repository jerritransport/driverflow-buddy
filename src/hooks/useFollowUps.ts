import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type FollowUpFilter = 'today' | 'upcoming' | 'overdue' | 'all';

export interface FollowUpDriver {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  phone: string;
  email: string;
  current_step: number;
  status: string;
  follow_up_date: string | null;
  follow_up_note: string | null;
}

interface UseFollowUpsOptions {
  filter: FollowUpFilter;
  search?: string;
}

export function useFollowUps({ filter, search }: UseFollowUpsOptions) {
  return useQuery({
    queryKey: ['follow-ups', filter, search],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      let query = supabase
        .from('drivers')
        .select('id, first_name, middle_name, last_name, phone, email, current_step, status, follow_up_date, follow_up_note')
        .eq('is_hidden', false)
        .or('follow_up_date.not.is.null,status.ilike.PAYMENT_HOLD,status.ilike.FOLLOW_UP')
        .order('follow_up_date', { ascending: true, nullsFirst: false });

      // Apply filter
      if (filter === 'today') {
        query = query.eq('follow_up_date', today);
      } else if (filter === 'upcoming') {
        query = query.gt('follow_up_date', today);
      } else if (filter === 'overdue') {
        query = query.lt('follow_up_date', today);
      }
      // 'all' - no date filter

      // Apply search
      if (search) {
        query = query.or(`first_name.ilike.%${search}%,middle_name.ilike.%${search}%,last_name.ilike.%${search}%,phone.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as FollowUpDriver[];
    },
    refetchInterval: 30000,
  });
}

export function useFollowUpStats() {
  return useQuery({
    queryKey: ['follow-up-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      const weekEnd = weekFromNow.toISOString().split('T')[0];

      // Get all follow-ups in one query
      const { data, error } = await supabase
        .from('drivers')
        .select('follow_up_date, status')
        .eq('is_hidden', false)
        .or('follow_up_date.not.is.null,status.ilike.PAYMENT_HOLD,status.ilike.FOLLOW_UP');

      if (error) throw error;

      const dueToday = data.filter(d => d.follow_up_date === today).length;
      const overdue = data.filter(d => d.follow_up_date && d.follow_up_date < today).length;
      const thisWeek = data.filter(d => {
        if (d.follow_up_date) return d.follow_up_date >= today && d.follow_up_date <= weekEnd;
        // Drivers matched by status only (no date) count as "this week"
        const s = d.status?.toUpperCase();
        return s === 'PAYMENT_HOLD' || s === 'FOLLOW_UP';
      }).length;

      return { dueToday, overdue, thisWeek };
    },
    refetchInterval: 30000,
  });
}

export function useClearFollowUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (driverId: string) => {
      const { error } = await supabase
        .from('drivers')
        .update({ follow_up_date: null, follow_up_note: null })
        .eq('id', driverId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-ups'] });
      queryClient.invalidateQueries({ queryKey: ['follow-up-stats'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}
