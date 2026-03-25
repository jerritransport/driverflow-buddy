// Driver status and step mappings
export const DRIVER_STEPS = [
  { step: 1, label: 'Consent Form', statuses: ['INTAKE_PENDING'] },
  { step: 2, label: 'Payment', statuses: ['PAYMENT_HOLD', 'PAYMENT_COMPLETE'] },
  { step: 3, label: 'SAP Paperwork', statuses: ['SAP_REQUEST_PENDING', 'SAP_PAPERWORK_PENDING', 'ALCOHOL_FEE_PENDING', 'SAP_PAPERWORK_RECEIVED'] },
  { step: 4, label: 'Designation', statuses: ['DESIGNATION_PENDING', 'DESIGNATION_AUTOMATING', 'DESIGNATION_COMPLETE'] },
  { step: 5, label: 'Donor Pass', statuses: ['DONOR_PASS_PENDING', 'DONOR_PASS_SENT'] },
  { step: 6, label: 'Results', statuses: ['TEST_IN_PROGRESS', 'RESULTS_PENDING', 'RESULTS_RECEIVED', 'RESULT_RECEIVED'] },
  { step: 7, label: 'Complete', statuses: ['RTD_COMPLETE'] },
] as const;

// Workflow steps for UI (same as DRIVER_STEPS but simpler format)
export const WORKFLOW_STEPS = DRIVER_STEPS.map(s => ({ step: s.step, label: s.label }));

// All possible driver statuses for dropdowns
export const DRIVER_STATUSES = [
  { value: 'INTAKE_PENDING', label: 'Consent Pending' },
  { value: 'PAYMENT_HOLD', label: 'Follow-Up' },
  { value: 'PAYMENT_COMPLETE', label: 'Payment Complete' },
  { value: 'SAP_REQUEST_PENDING', label: 'SAP Request Pending' },
  { value: 'SAP_PAPERWORK_PENDING', label: 'SAP Paperwork Pending' },
  { value: 'ALCOHOL_FEE_PENDING', label: 'Alcohol Fee Pending' },
  { value: 'SAP_PAPERWORK_RECEIVED', label: 'SAP Paperwork Received' },
  { value: 'DESIGNATION_PENDING', label: 'Designation Pending' },
  { value: 'DESIGNATION_AUTOMATING', label: 'Designation Automating' },
  { value: 'DESIGNATION_COMPLETE', label: 'Designation Complete' },
  { value: 'DONOR_PASS_PENDING', label: 'Donor Pass Pending' },
  { value: 'DONOR_PASS_SENT', label: 'Donor Pass Sent' },
  { value: 'TEST_IN_PROGRESS', label: 'Test In Progress' },
  { value: 'RESULTS_PENDING', label: 'Results Pending' },
  { value: 'RESULTS_RECEIVED', label: 'Results Received' },
  { value: 'RESULT_RECEIVED', label: 'Result Received' },
  { value: 'RTD_COMPLETE', label: 'RTD Complete' },
] as const;

export const STATUS_LABELS: Record<string, string> = {
  INTAKE_PENDING: 'Consent Pending',
  PAYMENT_HOLD: 'Follow-Up',
  PAYMENT_COMPLETE: 'Payment Complete',
  SAP_REQUEST_PENDING: 'SAP Request Pending',
  SAP_PAPERWORK_PENDING: 'SAP Paperwork Pending',
  ALCOHOL_FEE_PENDING: 'Alcohol Fee Pending',
  SAP_PAPERWORK_RECEIVED: 'SAP Paperwork Received',
  DESIGNATION_PENDING: 'Designation Pending',
  DESIGNATION_AUTOMATING: 'Designation Automating',
  DESIGNATION_COMPLETE: 'Designation Complete',
  DONOR_PASS_PENDING: 'Donor Pass Pending',
  DONOR_PASS_SENT: 'Donor Pass Sent',
  TEST_IN_PROGRESS: 'Test In Progress',
  RESULTS_PENDING: 'Results Pending',
  RESULTS_RECEIVED: 'Results Received',
  RESULT_RECEIVED: 'Result Received',
  RTD_COMPLETE: 'RTD Complete',
  // Legacy mappings for backward compat
  CLEARINGHOUSE_PENDING: 'Designation Pending',
  CLEARINGHOUSE_AUTOMATING: 'Designation Automating',
  CLEARINGHOUSE_COMPLETE: 'Designation Complete',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  UNPAID: 'Unpaid',
  DEPOSIT: 'Deposit',
  PAID: 'Paid in Full',
  REFUNDED: 'Refunded',
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  UNPAID: 'bg-[hsl(var(--payment-unpaid))] text-white',
  DEPOSIT: 'bg-[hsl(var(--payment-deposit))] text-white',
  PAID: 'bg-[hsl(var(--payment-paid))] text-white',
  REFUNDED: 'bg-muted text-muted-foreground',
};

export const getStepForStatus = (status: string): number => {
  const step = DRIVER_STEPS.find(s => s.statuses.includes(status as never));
  return step?.step ?? 1;
};

export const getStepLabel = (step: number): string => {
  return DRIVER_STEPS.find(s => s.step === step)?.label ?? 'Unknown';
};

// Pricing constants
export const BASE_PRICE = 248;
export const ALCOHOL_TEST_FEE = 115;
