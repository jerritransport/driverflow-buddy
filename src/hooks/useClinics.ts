import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Clinic = Tables<'clinics'>;
export type ClinicPerformance = Tables<'clinic_performance'>;

export type CreateClinicData = Omit<Clinic, 'id' | 'created_at' | 'updated_at' | 'total_tests_completed' | 'reliability_rating' | 'last_observer_verification_date' | 'latitude' | 'longitude'>;
export type UpdateClinicData = Partial<CreateClinicData>;

export function useClinics() {
  return useQuery({
    queryKey: ['clinics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Clinic[];
    },
  });
}

export function useClinicPerformance() {
  return useQuery({
    queryKey: ['clinic-performance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clinic_performance')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as ClinicPerformance[];
    },
  });
}

export function useClinic(clinicId: string | undefined) {
  return useQuery({
    queryKey: ['clinic', clinicId],
    queryFn: async () => {
      if (!clinicId) throw new Error('Clinic ID is required');

      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', clinicId)
        .single();

      if (error) throw error;
      return data as Clinic;
    },
    enabled: !!clinicId,
  });
}

export function useClinicDrivers(clinicId: string | undefined) {
  return useQuery({
    queryKey: ['clinic-drivers', clinicId],
    queryFn: async () => {
      if (!clinicId) throw new Error('Clinic ID is required');

      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('test_clinic_id', clinicId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!clinicId,
  });
}

export function useCreateClinic() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateClinicData) => {
      const { data: newClinic, error } = await supabase
        .from('clinics')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return newClinic;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinics'] });
      queryClient.invalidateQueries({ queryKey: ['clinic-performance'] });
    },
  });
}

export function useUpdateClinic() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ clinicId, updates }: { clinicId: string; updates: UpdateClinicData }) => {
      const { data, error } = await supabase
        .from('clinics')
        .update(updates)
        .eq('id', clinicId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { clinicId }) => {
      queryClient.invalidateQueries({ queryKey: ['clinics'] });
      queryClient.invalidateQueries({ queryKey: ['clinic', clinicId] });
      queryClient.invalidateQueries({ queryKey: ['clinic-performance'] });
    },
  });
}
