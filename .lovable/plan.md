
# Fix Driver Status Overview Count Mismatch

## Problem Summary
The sidebar shows "Follow-Up: 0" but David Williams appears with a "Follow-Up" badge in the table. This happens because:
- The database stores status as `PAYMENT_HOLD` 
- The UI displays it as "Follow-Up" (via STATUS_LABELS mapping)
- The sidebar counts are checking for literal `FOLLOW_UP` status which doesn't exist

## Solution
Update the `DriverStatusOverview` component to count `PAYMENT_HOLD` status (which displays as "Follow-Up") instead of looking for a non-existent `FOLLOW_UP` value.

## Implementation

### File: `src/components/dashboard/DriverStatusOverview.tsx`

**Change the follow-up count logic (lines 30-33):**

Current code:
```typescript
const followUp = drivers?.filter(d => 
  d.status === 'FOLLOW_UP' || 
  (d.follow_up_date && d.follow_up_date >= today)
).length || 0;
```

Updated code:
```typescript
const followUp = drivers?.filter(d => 
  d.status === 'PAYMENT_HOLD' || 
  (d.follow_up_date && d.follow_up_date >= today)
).length || 0;
```

## Why This Works
- `PAYMENT_HOLD` is the actual database value (confirmed: 1 driver has this status)
- The StatusBadge component displays `PAYMENT_HOLD` as "Follow-Up" via the STATUS_LABELS mapping
- This ensures the sidebar count matches what users see in the table

## Technical Notes
- No database changes required
- Single line change in the component
- Maintains consistency with existing STATUS_LABELS convention
- Also keeps the `follow_up_date` check as a secondary condition for future use
