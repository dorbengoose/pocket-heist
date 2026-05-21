# Plan: Heist Card Component

## Context

The `/heists` page currently renders a plain unstyled `<ul>/<li>` list for heists and a `<p>Loading...</p>` text during loading. This plan introduces a polished `HeistCard` component, a matching `HeistCardSkeleton` for loading states, and a 3-column responsive grid layout. Only **active** and **assigned** heists are shown — the expired section is removed entirely. Heist titles and a "View Details" button both link to `/heists/:id` (the detail page remains a stub with no new content).

---

## Files to Create

| File | Purpose |
|---|---|
| `components/HeistCard/HeistCard.tsx` | Presentational card showing all heist fields |
| `components/HeistCard/HeistCard.module.css` | Card layout, status badge variants, hover styles |
| `components/HeistCard/index.ts` | Barrel export |
| `components/HeistCardSkeleton/HeistCardSkeleton.tsx` | Animated shimmer placeholder matching HeistCard layout |
| `components/HeistCardSkeleton/HeistCardSkeleton.module.css` | Shimmer keyframe animation + block sizing |
| `components/HeistCardSkeleton/index.ts` | Barrel export |
| `app/(dashboard)/heists/page.module.css` | 3-column responsive grid layout |
| `tests/components/HeistCard.test.tsx` | Unit tests for HeistCard |
| `tests/components/HeistCardSkeleton.test.tsx` | Smoke/render tests for HeistCardSkeleton |

## Files to Modify

| File | Change |
|---|---|
| `app/(dashboard)/heists/page.tsx` | Replace list rendering with HeistCard grid + skeleton states; remove expired section |

---

## Component Design

### HeistCard

- **Props:** `heist: Heist` (single prop, type from `types/firestore/heist.ts`)
- **Fields shown:** title (as `<Link>` to `/heists/:id`), description (clamped to 2 lines), `createdByCodename`, `assignedToCodename`, `deadline` (formatted via `toLocaleDateString`), status badge, "View Details" `<Link>` button
- **Status badge variants:** `finalStatus === null` → "Active"; `finalStatus === 'success'` → "Success"; `finalStatus === 'failure'` → "Failed" — implemented as three separate CSS module class names, no inline styles
- **No internal state or data fetching** — purely presentational
- **Styling:** CSS Module using only `@apply` directives; follows same `@reference "../../app/globals.css"` pattern as all other components

### HeistCardSkeleton

- **Props:** none
- **Structure:** mirrors the layout of `HeistCard` exactly, but every content region is a `<div>` with a shimmer animation
- **Animation:** `@keyframes shimmer` shifting a gradient from `var(--color-light)` to `var(--color-lighter)` — uses existing color tokens, stays on-theme with the dark palette
- **Skeleton count per section:** 3 hardcoded instances rendered inline in the page

---

## Page Update (`heists/page.tsx`)

- Remove the `useHeists('expired')` call and its entire section
- For each remaining section (active, assigned):
  - If `loading` → render 3 `<HeistCardSkeleton />` inside the grid container
  - If `error` → render a short error paragraph in place of the grid
  - If `heists.length === 0` → render an empty-state message (e.g. "No active heists right now.")
  - Otherwise → map over `heists` and render `<HeistCard key={heist.id} heist={heist} />`
- Wrap each section's card list in a `<div className={styles.grid}>` from the new `page.module.css`
- **No new wrapper component** for the grid — the layout CSS lives in `page.module.css`, applied directly on the page

### Grid Layout (`page.module.css`)

```
Mobile  (< 640px):  1 column
Tablet  (≥ 640px):  2 columns  
Desktop (≥ 1024px): 3 columns
```
CSS: `display: grid; gap: <token>; grid-template-columns: ...` with media queries. Applied via `@apply` or direct CSS inside the module.

---

## Data Flow (unchanged)

```
page.tsx
  → useHeists('active')  → { heists, loading, error }
  → useHeists('assigned') → { heists, loading, error }
        ↓
  loading=true → <HeistCardSkeleton /> × 3
  loading=false, error → error paragraph
  loading=false, empty → empty state paragraph  
  loading=false, data  → heists.map(h => <HeistCard heist={h} />)
```

The `useHeists` hook (`hooks/useHeists.ts`) requires **no changes**.

---

## Pagination

Deferred. The `useHeists` hook streams all matching heists with no limit. Pagination would require a cursor-based Firestore approach (`startAfter` + `limit`) and is out of scope for this iteration.

---

## Testing

### `tests/components/HeistCard.test.tsx`

Mock: `vi.mock('next/navigation', ...)` (required for `next/link` in jsdom).  
Use a factory function to construct a default `Heist` object with overrides per test.

| Test | Assertion |
|---|---|
| Title renders as a link to `/heists/:id` | `getByRole('link', { name: heist.title })` has correct `href` |
| Description is visible | `getByText(heist.description)` |
| Codenames are visible | `getByText` for both codename values |
| Deadline is rendered | `getByText` matching partial date string |
| Badge shows "Active" when `finalStatus === null` | `getByText('Active')` |
| Badge shows "Success" when `finalStatus === 'success'` | `getByText('Success')` |
| Badge shows "Failed" when `finalStatus === 'failure'` | `getByText('Failed')` |
| "View Details" link points to `/heists/:id` | `getByRole('link', { name: /view details/i })` has correct `href` |

### `tests/components/HeistCardSkeleton.test.tsx`

No mocks needed.

| Test | Assertion |
|---|---|
| Renders without crashing | `container` is in the document |
| Skeleton wrapper element is present | `.toBeInTheDocument()` on container's first child |

---

## Verification

1. `npm run dev` — navigate to `/heists`; confirm two sections display (Active, Assigned), each showing 3 skeletons briefly, then transitioning to cards or empty state
2. Click a heist card title or "View Details" — confirms navigation to `/heists/:id` (stub page renders "Heist Details")
3. Resize viewport — confirm 3→2→1 column layout
4. `npm run test` — all new tests pass, existing tests unaffected
5. `npm run lint` — no type or lint errors
