import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, subMonths, format, startOfWeek, subWeeks, parseISO } from 'date-fns';

export interface DriverTrendData {
  period: string;
  created: number;
  completed: number;
}

export interface PaymentTrendData {
  period: string;
  revenue: number;
  refunds: number;
  transactions: number;
}

export interface StepDistributionData {
  step: string;
  count: number;
  label: string;
}

export interface SapPerformanceData {
  name: string;
  assigned: number;
  completed: number;
  completionRate: number;
}

export interface ClinicPerformanceData {
  name: string;
  testsCompleted: number;
  positiveRate: number;
  avgTurnaround: number;
}

// Fetch driver creation and completion trends
export function useDriverTrends(period: 'weekly' | 'monthly' = 'monthly') {
  return useQuery({
    queryKey: ['reports', 'driver-trends', period],
    queryFn: async () => {
      const months = 6;
      const trends: DriverTrendData[] = [];

      for (let i = months - 1; i >= 0; i--) {
        const periodStart = startOfMonth(subMonths(new Date(), i));
        const periodEnd = startOfMonth(subMonths(new Date(), i - 1));

        // Count drivers created in this period
        const { count: createdCount } = await supabase
          .from('drivers')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', periodStart.toISOString())
          .lt('created_at', periodEnd.toISOString());

        // Count drivers completed in this period
        const { count: completedCount } = await supabase
          .from('drivers')
          .select('*', { count: 'exact', head: true })
          .eq('rtd_completed', true)
          .gte('rtd_completed_at', periodStart.toISOString())
          .lt('rtd_completed_at', periodEnd.toISOString());

        trends.push({
          period: format(periodStart, 'MMM yyyy'),
          created: createdCount || 0,
          completed: completedCount || 0,
        });
      }

      return trends;
    },
    staleTime: 60000,
  });
}

// Fetch weekly driver trends
export function useWeeklyDriverTrends() {
  return useQuery({
    queryKey: ['reports', 'weekly-driver-trends'],
    queryFn: async () => {
      const weeks = 8;
      const trends: DriverTrendData[] = [];

      for (let i = weeks - 1; i >= 0; i--) {
        const weekStart = startOfWeek(subWeeks(new Date(), i));
        const weekEnd = startOfWeek(subWeeks(new Date(), i - 1));

        const { count: createdCount } = await supabase
          .from('drivers')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', weekStart.toISOString())
          .lt('created_at', weekEnd.toISOString());

        const { count: completedCount } = await supabase
          .from('drivers')
          .select('*', { count: 'exact', head: true })
          .eq('rtd_completed', true)
          .gte('rtd_completed_at', weekStart.toISOString())
          .lt('rtd_completed_at', weekEnd.toISOString());

        trends.push({
          period: format(weekStart, 'MMM d'),
          created: createdCount || 0,
          completed: completedCount || 0,
        });
      }

      return trends;
    },
    staleTime: 60000,
  });
}

// Fetch payment trends from payment_summary view
export function usePaymentTrends() {
  return useQuery({
    queryKey: ['reports', 'payment-trends'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_summary')
        .select('*')
        .order('payment_date', { ascending: true })
        .limit(30);

      if (error) throw error;

      return (data || []).map((row) => ({
        period: row.payment_date ? format(parseISO(row.payment_date), 'MMM d') : 'Unknown',
        revenue: Number(row.total_revenue) || 0,
        refunds: Number(row.total_refunded) || 0,
        transactions: Number(row.total_transactions) || 0,
      })) as PaymentTrendData[];
    },
    staleTime: 60000,
  });
}

// Fetch current step distribution
export function useStepDistribution() {
  return useQuery({
    queryKey: ['reports', 'step-distribution'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dashboard_summary')
        .select('*')
        .single();

      if (error) throw error;

      const stepLabels = [
        'Intake',
        'Payment',
        'SAP',
        'Designation',
        'Donor Pass',
        'Testing',
        'Complete',
      ];

      return [
        { step: 'Step 1', count: Number(data.step_1_count) || 0, label: stepLabels[0] },
        { step: 'Step 2', count: Number(data.step_2_count) || 0, label: stepLabels[1] },
        { step: 'Step 3', count: Number(data.step_3_count) || 0, label: stepLabels[2] },
        { step: 'Step 4', count: Number(data.step_4_count) || 0, label: stepLabels[3] },
        { step: 'Step 5', count: Number(data.step_5_count) || 0, label: stepLabels[4] },
        { step: 'Step 6', count: Number(data.step_6_count) || 0, label: stepLabels[5] },
        { step: 'Step 7', count: Number(data.step_7_count) || 0, label: stepLabels[6] },
      ] as StepDistributionData[];
    },
    staleTime: 30000,
  });
}

// Fetch SAP performance comparison
export function useSapComparison() {
  return useQuery({
    queryKey: ['reports', 'sap-comparison'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sap_performance')
        .select('*')
        .eq('is_active', true)
        .order('total_drivers_assigned', { ascending: false })
        .limit(10);

      if (error) throw error;

      return (data || []).map((sap) => ({
        name: `${sap.first_name} ${sap.last_name}`.substring(0, 15),
        assigned: Number(sap.total_drivers_assigned) || 0,
        completed: Number(sap.rtd_completed_count) || 0,
        completionRate:
          sap.total_drivers_assigned && sap.total_drivers_assigned > 0
            ? Math.round(((sap.rtd_completed_count || 0) / sap.total_drivers_assigned) * 100)
            : 0,
      })) as SapPerformanceData[];
    },
    staleTime: 60000,
  });
}

// Fetch Clinic performance comparison
export function useClinicComparison() {
  return useQuery({
    queryKey: ['reports', 'clinic-comparison'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clinic_performance')
        .select('*')
        .eq('is_active', true)
        .order('total_drivers_assigned', { ascending: false })
        .limit(10);

      if (error) throw error;

      return (data || []).map((clinic) => {
        const total = (clinic.negative_results || 0) + (clinic.positive_results || 0);
        return {
          name: (clinic.name || 'Unknown').substring(0, 20),
          testsCompleted: Number(clinic.tests_completed) || 0,
          positiveRate: total > 0 ? Math.round(((clinic.positive_results || 0) / total) * 100) : 0,
          avgTurnaround: Number(clinic.avg_turnaround_days) || 0,
        };
      }) as ClinicPerformanceData[];
    },
    staleTime: 60000,
  });
}
