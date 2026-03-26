

## Login Page UI & Wording Fix

### Issues Identified
1. Placeholder text "you@example.com" and "John Doe" are generic/demo text
2. "Are you a CTPA student? Register here" is confusing and misaligned with the sub-account concept
3. Card lacks shadow and polish (no elevated shadow, tight spacing)
4. Subtitle "GetOut of Prohibited" needs proper spacing: "Get Out of Prohibited"
5. Sign Up tab exposes a raw signup form that should not be on the main login — sub-accounts register via `/register`

### Plan

**File: `src/pages/Login.tsx`**

1. **Remove the Tabs (Sign In / Sign Up)** — The login page should only show the Sign In form. Sub-account registration is handled at `/register`. Remove the `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, and the entire Sign Up form. Keep only the sign-in form.

2. **Fix branding text** — Change subtitle from `"GetOut of Prohibited"` to `"Get Out of Prohibited"` (with spaces). Bump title size slightly and add a decorative divider or extra spacing below the subtitle for visual hierarchy.

3. **Remove generic placeholders** — Change `"you@example.com"` to `"Enter your email"` and password placeholder to `"Enter your password"`.

4. **Replace student messaging** — Change `"Are you a CTPA student? Register here"` to `"Want to manage your own RTD pipeline?"` with a link labeled `"Create a sub-account"` pointing to `/register`.

5. **Visual polish** — Add `shadow-lg` to the Card. Add more vertical padding to CardHeader. Ensure the sign-in button has strong contrast. Add a subtle top accent border or brand-colored top strip to the card.

6. **Mobile** — Already full-width via `max-w-md` + `p-4` on the wrapper. Inputs and button already `w-full`. No changes needed.

7. **Remove unused imports** — Remove `Tabs` components, `fullName` state, `handleSignUp`, and `signUp` from `useAuth` destructure since the Sign Up tab is being removed.

### Technical Details
- Single file edit: `src/pages/Login.tsx`
- No database or auth logic changes
- No new dependencies

