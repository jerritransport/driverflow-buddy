## Goal

Make the four summary cards on the Dashboard clickable, plus equivalent stat cards on other nav pages. Clicking a card navigates to the relevant list page with the appropriate filter pre-applied.

## Dashboard cards → destinations

In `src/components/dashboard/SummaryCards.tsx`:

| Card | Click destination |
|---|---|
| Total Drivers | `/drivers` (no filter) |
| Needs Follow-Up | `/follow-ups` |
| In Progress | `/drivers?status=in_progress` (excludes completed) |
| Completed | `/drivers?completed=true` |

## Other nav pages with stat cards

| Page | Cards | Click behavior |
|---|---|---|
| `Drivers.tsx` (`QuickStatCard` x4) | Total Drivers, Pending Final Balance, Alcohol Test Required, RTD Complete | Apply local filter on the same page (set `filters` state) — no navigation needed |
| `IntakeForms.tsx` (`IntakeFormStats` — This Week / Month / Avg) | Skip — these are pure metrics with no meaningful filter target |
| `Admin.tsx` (`AdminStats` — Total Users, Admins, Staff, Recent Changes) | Skip — informational only, no destination list |

Confirmed scope: only cards that map to a meaningful filtered list become clickable.

## Implementation details

1. **`SummaryCards.tsx`**
   - Add `onClick?: () => void` to `SummaryCardProps`.
   - When set, render the `Card` with `cursor-pointer hover:shadow-md transition` and `role="button"` + keyboard handler (Enter/Space).
   - In the parent component, use `useNavigate()` to wire the four cards to their routes.

2. **`Drivers.tsx` `QuickStatCard`**
   - Add optional `onClick` prop with same hover/cursor styling.
   - Wire each card to call `handleFiltersChange` with the matching filter:
     - Total Drivers → `{}`
     - Pending Final Balance → `{ paymentStatus: 'UNPAID' }` (and toggle to include DEPOSIT — use a new filter or just UNPAID; keep simple: filter to UNPAID)
     - Alcohol Test Required → `{ requiresAlcoholTest: true }`
     - RTD Complete → `{ status: 'rtd_complete' }` (or add a `completed` boolean filter if needed)

3. **Filter support**
   - Verify `DriverFilters` already supports `status`, `paymentStatus`, `requiresAlcoholTest` (it does). For "In Progress" / "Completed" via URL, parse `searchParams` in `Drivers.tsx` on mount and seed `filters` state.

4. **Accessibility**
   - Clickable cards get `role="button"`, `tabIndex={0}`, and Enter/Space keydown handler.

## Out of scope

- Admin stats cards and Intake Form metric cards (no meaningful destination).
- Adding new filter fields to the database or backend.
- Changes to Reports page chart cards.
