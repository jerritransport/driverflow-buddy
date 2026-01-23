import { Driver } from '@/hooks/useDrivers';
import { format } from 'date-fns';
import { getStepLabel } from '@/lib/constants';

// ============= CSV Utility Functions =============

/**
 * Escape special characters for CSV
 */
function escapeCSV(value: string | null | undefined): string {
  if (value === null || value === undefined) return '';
  
  const stringValue = String(value);
  
  // If the value contains comma, double quotes, or newlines, wrap in quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Trigger browser download of CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============= Driver Export =============

/**
 * Convert drivers data to CSV format
 */
export function driversToCSV(drivers: Driver[]): string {
  const headers = [
    'First Name',
    'Last Name',
    'Email',
    'Phone',
    'CDL Number',
    'CDL State',
    'Date of Birth',
    'Gender',
    'Current Step',
    'Step Label',
    'Status',
    'Payment Status',
    'Amount Due',
    'Amount Paid',
    'Payment Hold',
    'Requires Alcohol Test',
    'RTD Completed',
    'Created At',
    'Updated At',
  ];

  const rows = drivers.map((driver) => [
    escapeCSV(driver.first_name),
    escapeCSV(driver.last_name),
    escapeCSV(driver.email),
    escapeCSV(driver.phone),
    escapeCSV(driver.cdl_number),
    escapeCSV(driver.cdl_state),
    driver.date_of_birth ? format(new Date(driver.date_of_birth), 'yyyy-MM-dd') : '',
    escapeCSV(driver.gender),
    driver.current_step.toString(),
    escapeCSV(getStepLabel(driver.current_step)),
    escapeCSV(driver.status.replace(/_/g, ' ')),
    escapeCSV(driver.payment_status.replace(/_/g, ' ')),
    (driver.amount_due ?? 0).toFixed(2),
    (driver.amount_paid ?? 0).toFixed(2),
    driver.payment_hold ? 'Yes' : 'No',
    driver.requires_alcohol_test ? 'Yes' : 'No',
    driver.rtd_completed ? 'Yes' : 'No',
    driver.created_at ? format(new Date(driver.created_at), 'yyyy-MM-dd HH:mm:ss') : '',
    driver.updated_at ? format(new Date(driver.updated_at), 'yyyy-MM-dd HH:mm:ss') : '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Export drivers to CSV and download
 */
export function exportDriversToCSV(drivers: Driver[], filenamePrefix = 'drivers'): void {
  const timestamp = format(new Date(), 'yyyy-MM-dd_HHmmss');
  const filename = `${filenamePrefix}_${timestamp}.csv`;
  const csvContent = driversToCSV(drivers);
  downloadCSV(csvContent, filename);
}

// ============= SAP Export =============

export interface SapExportData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  organization?: string | null;
  certification_number?: string | null;
  certification_expiration?: string | null;
  address_line1?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  is_active?: boolean | null;
  total_drivers_referred?: number | null;
  created_at?: string | null;
}

export function sapsToCSV(saps: SapExportData[]): string {
  const headers = [
    'First Name',
    'Last Name',
    'Email',
    'Phone',
    'Organization',
    'Certification Number',
    'Certification Expiration',
    'Address',
    'City',
    'State',
    'Zip Code',
    'Active',
    'Total Drivers Referred',
    'Created At',
  ];

  const rows = saps.map((sap) => [
    escapeCSV(sap.first_name),
    escapeCSV(sap.last_name),
    escapeCSV(sap.email),
    escapeCSV(sap.phone),
    escapeCSV(sap.organization),
    escapeCSV(sap.certification_number),
    sap.certification_expiration ? format(new Date(sap.certification_expiration), 'yyyy-MM-dd') : '',
    escapeCSV(sap.address_line1),
    escapeCSV(sap.city),
    escapeCSV(sap.state),
    escapeCSV(sap.zip_code),
    sap.is_active ? 'Yes' : 'No',
    (sap.total_drivers_referred ?? 0).toString(),
    sap.created_at ? format(new Date(sap.created_at), 'yyyy-MM-dd HH:mm:ss') : '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  return csvContent;
}

export function exportSapsToCSV(saps: SapExportData[], filenamePrefix = 'saps'): void {
  const timestamp = format(new Date(), 'yyyy-MM-dd_HHmmss');
  const filename = `${filenamePrefix}_${timestamp}.csv`;
  const csvContent = sapsToCSV(saps);
  downloadCSV(csvContent, filename);
}

// ============= Clinic Export =============

export interface ClinicExportData {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address_line1: string;
  city: string;
  state: string;
  zip_code: string;
  escreen_id?: string | null;
  offers_alcohol_testing?: boolean | null;
  offers_observed_collection?: boolean | null;
  has_male_observer?: boolean | null;
  has_female_observer?: boolean | null;
  is_active?: boolean | null;
  total_tests_completed?: number | null;
  reliability_rating?: number | null;
  created_at?: string | null;
}

export function clinicsToCSV(clinics: ClinicExportData[]): string {
  const headers = [
    'Name',
    'Phone',
    'Email',
    'Address',
    'City',
    'State',
    'Zip Code',
    'eScreen ID',
    'Alcohol Testing',
    'Observed Collection',
    'Male Observer',
    'Female Observer',
    'Active',
    'Total Tests Completed',
    'Reliability Rating',
    'Created At',
  ];

  const rows = clinics.map((clinic) => [
    escapeCSV(clinic.name),
    escapeCSV(clinic.phone),
    escapeCSV(clinic.email),
    escapeCSV(clinic.address_line1),
    escapeCSV(clinic.city),
    escapeCSV(clinic.state),
    escapeCSV(clinic.zip_code),
    escapeCSV(clinic.escreen_id),
    clinic.offers_alcohol_testing ? 'Yes' : 'No',
    clinic.offers_observed_collection ? 'Yes' : 'No',
    clinic.has_male_observer ? 'Yes' : 'No',
    clinic.has_female_observer ? 'Yes' : 'No',
    clinic.is_active ? 'Yes' : 'No',
    (clinic.total_tests_completed ?? 0).toString(),
    clinic.reliability_rating?.toFixed(1) ?? 'N/A',
    clinic.created_at ? format(new Date(clinic.created_at), 'yyyy-MM-dd HH:mm:ss') : '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  return csvContent;
}

export function exportClinicsToCSV(clinics: ClinicExportData[], filenamePrefix = 'clinics'): void {
  const timestamp = format(new Date(), 'yyyy-MM-dd_HHmmss');
  const filename = `${filenamePrefix}_${timestamp}.csv`;
  const csvContent = clinicsToCSV(clinics);
  downloadCSV(csvContent, filename);
}
