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

export const STATUS_LABELS: Record<string, string> = {
  INTAKE_PENDING: 'Consent Pending',
  PAYMENT_HOLD: 'Payment Hold',
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
