

## Fix: Driver Status Overview Follow-Up Count

**Problem**: The sidebar shows "Follow-Up: 0" despite a `PAYMENT_HOLD` driver existing in the pipeline table. The follow-up count logic is too narrow — it only counts future `follow_up_date` values and does a strict case-sensitive status check.

**Root cause in `DriverStatusOverview.tsx` (lines 30-33)**:
```typescript
const followUp = drivers?.filter(d => 
  d.status === 'PAYMENT_HOLD' || 
  (d.follow_up_date && d.follow_up_date >= today)
).length || 0;
```
This misses:
- Case variations (e.g., `payment_hold` vs `PAYMENT_HOLD`)
- Drivers with past/overdue `follow_up_date` values
- Any other follow-up-related statuses

**Fix**: Update the follow-up filter in `src/components/dashboard/DriverStatusOverview.tsx` to use case-insensitive matching and count any driver with a `follow_up_date` set (regardless of date):

```typescript
const followUp = drivers?.filter(d => {
  const s = d.status?.toUpperCase();
  return s === 'PAYMENT_HOLD' || 
         s === 'FOLLOW_UP' || 
         d.follow_up_date != null;
}).length || 0;
```

**Single file change**: `src/components/dashboard/DriverStatusOverview.tsx`, lines 30-33 only.

