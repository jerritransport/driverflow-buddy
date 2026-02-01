import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface IntakeForm {
  id: string;
  driver_id: string | null;
  submission_date: string;
  form_pdf_url: string | null;
  cdl_attachment_url: string | null;
  source: string;
  status: string;
  created_at: string;
  driver?: {
    first_name: string;
    last_name: string;
  };
}

export function useIntakeForms() {
  return useQuery({
    queryKey: ['intake-forms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('intake_forms')
        .select(`
          *,
          driver:drivers(first_name, last_name)
        `)
        .order('submission_date', { ascending: false });

      if (error) throw error;
      return data as IntakeForm[];
    },
    refetchInterval: 30000,
  });
}

export function useIntakeFormStats() {
  return useQuery({
    queryKey: ['intake-form-stats'],
    queryFn: async () => {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
      weekStart.setHours(0, 0, 0, 0);
      
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Get a larger sample for calculating weekly average
      const threeMonthsAgo = new Date(now);
      threeMonthsAgo.setMonth(now.getMonth() - 3);

      const { data, error } = await supabase
        .from('intake_forms')
        .select('submission_date')
        .gte('submission_date', threeMonthsAgo.toISOString());

      if (error) throw error;

      const thisWeek = data.filter(f => new Date(f.submission_date) >= weekStart).length;
      const thisMonth = data.filter(f => new Date(f.submission_date) >= monthStart).length;
      
      // Calculate weekly average over the past 3 months (approximately 13 weeks)
      const weeksInPeriod = 13;
      const weeklyAverage = Math.round(data.length / weeksInPeriod);

      return { thisWeek, thisMonth, weeklyAverage };
    },
    refetchInterval: 60000,
  });
}
