

## Add "Hide Drivers" to Bulk Actions Bar

Add a "Hide" button to the floating bulk actions bar (`src/components/drivers/BulkActionsBar.tsx`) that sets `is_hidden = true` for all selected drivers, with a confirmation dialog before executing.

### Changes

**1. `src/components/drivers/BulkActionsBar.tsx`**
- Import `useBulkUpdateDrivers` (already imported) — use it to bulk-set `is_hidden: true`
- Add a "Hide" button (using `EyeOff` icon) next to the existing Hold button
- On click, show a confirmation dialog: "Are you sure you want to hide {count} driver(s)? They will be removed from the active dashboard."
- On confirm, call `bulkUpdate({ driverIds: selectedIds, updateData: { is_hidden: true } })` and clear selection

**2. Confirmation approach**
- Use an inline `AlertDialog` within the component (same pattern as `DeleteDriverDialog`)
- State variable `hideConfirmOpen` controls visibility

