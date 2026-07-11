# Research: Heist Detail Page

## Decision 1: How to fetch a single heist by ID

**Decision**: Use a new `useHeist(id: string)` hook backed by Firestore `getDoc`.

**Rationale**: The existing `useHeists` hook uses `onSnapshot` with collection-level
queries filtered by user or deadline — it does not support fetching a single document
by ID. A `getDoc` call is the correct Firestore primitive for a point-lookup by
document ID. A separate hook isolates the concern and keeps `useHeists` unchanged.

**Alternatives considered**:
- Reuse `useHeists` and filter client-side: rejected — fetches the entire filtered
  collection for a single document; wasteful and semantically wrong.
- `onSnapshot` on a single document ref: viable but overkill for a read-only detail
  page; `getDoc` is simpler and sufficient (no real-time update requirement in spec).

---

## Decision 2: Where to put status-badge rendering

**Decision**: Use the shared `Badge` component (`components/Badge.tsx`) with a new
`failure` variant added.

**Rationale**: `Badge` already has `primary` / `secondary` / `success` variants.
`HeistCard` uses inline CSS module classes instead of `Badge` (pre-existing
inconsistency). The detail page is the right place to use the shared component;
adding a `failure` variant extends it correctly. This aligns with Constitution
Principle I (Component-First) and avoids duplicating status-badge logic.

**Alternatives considered**:
- Map `failure` to `secondary` (gray): rejected — gray does not visually signal
  failure; it reads as neutral.
- Duplicate CSS module classes in `HeistDetail`: rejected — violates DRY and
  diverges from the shared component.

---

## Decision 3: Component decomposition

**Decision**: One new presentational component (`HeistDetail`) + one new hook
(`useHeist`). The page file wires them together.

**Rationale**: Separating the presentational component from the data-fetching
hook enables each to be unit-tested in isolation (Constitution Principle III).
The page itself becomes thin: get ID → call hook → branch on state → render.

**Alternatives considered**:
- Inline all logic in `page.tsx`: rejected — untestable monolith, violates
  Constitution Principles I and III.
- Separate components for each state (LoadingView, NotFoundView, ErrorView): over-
  engineered for this scope; inline conditional rendering in the page is sufficient.

---

## Decision 4: `"use client"` placement

**Decision**: Mark `app/(dashboard)/heists/[id]/page.tsx` as `"use client"`.

**Rationale**: The page uses `useParams()` and the `useHeist` hook (both client-side
hooks). The `HeistDetail` component is purely presentational (props in, JSX out) and
does NOT need `"use client"`. This respects Constitution Principle V (only add
`"use client"` when client hooks are required).
