

## Add Step 5 (Donor Pass) Action Buttons

Step 5 has two statuses: `DONOR_PASS_PENDING` and `DONOR_PASS_SENT`. Currently, `QuickActions.tsx` has conditional button sections for Step 3 and Step 6 but nothing for Step 5.

### Change

**File: `src/components/driver-detail/QuickActions.tsx`**

Add a new conditional block for `driver.current_step === 5`, placed between the existing Step 3 and Step 6 blocks (around line 183). Two buttons:

1. **"Donor Pass Pending"** — outline/secondary style, sets status to `DONOR_PASS_PENDING`
2. **"Donor Pass Sent"** — primary green style (matches "Paperwork Received" pattern), sets status to `DONOR_PASS_SENT`

Both use the existing `handleSetStatus` function. Each button is disabled when the driver already has that status or when `advanceStep.isPending`.

