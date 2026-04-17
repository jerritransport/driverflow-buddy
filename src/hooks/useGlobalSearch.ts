import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';

export interface SearchResult {
  id: string;
  type: 'driver' | 'sap' | 'clinic';
  title: string;
  subtitle: string;
  metadata?: string;
}

interface DriverSearchResult {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  cdl_number: string;
  email: string;
  phone: string;
  current_step: number;
  status: string;
}

interface SapSearchResult {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  organization: string | null;
  phone: string | null;
}

interface ClinicSearchResult {
  id: string;
  name: string;
  city: string;
  state: string;
  phone: string | null;
}

async function searchDrivers(query: string): Promise<SearchResult[]> {
  const { data, error } = await supabase
    .from('drivers')
    .select('id, first_name, middle_name, last_name, cdl_number, email, phone, current_step, status')
    .eq('is_hidden', false)
    .or(`first_name.ilike.%${query}%,middle_name.ilike.%${query}%,last_name.ilike.%${query}%,cdl_number.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
    .limit(5);

  if (error) throw error;

  return (data as DriverSearchResult[]).map((driver) => ({
    id: driver.id,
    type: 'driver' as const,
    title: [driver.first_name, driver.middle_name, driver.last_name].filter(Boolean).join(' '),
    subtitle: `CDL: ${driver.cdl_number}`,
    metadata: `Step ${driver.current_step} • ${driver.status.replace(/_/g, ' ')}`,
  }));
}

async function searchSaps(query: string): Promise<SearchResult[]> {
  const { data, error } = await supabase
    .from('saps')
    .select('id, first_name, last_name, email, organization, phone')
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,organization.ilike.%${query}%`)
    .limit(5);

  if (error) throw error;

  return (data as SapSearchResult[]).map((sap) => ({
    id: sap.id,
    type: 'sap' as const,
    title: `${sap.first_name} ${sap.last_name}`,
    subtitle: sap.organization || sap.email,
    metadata: sap.phone || undefined,
  }));
}

async function searchClinics(query: string): Promise<SearchResult[]> {
  const { data, error } = await supabase
    .from('clinics')
    .select('id, name, city, state, phone')
    .or(`name.ilike.%${query}%,city.ilike.%${query}%,state.ilike.%${query}%`)
    .limit(5);

  if (error) throw error;

  return (data as ClinicSearchResult[]).map((clinic) => ({
    id: clinic.id,
    type: 'clinic' as const,
    title: clinic.name,
    subtitle: `${clinic.city}, ${clinic.state}`,
    metadata: clinic.phone || undefined,
  }));
}

export function useGlobalSearch(query: string) {
  const debouncedQuery = useDebounce(query, 300);
  const trimmedQuery = debouncedQuery.trim();

  const { data: drivers = [], isLoading: driversLoading } = useQuery({
    queryKey: ['search', 'drivers', trimmedQuery],
    queryFn: () => searchDrivers(trimmedQuery),
    enabled: trimmedQuery.length >= 2,
    staleTime: 30000,
  });

  const { data: saps = [], isLoading: sapsLoading } = useQuery({
    queryKey: ['search', 'saps', trimmedQuery],
    queryFn: () => searchSaps(trimmedQuery),
    enabled: trimmedQuery.length >= 2,
    staleTime: 30000,
  });

  const { data: clinics = [], isLoading: clinicsLoading } = useQuery({
    queryKey: ['search', 'clinics', trimmedQuery],
    queryFn: () => searchClinics(trimmedQuery),
    enabled: trimmedQuery.length >= 2,
    staleTime: 30000,
  });

  const isLoading = driversLoading || sapsLoading || clinicsLoading;
  const hasResults = drivers.length > 0 || saps.length > 0 || clinics.length > 0;

  return {
    drivers,
    saps,
    clinics,
    isLoading,
    hasResults,
    isReady: trimmedQuery.length >= 2,
  };
}
