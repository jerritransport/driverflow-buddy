

# Audit Results and Implementation Plan

## Status Summary

| # | Feature | Status | Action |
|---|---------|--------|--------|
| 1 | Intake Forms page statistics | DONE | No changes needed |
| 2 | Drag-and-drop Kanban cards | MISSING | Implement |
| 3 | Document counter on driver cards | PARTIAL | Update doc list to 9, add to Drivers table |
| 4 | Upload documents during driver creation | MISSING | Implement |
| 5 | Resend email/text buttons | DONE | No changes needed |
| 6 | Separate employer contact fields | MISSING | Implement (migration + UI) |
| 7 | SAP referral tracking in Reports | DONE | No changes needed |

---

## What's Already Done (No Changes)

- **Item 1**: `IntakeFormStats.tsx` shows "This Week", "This Month", and "Weekly Average" cards using `useIntakeFormStats` hook
- **Item 5**: `CommunicationActions.tsx` has "Resend Welcome Email", "Resend Donor Pass", and "Resend Congratulations" buttons with toast confirmations
- **Item 7**: `SapPerformanceChart.tsx` shows a bar chart of drivers assigned vs. completed by SAP, using the `sap_performance` view

---

## Implementation Plan for Missing Features

### Item 2: Drag-and-Drop Kanban

**What**: Allow dragging driver cards between Kanban columns to change their workflow step.

**Changes**:
- Install `@hello-pangea/dnd` library
- Wrap `KanbanView.tsx` with `DragDropContext`, each column with `Droppable`, each card with `Draggable`
- On drop: call `useAdvanceDriverStep` to update `current_step` and `status` in the database
- Add visual feedback (highlight target column, card shadow while dragging)

**Files modified**:
- `src/components/dashboard/KanbanView.tsx` -- add DnD wrappers and drop handler

---

### Item 3: Document Counter (Expand to 9 Documents + Add to Table)

**What**: Update the document tracking list from 7 to 9 types and add the counter to the Drivers table view.

**Updated document list** (9 types):
1. Intake Form
2. CDL Photo
3. Clearinghouse Query Acceptance
4. Clearinghouse Consent
5. SAP Paperwork
6. Test Result
7. Chain of Custody
8. Alcohol Testing Form
9. Not Prohibited Screenshot

**Files modified**:
- `src/components/shared/DocumentProgress.tsx` -- expand `DOCUMENT_TYPES` array to 9 items
- `src/components/drivers/DriversTable.tsx` -- add a "Docs" column using `DocumentProgress`

---

### Item 4: Document Upload During Driver Creation

**What**: Add an optional file upload section to the "Add Driver" form that saves files to Supabase Storage and links them to the driver record.

**Changes**:
- Create a storage bucket `rtd-documents` (if not already present) with appropriate RLS policies
- Add file input fields to `DriverFormDialog.tsx` for common initial documents (CDL Photo, Intake Form)
- After driver creation, upload files to storage and insert records into the `documents` table
- Show upload progress indicators

**Files modified**:
- `src/components/drivers/DriverFormDialog.tsx` -- add file upload section after employer info
- Database migration: create `rtd-documents` storage bucket if it doesn't exist

---

### Item 6: Separate Employer Contact Fields

**What**: Replace the single `employer_contact` column with three separate fields.

**Database migration**:
```sql
ALTER TABLE drivers ADD COLUMN employer_contact_name varchar;
ALTER TABLE drivers ADD COLUMN employer_job_title varchar;
ALTER TABLE drivers ADD COLUMN employer_phone varchar;
-- Migrate existing data (best-effort copy to contact_name)
UPDATE drivers SET employer_contact_name = employer_contact WHERE employer_contact IS NOT NULL;
```

**Files modified**:
- `src/components/drivers/DriverFormDialog.tsx` -- replace single employer_contact field with three fields (Contact Name, Job Title, Phone)
- `src/components/driver-detail/PersonalInfoTab.tsx` -- display the three separate fields instead of one
- `src/hooks/useDriversManagement.ts` -- update `CreateDriverData` type
- `src/hooks/useDriverDetails.ts` -- update driver update mutations if needed

Note: The old `employer_contact` column will be kept for backward compatibility but the UI will use the new fields.

---

## Technical Considerations

- The drag-and-drop implementation will use optimistic updates so the card moves instantly while the database update happens in the background
- File uploads use Supabase Storage with the existing `rtd-documents` bucket (already referenced in the `documents` table schema)
- The employer field migration preserves existing data by copying `employer_contact` into `employer_contact_name`
- All new database columns are nullable to avoid breaking existing records

