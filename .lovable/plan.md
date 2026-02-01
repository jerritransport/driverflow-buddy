

# Fix Driver Creation - Empty Date Field Bug

## Problem Identified

The PostgreSQL error logs reveal the exact issue:

```
ERROR: invalid input syntax for type date: ""
```

When creating a driver with minimal information (name, email, phone only), the form sends empty strings `""` for optional date fields (`date_of_birth`, `cdl_expiration`). PostgreSQL's `date` type cannot accept empty strings - it requires either a valid date or `NULL`.

## Solution

Two files need modification to ensure empty form values are converted to `null` before database insertion.

---

### File 1: `src/hooks/useDriversManagement.ts`

Add a data sanitization step before inserting into the database that converts empty strings to `null` for all optional fields.

**Changes (in `useCreateDriver` mutation):**

```typescript
export function useCreateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDriverData) => {
      // Sanitize data: convert empty strings to null for optional fields
      const sanitizedData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        middle_name: data.middle_name || null,
        gender: data.gender || null,
        date_of_birth: data.date_of_birth || null,
        cdl_number: data.cdl_number || null,
        cdl_state: data.cdl_state || null,
        cdl_expiration: data.cdl_expiration || null,
        address_line1: data.address_line1 || null,
        address_line2: data.address_line2 || null,
        city: data.city || null,
        state: data.state || null,
        zip_code: data.zip_code || null,
        employer_name: data.employer_name || null,
        employer_contact: data.employer_contact || null,
        requires_alcohol_test: data.requires_alcohol_test ?? false,
      };

      const { data: driver, error } = await supabase
        .from('drivers')
        .insert({
          ...sanitizedData,
          status: 'INTAKE_PENDING',
          current_step: 1,
          payment_status: 'UNPAID',
          payment_hold: false,
          amount_paid: 0,
          amount_due: data.amount_due ?? 450,
        })
        .select()
        .single();

      if (error) throw error;
      return driver;
    },
    // ... rest unchanged
  });
}
```

---

### File 2: `src/components/drivers/DriverFormDialog.tsx`

Update the `onSubmit` handler to also ensure empty strings are cleaned before calling the mutation (belt and suspenders approach).

**Changes (in `onSubmit` function, approximately line 113-141):**

```typescript
const onSubmit = async (values: DriverFormValues) => {
  try {
    // Clean empty strings to undefined for optional fields
    const cleanedValues = {
      ...values,
      middle_name: values.middle_name || undefined,
      gender: values.gender || undefined,
      date_of_birth: values.date_of_birth || undefined,
      cdl_number: values.cdl_number || undefined,
      cdl_state: values.cdl_state || undefined,
      cdl_expiration: values.cdl_expiration || undefined,
      address_line1: values.address_line1 || undefined,
      address_line2: values.address_line2 || undefined,
      city: values.city || undefined,
      state: values.state || undefined,
      zip_code: values.zip_code || undefined,
      employer_name: values.employer_name || undefined,
      employer_contact: values.employer_contact || undefined,
    };

    if (isEditing && driver) {
      await updateDriver.mutateAsync({
        driverId: driver.id,
        updates: cleanedValues,
      });
      // ...
    } else {
      await createDriver.mutateAsync(cleanedValues as CreateDriverData);
      // ...
    }
    // ...
  } catch (error) {
    // ...
  }
};
```

---

## Why This Fixes the Issue

| Field | Form Value | Before Fix (sent to DB) | After Fix (sent to DB) |
|-------|------------|------------------------|------------------------|
| `date_of_birth` | `` (empty) | `""` (causes error) | `null` (valid) |
| `cdl_expiration` | `` (empty) | `""` (causes error) | `null` (valid) |
| `gender` | unselected | `""` or `undefined` | `null` (valid) |
| `cdl_state` | unselected | `""` or `undefined` | `null` (valid) |

---

## Testing Plan (After Implementation)

1. Open the driver creation form
2. Fill in only: First Name, Last Name, Email, Phone
3. Leave all other fields empty (Gender, DOB, CDL, Address, etc.)
4. Submit the form
5. Expected: Driver creates successfully with a success toast

---

## Technical Details

- PostgreSQL date columns accept `DATE` values or `NULL`, never empty strings
- The form uses controlled inputs which default to empty strings for unfilled optional fields
- The fix sanitizes data at two levels (form + mutation) for robustness
- No database migration required - the columns are already nullable

