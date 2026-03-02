

## Fix: Rename "Payment Hold" to "Follow-Up" in DRIVER_STATUSES

**File**: `src/lib/constants.ts`, line 16

The `STATUS_LABELS` map already has `PAYMENT_HOLD: 'Follow-Up'`, but the `DRIVER_STATUSES` array (used in dropdowns/filters) still says `'Payment Hold'`. Change it to `'Follow-Up'`.

```typescript
// Line 16: Change from
{ value: 'PAYMENT_HOLD', label: 'Payment Hold' },
// to
{ value: 'PAYMENT_HOLD', label: 'Follow-Up' },
```

