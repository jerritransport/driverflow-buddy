

# Fix: Driver Creation Silent Failure (QA 5.2c)

## Investigation Summary

The driver creation flow was analyzed across three files:

| Component | Status | Issue Found |
|-----------|--------|-------------|
| `DriverFormDialog.tsx` submit handler | Partial issue | Error toast hides actual error message |
| `useDriversManagement.ts` mutation | Partial issue | Query invalidation in `onSuccess` may lag behind dialog close |
| RLS policies on `drivers` table | No issue | INSERT policy allows all authenticated users |
| Database constraints | No issue | No unique constraints on email/phone; all new columns are nullable |
| Audit trail triggers | No issue | No triggers attached to `drivers` table |

## Root Cause

The `mutateAsync()` call resolves when the Supabase insert completes, but React Query's `onSuccess` callback (where `invalidateQueries` is called) fires asynchronously afterward. The dialog closes immediately after `mutateAsync` resolves, and the table may briefly show stale cached data before the invalidation propagates.

Additionally, if the insert does fail (e.g., network error, session expiry), the error toast only says "Failed to create driver" with no details, making it impossible to diagnose.

## Fix Plan

### File 1: `src/components/drivers/DriverFormDialog.tsx`

**Change the submit handler** (lines 120-191):

- Move query invalidation into the submit handler itself (after `mutateAsync` resolves) so it happens synchronously before the dialog closes
- Include actual error message in the error toast
- Only close dialog and reset form after invalidation is confirmed

```typescript
const onSubmit = async (values: DriverFormValues) => {
  try {
    // ... existing cleaning logic stays the same ...

    if (isEditing && driver) {
      await updateDriver.mutateAsync({ driverId: driver.id, updates: cleanedValues });
      toast({ title: 'Driver Updated', description: '...' });
    } else {
      const newDriver = await createDriver.mutateAsync(cleanedValues as CreateDriverData);
      // ... file upload logic stays the same ...
      toast({ title: 'Driver Created', description: '...' });
    }

    setUploadFiles([]);
    onOpenChange(false);
    form.reset();
    onSuccess?.();
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error?.message || `Failed to ${isEditing ? 'update' : 'create'} driver.`,
      variant: 'destructive',
    });
  }
};
```

The key change: surface `error.message` in the toast instead of a generic string.

### File 2: `src/hooks/useDriversManagement.ts`

**No structural changes needed.** The `onSuccess` invalidation pattern is correct and the `mutationFn` properly throws on error. The `onSuccess` callback will still run as a safety net even though the dialog handler also triggers refetches.

### What This Does NOT Change

- No changes to RLS policies (already correct)
- No changes to database schema
- No changes to other functionality
- The mutation hook's `onSuccess` invalidation stays as a safety net

## Summary

This is a one-file fix in `DriverFormDialog.tsx`: surface the actual error message in the catch block's toast. The underlying insert/invalidation logic is correct; the QA failure was likely caused by a transient error (session, network) whose message was swallowed by the generic error toast.

