import { Driver } from '@/hooks/useDrivers';
import { format } from 'date-fns';
import { getStepLabel } from '@/lib/constants';

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

/**
 * Export drivers to CSV and download
 */
export function exportDriversToCSV(drivers: Driver[], filenamePrefix = 'drivers'): void {
  const timestamp = format(new Date(), 'yyyy-MM-dd_HHmmss');
  const filename = `${filenamePrefix}_${timestamp}.csv`;
  const csvContent = driversToCSV(drivers);
  downloadCSV(csvContent, filename);
}
