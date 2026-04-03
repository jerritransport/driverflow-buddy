

## Soft-Delete "Hide Driver" System

### Overview
Add an `is_hidden` boolean column to the `drivers` table and replace the hard-delete flow with a soft-delete (hide/restore) system. Hidden drivers are excluded from all queries by default, with an optional toggle to reveal them.

### 1. Database Migration
Add column `is_hidden BOOLEAN DEFAULT false` to the `drivers` table.

### 2. Query Changes — Filter out hidden drivers

**Files: `src/hooks/useDriversManagement.ts`, `src/hooks/useDrivers.ts`**

- Add `showHidden?: boolean` to `DriverFilters` interface
- In `useDriversPaginated` and `useAllFilteredDrivers`: when `showHidden` is not true, add `.eq('is_hidden', false)` to both count and data queries
- In `useDrivers` (used by dashboard/kanban): add `.eq('is_hidden', false)` to all queries
- In `useDriversByStep`: add `.eq('is_hidden', false)`
- Add `is_hidden` field to the `Driver` interface

### 3. Replace hard-delete with soft-delete

**File: `src/hooks/useDriversManagement.ts`**
- Change `useDeleteDriver` to perform `UPDATE ... SET is_hidden = true` instead of `DELETE`
- Add new `useRestoreDriver` hook that sets `is_hidden = false`

### 4. Update DeleteDriverDialog → HideDriverDialog

**File: `src/components/drivers/DeleteDriverDialog.tsx`**
- Rename to conceptually be "Hide Driver"
- Update title to "Hide Driver"
- Update description to: "Are you sure you want to hide this driver? This will remove them from the active dashboard but will not permanently delete their data."
- Button text: "Hide Driver"
- Success toast: "Driver Hidden"

### 5. Add "Show Hidden Drivers" toggle to Drivers page

**File: `src/pages/Drivers.tsx`**
- Add a checkbox/switch labeled "Show Hidden Drivers" near the filters area
- When toggled on, set `filters.showHidden = true`
- Hidden drivers render with `opacity-50` styling in the table
- Show a "Hidden" badge on hidden driver rows

### 6. Add "Restore Driver" button for hidden drivers

**File: `src/components/drivers/DriversTable.tsx`**
- When a driver has `is_hidden === true`, show a "Restore" option in the row actions dropdown (instead of or in addition to the existing actions)
- Calls `useRestoreDriver` hook

### 7. Add "Hide Driver" button to Driver Detail Panel

**File: `src/components/driver-detail/QuickActions.tsx`**
- Add a "Hide Driver" button (destructive outline style) at the bottom of quick actions
- Opens the same confirmation dialog

### 8. Styling for hidden drivers in table

**File: `src/components/drivers/DriversTable.tsx`**
- Add conditional `opacity-50` class on the table row when `driver.is_hidden`
- Add a "Hidden" badge next to the driver name

### Technical notes
- The audit trail trigger already captures UPDATE operations on the drivers table, so hiding/restoring will be automatically logged with changed fields and timestamps
- No changes needed to reports — they already query through the same hooks that will filter `is_hidden`
- Global search (`useGlobalSearch`) should also filter hidden drivers

