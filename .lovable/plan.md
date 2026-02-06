

# Dashboard and Workflow Updates

Based on the uploaded PDF reference, here are the changes to be implemented:

## 1. Workflow Step Label Renaming

Update the step labels displayed throughout the app (Kanban columns, step timeline, etc.):

| Current Label | New Label |
|--------------|-----------|
| Consent | Consent Form |
| Clearinghouse | Designation |
| Drug Test | Donor Pass |
| Complete | Step 5 Complete |

### File: `src/lib/constants.ts`

```typescript
export const DRIVER_STEPS = [
  { step: 1, label: 'Consent Form', statuses: ['INTAKE_PENDING'] },
  { step: 2, label: 'Payment', statuses: ['PAYMENT_HOLD', 'PAYMENT_COMPLETE'] },
  { step: 3, label: 'SAP Paperwork', statuses: ['SAP_REQUEST_PENDING', 'SAP_PAPERWORK_PENDING', 'ALCOHOL_FEE_PENDING'] },
  { step: 4, label: 'Designation', statuses: ['CLEARINGHOUSE_PENDING', 'CLEARINGHOUSE_AUTOMATING', 'CLEARINGHOUSE_COMPLETE'] },
  { step: 5, label: 'Donor Pass', statuses: ['DONOR_PASS_PENDING', 'DONOR_PASS_SENT'] },
  { step: 6, label: 'Results', statuses: ['TEST_IN_PROGRESS', 'RESULT_RECEIVED'] },
  { step: 7, label: 'Step 5 Complete', statuses: ['RTD_COMPLETE'] },
] as const;
```

Also update the `STATUS_LABELS` mapping to use consistent terminology:
- `CLEARINGHOUSE_PENDING` -> "Designation Pending"
- `CLEARINGHOUSE_AUTOMATING` -> "Designation Automating"
- `CLEARINGHOUSE_COMPLETE` -> "Designation Complete"

---

## 2. Add Clinics Navigation Back

The Clinics page already exists (`src/pages/Clinics.tsx`). Will verify it's accessible in the sidebar navigation.

### File: `src/components/layout/AppSidebar.tsx`

Ensure "Clinics" appears in the navigation menu with a building/hospital icon.

---

## 3. Alcohol Test Automation Enhancement

The PDF mentions that "Requires Alcohol Test" should:
- Pull data from SAP Counselor paperwork automatically
- Generate a notification for team review
- Allow team to auto-generate a payment link message to the driver

### Implementation Approach:

**3a. Add notification trigger when `requires_alcohol_test` is set**

Create a database trigger that inserts a notification when a driver's `requires_alcohol_test` field is updated to `true`.

**3b. Add "Send Alcohol Test Payment Link" action button**

In the driver detail panel (`src/components/driver-detail/`), add a new action button that:
- Is visible when `requires_alcohol_test = true` AND `status` is in SAP step
- Opens a confirmation dialog
- Sends a pre-formatted message to the driver with payment link

### New Files:
- `src/components/driver-detail/SendAlcoholPaymentDialog.tsx` - Dialog to compose/send the payment link message

### Modified Files:
- `src/components/driver-detail/QuickActions.tsx` - Add the new action button

---

## Technical Details

### Database Migration (if needed for notifications)
```sql
-- Trigger to create notification when alcohol test is required
CREATE OR REPLACE FUNCTION notify_alcohol_test_required()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.requires_alcohol_test = true AND (OLD.requires_alcohol_test IS NULL OR OLD.requires_alcohol_test = false) THEN
    -- Insert notification logic here (depends on notifications table structure)
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Component Changes Summary

| File | Change |
|------|--------|
| `src/lib/constants.ts` | Update DRIVER_STEPS labels, update STATUS_LABELS |
| `src/components/layout/AppSidebar.tsx` | Verify Clinics navigation link exists |
| `src/components/driver-detail/QuickActions.tsx` | Add "Send Alcohol Payment Link" button |
| `src/components/driver-detail/SendAlcoholPaymentDialog.tsx` | New dialog for sending payment message |

---

## Future Considerations (Mentioned but not implemented now)

The PDF also mentions:
- **Owner Operator / Trucking Company Portal** - A new portal for external users. This is a larger feature requiring authentication roles, separate routes, and potentially a different UI. This should be discussed separately.
- **Auto-extraction of SAP contact info** - This would require document parsing/OCR capabilities which are beyond the current scope.

