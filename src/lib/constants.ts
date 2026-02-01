// Driver status and step mappings
export const DRIVER_STEPS = [
  { step: 1, label: 'Consent', statuses: ['INTAKE_PENDING'] },
  { step: 2, label: 'Payment', statuses: ['PAYMENT_HOLD', 'PAYMENT_COMPLETE'] },
  { step: 3, label: 'SAP Paperwork', statuses: ['SAP_REQUEST_PENDING', 'SAP_PAPERWORK_PENDING', 'ALCOHOL_FEE_PENDING'] },
  { step: 4, label: 'Clearinghouse', statuses: ['CLEARINGHOUSE_PENDING', 'CLEARINGHOUSE_AUTOMATING', 'CLEARINGHOUSE_COMPLETE'] },
  { step: 5, label: 'Drug Test', statuses: ['DONOR_PASS_PENDING', 'DONOR_PASS_SENT'] },
  { step: 6, label: 'Results', statuses: ['TEST_IN_PROGRESS', 'RESULT_RECEIVED'] },
  { step: 7, label: 'Complete', statuses: ['RTD_COMPLETE'] },
] as const;

// Workflow steps for UI (same as DRIVER_STEPS but simpler format)
export const WORKFLOW_STEPS = DRIVER_STEPS.map(s => ({ step: s.step, label: s.label }));

// All possible driver statuses for dropdowns
export const DRIVER_STATUSES = [
  { value: 'INTAKE_PENDING', label: 'Consent Pending' },
  { value: 'PAYMENT_HOLD', label: 'Payment Hold' },
  { value: 'PAYMENT_COMPLETE', label: 'Payment Complete' },
  { value: 'SAP_REQUEST_PENDING', label: 'SAP Request Pending' },
  { value: 'SAP_PAPERWORK_PENDING', label: 'SAP Paperwork Pending' },
  { value: 'ALCOHOL_FEE_PENDING', label: 'Alcohol Fee Pending' },
  { value: 'CLEARINGHOUSE_PENDING', label: 'Clearinghouse Pending' },
  { value: 'CLEARINGHOUSE_AUTOMATING', label: 'Clearinghouse Automating' },
  { value: 'CLEARINGHOUSE_COMPLETE', label: 'Clearinghouse Complete' },
  { value: 'DONOR_PASS_PENDING', label: 'Donor Pass Pending' },
  { value: 'DONOR_PASS_SENT', label: 'Donor Pass Sent' },
  { value: 'TEST_IN_PROGRESS', label: 'Test In Progress' },
  { value: 'RESULT_RECEIVED', label: 'Result Received' },
  { value: 'RTD_COMPLETE', label: 'RTD Complete' },
] as const;

export const STATUS_LABELS: Record<string, string> = {
  INTAKE_PENDING: 'Consent Pending',
  PAYMENT_HOLD: 'Follow-Up', // Renamed from "Payment Hold" per client request
  PAYMENT_COMPLETE: 'Payment Complete',
  SAP_REQUEST_PENDING: 'SAP Request Pending',
  SAP_PAPERWORK_PENDING: 'SAP Paperwork Pending',
  ALCOHOL_FEE_PENDING: 'Alcohol Fee Pending',
  CLEARINGHOUSE_PENDING: 'Clearinghouse Pending',
  CLEARINGHOUSE_AUTOMATING: 'Clearinghouse Automating',
  CLEARINGHOUSE_COMPLETE: 'Clearinghouse Complete',
  DONOR_PASS_PENDING: 'Donor Pass Pending',
  DONOR_PASS_SENT: 'Donor Pass Sent',
  TEST_IN_PROGRESS: 'Test In Progress',
  RESULT_RECEIVED: 'Result Received',
  RTD_COMPLETE: 'RTD Complete',
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