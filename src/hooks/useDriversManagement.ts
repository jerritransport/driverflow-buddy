import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Driver } from './useDrivers';

export type SortField = 'name' | 'current_step' | 'status' | 'updated_at';
export type SortDirection = 'asc' | 'desc';

export interface SortOptions {
  field: SortField;
  direction: SortDirection;
}

export interface DriverFilters {
  search?: string;
  step?: number;
  status?: string;
  paymentStatus?: string;
  paymentHold?: boolean;
  requiresAlcoholTest?: boolean;
  dateField?: 'created_at' | 'updated_at';
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export interface DriversResult {
  drivers: Driver[];
  totalCount: number;
  totalPages: number;
}

/**
 * Hook to fetch all drivers matching filters (for export, no pagination)
 */
function applySort(query: any, sort: SortOptions) {
  const ascending = sort.direction === 'asc';
  
  if (sort.field === 'name') {
    // Sort by last_name, then first_name
    return query
      .order('last_name', { ascending })
      .order('first_name', { ascending });
  }
  
  return query.order(sort.field, { ascending });
}

export function useAllFilteredDrivers(
  filters: DriverFilters = {},
  sort: SortOptions = { field: 'updated_at', direction: 'desc' },
  enabled = false
) {
  const { search, step, status, paymentStatus, paymentHold, requiresAlcoholTest, dateField, dateFrom, dateTo } = filters;

  return useQuery({
    queryKey: ['drivers-all-filtered', filters, sort],
    queryFn: async (): Promise<Driver[]> => {
      let query = supabase
        .from('drivers')
        .select('*');
      
      query = applySort(query, sort);

      if (step !== undefined) {
        query = query.eq('current_step', step);
      }
      if (status) {
        query = query.eq('status', status);
      }
      if (paymentStatus) {
        query = query.eq('payment_status', paymentStatus);
      }
      if (paymentHold !== undefined) {
        query = query.eq('payment_hold', paymentHold);
      }
      if (requiresAlcoholTest !== undefined) {
        query = query.eq('requires_alcohol_test', requiresAlcoholTest);
      }
      if (search) {
        query = query.or(
          `first_name.ilike.%${search}%,last_name.ilike.%${search}%,cdl_number.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
        );
      }
      if (dateField && dateFrom) {
        query = query.gte(dateField, dateFrom);
      }
      if (dateField && dateTo) {
        query = query.lte(dateField, dateTo + 'T23:59:59.999Z');
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Driver[];
    },
    enabled,
    staleTime: 0,
  });
}

export function useDriversPaginated(
  filters: DriverFilters = {},
  pagination: PaginationOptions = { page: 1, pageSize: 20 },
  sort: SortOptions = { field: 'updated_at', direction: 'desc' }
) {
  const { search, step, status, paymentStatus, paymentHold, requiresAlcoholTest, dateField, dateFrom, dateTo } = filters;
  const { page, pageSize } = pagination;

  return useQuery({
    queryKey: ['drivers-paginated', { filters, pagination, sort }],
    queryFn: async (): Promise<DriversResult> => {
      // First get total count
      let countQuery = supabase
        .from('drivers')
        .select('*', { count: 'exact', head: true });

      // Apply filters to count query
      if (step !== undefined) {
        countQuery = countQuery.eq('current_step', step);
      }
      if (status) {
        countQuery = countQuery.eq('status', status);
      }
      if (paymentStatus) {
        countQuery = countQuery.eq('payment_status', paymentStatus);
      }
      if (paymentHold !== undefined) {
        countQuery = countQuery.eq('payment_hold', paymentHold);
      }
      if (requiresAlcoholTest !== undefined) {
        countQuery = countQuery.eq('requires_alcohol_test', requiresAlcoholTest);
      }
      if (search) {
        countQuery = countQuery.or(
          `first_name.ilike.%${search}%,last_name.ilike.%${search}%,cdl_number.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
        );
      }
      if (dateField && dateFrom) {
        countQuery = countQuery.gte(dateField, dateFrom);
      }
      if (dateField && dateTo) {
        countQuery = countQuery.lte(dateField, dateTo + 'T23:59:59.999Z');
      }

      const { count, error: countError } = await countQuery;
      if (countError) throw countError;

      // Now get paginated data
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let dataQuery = supabase
        .from('drivers')
        .select('*')
        .range(from, to);
      
      dataQuery = applySort(dataQuery, sort);

      // Apply same filters to data query
      if (step !== undefined) {
        dataQuery = dataQuery.eq('current_step', step);
      }
      if (status) {
        dataQuery = dataQuery.eq('status', status);
      }
      if (paymentStatus) {
        dataQuery = dataQuery.eq('payment_status', paymentStatus);
      }
      if (paymentHold !== undefined) {
        dataQuery = dataQuery.eq('payment_hold', paymentHold);
      }
      if (requiresAlcoholTest !== undefined) {
        dataQuery = dataQuery.eq('requires_alcohol_test', requiresAlcoholTest);
      }
      if (dateField && dateFrom) {
        dataQuery = dataQuery.gte(dateField, dateFrom);
      }
      if (dateField && dateTo) {
        dataQuery = dataQuery.lte(dateField, dateTo + 'T23:59:59.999Z');
      }
      if (search) {
        dataQuery = dataQuery.or(
          `first_name.ilike.%${search}%,last_name.ilike.%${search}%,cdl_number.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
        );
      }

      const { data, error } = await dataQuery;
      if (error) throw error;

      const totalCount = count ?? 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        drivers: data as Driver[],
        totalCount,
        totalPages,
      };
    },
    refetchInterval: 30000,
  });
}

export interface CreateDriverData {
  first_name: string;
  last_name: string;
  middle_name?: string;
  email: string;
  phone: string;
  gender?: string;
  date_of_birth?: string;
  cdl_number?: string;
  cdl_state?: string;
  cdl_expiration?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  employer_name?: string;
  employer_contact_name?: string;
  employer_job_title?: string;
  employer_phone?: string;
  amount_due?: number;
  requires_alcohol_test?: boolean;
}

export function useCreateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDriverData) => {
      // Sanitize data: convert empty strings to null for optional fields
      const sanitizedData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        middle_name: data.middle_name || null,
        gender: data.gender || null,
        date_of_birth: data.date_of_birth || null,
        cdl_number: data.cdl_number || null,
        cdl_state: data.cdl_state || null,
        cdl_expiration: data.cdl_expiration || null,
        address_line1: data.address_line1 || null,
        address_line2: data.address_line2 || null,
        city: data.city || null,
        state: data.state || null,
        zip_code: data.zip_code || null,
        employer_name: data.employer_name || null,
        employer_contact_name: data.employer_contact_name || null,
        employer_job_title: data.employer_job_title || null,
        employer_phone: data.employer_phone || null,
        requires_alcohol_test: data.requires_alcohol_test ?? false,
      };

      const { data: driver, error } = await supabase
        .from('drivers')
        .insert({
          ...sanitizedData,
          status: 'INTAKE_PENDING',
          current_step: 1,
          payment_status: 'UNPAID',
          payment_hold: false,
          amount_paid: 0,
          amount_due: data.amount_due ?? 450,
        })
        .select()
        .single();

      if (error) throw error;
      return driver;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['drivers-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['drivers-by-step'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });
}

export function useDeleteDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (driverId: string) => {
      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', driverId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['drivers-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['drivers-by-step'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });
}
