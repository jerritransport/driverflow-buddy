

## Problem

The "Add New SAP" form fails with a **403 "permission denied for table saps"** error. The database returns error code `42501`.

## Root Cause

The RLS policies on the `saps` table are all **RESTRICTIVE** (`Permissive: No`). In PostgreSQL, RESTRICTIVE policies alone are not sufficient to grant access -- there must be at least one **PERMISSIVE** policy that passes. Since all three existing policies (SELECT, INSERT, UPDATE) are RESTRICTIVE, no authenticated user can actually insert into the table, even though the check expression is `true`.

The same issue likely affects SELECT and UPDATE, but SELECT works because there's probably a grant allowing it at a different level. INSERT is strictly blocked.

## Fix

Run a migration to drop the existing RESTRICTIVE INSERT policy and recreate it as a **PERMISSIVE** policy. To be safe and consistent, do the same for SELECT and UPDATE policies on the `saps` table.

```sql
-- Drop restrictive policies
DROP POLICY IF EXISTS "saps_insert_policy" ON public.saps;
DROP POLICY IF EXISTS "saps_select_policy" ON public.saps;
DROP POLICY IF EXISTS "saps_update_policy" ON public.saps;

-- Recreate as PERMISSIVE
CREATE POLICY "saps_select_policy" ON public.saps
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "saps_insert_policy" ON public.saps
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "saps_update_policy" ON public.saps
  FOR UPDATE TO authenticated USING (true);
```

Additionally, improve the error toast in `SapFormDialog.tsx` to surface the actual backend error message instead of a generic "Failed to create SAP" message, making future debugging easier.

## Files to Change
1. **New migration** -- Fix RLS policies on the `saps` table
2. **`src/components/sap/SapFormDialog.tsx`** -- Surface specific error messages in the toast

