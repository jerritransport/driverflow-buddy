// Driver status and step mappings — new RTD flow
export const DRIVER_STEPS = [
  { step: 1, label: 'Intake', statuses: ['INTAKE_RECEIVED', 'INTAKE_PENDING'] },
  { step: 2, label: 'Payment', statuses: ['UNPAID', 'PAYMENT_COMPLETE'] },
  {
    step: 3,
    label: 'SAP Paperwork',
    statuses: [
      'SAP_REQUEST_PENDING',
      'SAP_REQUESTED',
      'SAP_PAPERWORK_PENDING',
      'ALCOHOL_FEE_PENDING',
      'SAP_PAPERWORK_RECEIVED',
    ],
  },
  {
    step: 4,
    label: 'Clearinghouse',
    statuses: [
      'CLEARINGHOUSE_AUTOMATING',
      'CLEARINGHOUSE_2FA_PENDING',
      'CLEARINGHOUSE_ACCEPTED',
      'CLEARINGHOUSE_FAILED',
      // Legacy designation aliases
      'DESIGNATION_PENDING',
      'DESIGNATION_AUTOMATING',
      'DESIGNATION_COMPLETE',
    ],
  },
  { step: 5, label: 'Donor Pass', statuses: ['DONOR_PASS_PENDING', 'DONOR_PASS_SENT'] },
  {
    step: 6,
    label: 'Test Results',
    statuses: [
      'TEST_IN_PROGRESS',
      'RESULTS_PENDING',
      'RESULTS_RECEIVED',
      'RESULT_RECEIVED',
      'RTD_REPORT_FAILED',
    ],
  },
  { step: 7, label: 'RTD Complete', statuses: ['COMPLETED', 'RTD_COMPLETE'] },
] as const;

// Workflow steps for UI (same as DRIVER_STEPS but simpler format)
export const WORKFLOW_STEPS = DRIVER_STEPS.map(s => ({ step: s.step, label: s.label }));

// All possible driver statuses for dropdowns (new flow, in display order)
export const DRIVER_STATUSES = [
  { value: 'INTAKE_RECEIVED', label: 'Intake Received' },
  { value: 'UNPAID', label: 'Awaiting Payment' },
  { value: 'PAYMENT_HOLD', label: 'Payment Hold (Deposit Only)' },
  { value: 'PAYMENT_COMPLETE', label: 'Payment Complete' },
  { value: 'SAP_REQUEST_PENDING', label: 'SAP Request Pending' },
  { value: 'SAP_REQUESTED', label: 'SAP Paperwork Requested' },
  { value: 'SAP_PAPERWORK_RECEIVED', label: 'SAP Paperwork Received' },
  { value: 'CLEARINGHOUSE_AUTOMATING', label: 'Clearinghouse — Automating' },
  { value: 'CLEARINGHOUSE_2FA_PENDING', label: 'Clearinghouse — 2FA Pending' },
  { value: 'CLEARINGHOUSE_ACCEPTED', label: 'Clearinghouse Accepted' },
  { value: 'CLEARINGHOUSE_FAILED', label: 'Clearinghouse Failed' },
  { value: 'DONOR_PASS_SENT', label: 'Donor Pass Sent' },
  { value: 'RTD_REPORT_FAILED', label: 'RTD Report Failed' },
  { value: 'COMPLETED', label: 'RTD Complete' },
] as const;

export const STATUS_LABELS: Record<string, string> = {
  // New flow
  INTAKE_RECEIVED: 'Intake Received',
  UNPAID: 'Awaiting Payment',
  PAYMENT_HOLD: 'Payment Hold (Deposit Only)',
  PAYMENT_COMPLETE: 'Payment Complete',
  SAP_REQUEST_PENDING: 'SAP Request Pending',
  SAP_REQUESTED: 'SAP Paperwork Requested',
  SAP_PAPERWORK_PENDING: 'SAP Paperwork Pending',
  ALCOHOL_FEE_PENDING: 'Alcohol Fee Pending',
  SAP_PAPERWORK_RECEIVED: 'SAP Paperwork Received',
  CLEARINGHOUSE_AUTOMATING: 'Clearinghouse — Automating',
  CLEARINGHOUSE_2FA_PENDING: 'Clearinghouse — 2FA Pending',
  CLEARINGHOUSE_ACCEPTED: 'Clearinghouse Accepted',
  CLEARINGHOUSE_FAILED: 'Clearinghouse Failed',
  DONOR_PASS_PENDING: 'Donor Pass Pending',
  DONOR_PASS_SENT: 'Donor Pass Sent',
  TEST_IN_PROGRESS: 'Test In Progress',
  RESULTS_PENDING: 'Results Pending',
  RESULTS_RECEIVED: 'Results Received',
  RESULT_RECEIVED: 'Result Received',
  RTD_REPORT_FAILED: 'RTD Report Failed',
  COMPLETED: 'RTD Complete',
  // Legacy mappings for backward compat
  INTAKE_PENDING: 'Intake Received',
  RTD_COMPLETE: 'RTD Complete',
  DESIGNATION_PENDING: 'Clearinghouse — Automating',
  DESIGNATION_AUTOMATING: 'Clearinghouse — Automating',
  DESIGNATION_COMPLETE: 'Clearinghouse Accepted',
  CLEARINGHOUSE_PENDING: 'Clearinghouse — Automating',
  CLEARINGHOUSE_COMPLETE: 'Clearinghouse Accepted',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  UNPAID: 'Unpaid',
  DEPOSIT: 'Deposit',
  PAYMENT_HOLD: 'Deposit Paid',
  PAID: 'Paid in Full',
  PAYMENT_COMPLETE: 'Paid in Full',
  REFUNDED: 'Refunded',
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  UNPAID: 'bg-[hsl(var(--payment-unpaid))] text-white',
  DEPOSIT: 'bg-[hsl(var(--payment-deposit))] text-white',
  PAYMENT_HOLD: 'bg-[hsl(var(--payment-hold))] text-white',
  PAID: 'bg-[hsl(var(--payment-paid))] text-white',
  PAYMENT_COMPLETE: 'bg-[hsl(var(--payment-paid))] text-white',
  REFUNDED: 'bg-muted text-muted-foreground',
};

export const getStepForStatus = (status: string): number => {
  const step = DRIVER_STEPS.find(s => s.statuses.includes(status as never));
  return step?.step ?? 1;
};

export const getStepLabel = (step: number): string => {
  return DRIVER_STEPS.find(s => s.step === step)?.label ?? 'Unknown';
};

// Branding
export const APP_NAME = 'GOOP RTD Dashboard';

// Pricing constants
export const BASE_PRICE = 248;
export const ALCOHOL_TEST_FEE = 115;
