// Documents required before a driver can advance INTO a given step.
// Keyed by the destination step number (the step they're advancing TO).

export interface StepUploadRequirement {
  /** document_type value stored in the documents table */
  type: string;
  /** Human-readable label shown in the upload dialog */
  label: string;
  /** Minimum number of files required for this slot */
  min: number;
  /** Maximum number of files allowed for this slot */
  max: number;
  /** If true, each file in this slot must be tagged Drug or Alcohol */
  requiresDrugAlcoholTag?: boolean;
}

export const STEP_UPLOAD_REQUIREMENTS: Record<number, StepUploadRequirement[]> = {
  // Advancing into Step 3 — SAP Paperwork
  3: [
    { type: 'RTD_CONSENT_FORM', label: 'RTD Consent Form', min: 1, max: 1 },
    { type: 'CDL_FRONT', label: 'CDL Front', min: 1, max: 1 },
    { type: 'PAYMENT_SCREENSHOT', label: 'Payment Screenshot', min: 1, max: 5 },
  ],
  // Advancing into Step 4 — Clearinghouse
  4: [
    { type: 'SAP_PAPERWORK', label: 'SAP Paperwork', min: 1, max: 5 },
  ],
  // Advancing into Step 5 — Donor Pass
  5: [
    { type: 'CLEARINGHOUSE_QUERY_RESULT', label: 'Clearinghouse Query Result', min: 1, max: 1 },
  ],
  // Advancing into Step 6 — Test Results
  6: [
    { type: 'DONOR_PASS', label: 'Donor Pass', min: 1, max: 5 },
  ],
  // Advancing into Step 7 — RTD Complete
  7: [
    { type: 'TEST_RESULT', label: 'Test Results', min: 1, max: 4, requiresDrugAlcoholTag: true },
    { type: 'CCF', label: 'CCF (Chain of Custody Form)', min: 1, max: 4, requiresDrugAlcoholTag: true },
  ],
};
