

## Add Light/Dark Mode Support

The project already has all the prerequisites in place: `next-themes` is installed, Tailwind is configured with `darkMode: ["class"]`, and dark-mode CSS variables are defined in `index.css`. The only missing pieces are the theme provider wrapper and a visible toggle.

### Changes

**1. Wrap app with ThemeProvider — `src/App.tsx`**
- Import `ThemeProvider` from `next-themes`
- Wrap the outermost content (inside `QueryClientProvider`) with `<ThemeProvider attribute="class" defaultTheme="system" storageKey="goop-theme">`
- This enables class-based theme switching, system default detection, and localStorage persistence

**2. Create theme toggle component — `src/components/layout/ThemeToggle.tsx`**
- New component using `useTheme()` from `next-themes`
- Renders a `Button` (ghost, icon size) with `Sun` / `Moon` icons from lucide-react
- Clicking cycles between light and dark (or uses a dropdown for light/dark/system)
- Simple two-state toggle: light ↔ dark

**3. Add toggle to AppHeader — `src/components/layout/AppHeader.tsx`**
- Import and render `<ThemeToggle />` in the header's right-side button group, next to the keyboard shortcuts button

**4. Add toggle to Login page — `src/pages/Login.tsx`**
- Place a small `<ThemeToggle />` in the top-right corner so unauthenticated users can also switch themes

**5. Fix Sonner toaster — `src/components/ui/sonner.tsx`**
- Already imports `useTheme` from `next-themes` — will work correctly once the provider is in place; no changes needed

### Technical notes
- `storageKey: "goop-theme"` persists preference in localStorage across sessions
- `defaultTheme: "system"` respects OS preference when no saved choice exists
- All shadcn/ui components already use CSS variables (`hsl(var(--...))`) so they automatically adapt
- The existing `.dark` block in `index.css` already defines polished dark surfaces (not pure black)
- No hardcoded colors need fixing — the design system is already CSS-variable-driven

