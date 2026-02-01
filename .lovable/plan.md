
# RTD Dashboard - Complete Overhaul Implementation Plan

## Executive Summary
This plan implements the remaining 42 changes from the client checklist. Several items (12 of 54) are already complete from previous work, including the Notes tab, Follow-Up button, optional form fields, and RTD Dashboard rename.

---

## Phase 1: Database Migrations (Run First)

### New Tables & Columns
```sql
-- 1. Add test result tracking fields to drivers
ALTER TABLE drivers 
  ADD COLUMN IF NOT EXISTS sample_id VARCHAR(50),
  ADD COLUMN IF NOT EXISTS collection_date DATE,
  ADD COLUMN IF NOT EXISTS test_status VARCHAR(50) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS urine_result_url TEXT,
  ADD COLUMN IF NOT EXISTS alcohol_result_url TEXT,
  ADD COLUMN IF NOT EXISTS ccf_url TEXT;

-- 2. Create intake_forms table
CREATE TABLE IF NOT EXISTS intake_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  form_pdf_url TEXT,
  cdl_attachment_url TEXT,
  source VARCHAR(50) DEFAULT 'bolo',
  status VARCHAR(50) DEFAULT 'received',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE intake_forms ENABLE ROW LEVEL SECURITY;

-- Grant permissions
CREATE POLICY "Authenticated users can manage intake_forms" ON intake_forms 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
GRANT SELECT, INSERT, UPDATE, DELETE ON intake_forms TO authenticated;
```

---

## Phase 2: Navigation & Sidebar Changes

### Files to Modify
- `src/components/layout/AppSidebar.tsx`
- `src/App.tsx`

### Changes
1. **Remove Clinics** from `mainNavItems` array
2. **Add new menu items** in this order:
   - Dashboard (keep)
   - Drivers (keep)
   - Follow-Ups (NEW) - icon: `Calendar`
   - Intake Forms (NEW) - icon: `FileText`
   - SAPs (keep)
   - Test Results (NEW) - icon: `FlaskConical`
   - Reports (keep)

3. **Add routes** in `App.tsx`:
   - `/follow-ups` → FollowUps page
   - `/intake-forms` → IntakeForms page
   - `/test-results` → TestResults page

4. **Remove** Clinics route from App.tsx (or keep for backwards compatibility but hide from nav)

---

## Phase 3: Dashboard Home Changes

### Files to Modify
- `src/components/dashboard/SummaryCards.tsx`
- `src/lib/constants.ts`
- `src/hooks/useDashboardSummary.ts`

### Rename Labels
| Current | New |
|---------|-----|
| "Needs Attention" / "Drivers on hold" | "Needs Follow-Up" |
| "Payment Hold" badge | "Follow-Up" badge |

### Add Sidebar Stats Cards (Right Side)
Create new component: `src/components/dashboard/QuickStatsPanel.tsx`

Stats to show:
- **"Received Donor Pass Today"** - COUNT of drivers where `donor_pass_generated_at = TODAY`
- **"Pending Drivers"** - COUNT of drivers in steps 1-6
- **"Follow-Ups Due Today"** - COUNT of drivers where `follow_up_date = TODAY`

### Dashboard Layout Update
Modify `src/pages/Dashboard.tsx` to add a right sidebar with QuickStatsPanel:
```text
+---------------------------+----------+
| Summary Cards (full width)           |
+---------------------------+----------+
| Kanban/Table View         | Quick    |
| (main content)            | Stats    |
|                           | Panel    |
+---------------------------+----------+
```

---

## Phase 4: New Page - Follow-Ups (/follow-ups)

### New Files
- `src/pages/FollowUps.tsx`
- `src/hooks/useFollowUps.ts`
- `src/components/follow-ups/FollowUpCard.tsx`
- `src/components/follow-ups/FollowUpFilters.tsx`

### Page Structure
```text
+----------------------------------------+
| Follow-Ups                              |
| [Due Today] [Upcoming] [Overdue] [All]  |
+----------------------------------------+
| Stats: Due Today: X | Overdue: X | Week: X
+----------------------------------------+
| +-------------+  +-------------+        |
| | Driver Name |  | Driver Name |        |
| | Phone       |  | Phone       |        |
| | Due: Jan 30 |  | Due: Feb 1  |        |
| | Note: ...   |  | Note: ...   |        |
| | [Complete] [Reschedule] [View]        |
| +-------------+  +-------------+        |
+----------------------------------------+
```

### Features
- **Tabs**: Due Today | Upcoming | Overdue | All
- **Cards showing**: Driver name, phone, follow-up date, follow-up note
- **Quick actions**: Mark Complete, Reschedule, View Driver
- **Date range filter**
- **Search by driver name**

### Query Hook
```typescript
useFollowUps({ 
  filter: 'today' | 'upcoming' | 'overdue' | 'all',
  search?: string,
  dateRange?: { start: Date, end: Date }
})
```

---

## Phase 5: New Page - Intake Forms (/intake-forms)

### New Files
- `src/pages/IntakeForms.tsx`
- `src/hooks/useIntakeForms.ts`
- `src/components/intake-forms/IntakeFormStats.tsx`
- `src/components/intake-forms/IntakeFormTable.tsx`

### Page Structure
```text
+----------------------------------------+
| Intake Forms                            |
| Track BOLO form submissions             |
+----------------------------------------+
| +------------+ +------------+ +--------+|
| | This Week  | | This Month | | Weekly ||
| |     5      | |     23     | | Avg: 6 ||
| +------------+ +------------+ +--------+|
+----------------------------------------+
| Driver Name | Submission Date | Status  |
|-------------|-----------------|---------|
| John Doe    | Jan 30, 2026    | Received|
+----------------------------------------+
```

### Features
- **Statistics Cards**: Total this week, Total this month, Weekly average
- **Table**: Driver name, Submission date, Status, Actions (View PDF, View Driver)
- **Note**: Placeholder for BOLO webhook integration later

---

## Phase 6: New Page - Test Results (/test-results)

### New Files
- `src/pages/TestResults.tsx`
- `src/hooks/useTestResults.ts`
- `src/components/test-results/TestResultCard.tsx`
- `src/components/test-results/TestResultFilters.tsx`

### Page Structure
```text
+----------------------------------------+
| Test Results                            |
| [Pending] [Completed] [All]             |
+----------------------------------------+
| +--------------------------------------+|
| | John Doe                    [Pending]||
| | Test Type: Drug + Alcohol            ||
| | Sample ID: CCF-123456789             ||
| | Collection Date: Jan 28, 2026        ||
| |                                      ||
| | [Urine Result: Pending]              ||
| | [Alcohol Result: Pending]            ||
| | [CCF: Download]                      ||
| +--------------------------------------+|
+----------------------------------------+
```

### Test Status Flow
`Pending → Received → Laboratory → MRO → Reported → Completed`

### Card Features
- Driver name with status badge
- Test type (Urine only or Drug + Alcohol)
- **Sample ID** (CCF number) - NOT authorization ID
- Collection date
- **Download buttons**:
  - "Urine Result" - disabled/gray if `urine_result_url` is null
  - "Alcohol Result" - only show if `requires_alcohol_test = true`
  - "CCF" (Chain of Custody Form) - links to `ccf_url`

---

## Phase 7: Driver Detail Panel Updates

### Files to Modify
- `src/components/driver-detail/DriverDetailPanel.tsx`
- `src/components/driver-detail/PersonalInfoTab.tsx`

### Add Test Results Section
In PersonalInfoTab or new TestResultsSection component:
- Display Sample ID (CCF number)
- Collection date
- Current test status badge
- Download buttons for: Urine Result, Alcohol Result (if applicable), CCF
- Show "Pending" for documents not yet available

### Donor Pass Document
When donor pass is generated:
- Store URL reference in `documents` table OR add `donor_pass_url` to drivers
- Show in Documents tab as downloadable

---

## Phase 8: Reports Page Updates

### Files to Modify
- `src/pages/Reports.tsx`
- `src/components/reports/index.ts`

### Changes
1. **Remove** `ClinicPerformanceChart` import and usage
2. **Keep** SapPerformanceChart (SAP referral tracking)
3. Optionally add Intake Form statistics chart

---

## Implementation Summary

### New Files to Create (13)
| File | Purpose |
|------|---------|
| `src/pages/FollowUps.tsx` | Follow-ups page |
| `src/pages/IntakeForms.tsx` | Intake forms page |
| `src/pages/TestResults.tsx` | Test results page |
| `src/hooks/useFollowUps.ts` | Follow-ups data hook |
| `src/hooks/useIntakeForms.ts` | Intake forms data hook |
| `src/hooks/useTestResults.ts` | Test results data hook |
| `src/components/follow-ups/FollowUpCard.tsx` | Follow-up card component |
| `src/components/follow-ups/FollowUpFilters.tsx` | Follow-up filters |
| `src/components/intake-forms/IntakeFormStats.tsx` | Stats cards |
| `src/components/intake-forms/IntakeFormTable.tsx` | Forms table |
| `src/components/test-results/TestResultCard.tsx` | Test result card |
| `src/components/test-results/TestResultFilters.tsx` | Result filters |
| `src/components/dashboard/QuickStatsPanel.tsx` | Dashboard sidebar stats |

### Files to Modify (8)
| File | Changes |
|------|---------|
| `src/components/layout/AppSidebar.tsx` | Remove Clinics, add 3 new nav items |
| `src/App.tsx` | Add 3 new routes |
| `src/pages/Dashboard.tsx` | Add QuickStatsPanel sidebar |
| `src/components/dashboard/SummaryCards.tsx` | Rename labels |
| `src/pages/Reports.tsx` | Remove ClinicPerformanceChart |
| `src/components/driver-detail/PersonalInfoTab.tsx` | Add test results section |
| `src/lib/constants.ts` | Update status labels |
| `src/integrations/supabase/types.ts` | Auto-updated by migration |

### Database Changes (1 migration)
- Add 6 columns to `drivers` table for test results
- Create `intake_forms` table with RLS

---

## Prioritized Implementation Order

### Priority 1 - Navigation (Immediate)
1. Database migration for new fields
2. Remove Clinics from sidebar
3. Add Follow-Ups, Intake Forms, Test Results to sidebar
4. Create basic page components with routing

### Priority 2 - Dashboard Updates
5. Rename status labels ("Payment Hold" → "Follow-Up")
6. Add QuickStatsPanel sidebar

### Priority 3 - Core Pages
7. Implement Follow-Ups page with filters
8. Implement Test Results page with cards
9. Implement Intake Forms page with statistics

### Priority 4 - Detail Panel
10. Add test results section to driver detail
11. Update Reports page (remove clinic chart)

---

## Out of Scope (Confirmed)
- ❌ Billing page
- ❌ Affiliates page
- ❌ CRL auto-polling (n8n workflow - separate integration)
- ❌ BOLO form auto-sync (webhook integration - separate)
