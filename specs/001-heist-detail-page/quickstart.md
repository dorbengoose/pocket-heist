# Quickstart: Heist Detail Page Validation

## Prerequisites

- Dev server running: `npm run dev` (http://localhost:3000)
- Logged in as any authenticated user
- At least one heist visible on the `/heists` dashboard
- Tests passing baseline: `npm run test`

---

## Scenario 1 — View full heist details (P1 core flow)

1. Navigate to `/heists`.
2. Click "View Details" on any heist card.
3. **Expected**: Detail page loads with all fields visible:
   - Title as the main heading
   - Status badge (Active / Success / Failed) with color
   - Description (or "No description provided." placeholder)
   - "Created by" + codename
   - "Assigned to" + codename
   - "Deadline" + formatted date and time
   - "Created" + formatted date
   - "← Back to Heists" link

---

## Scenario 2 — Loading state

1. In DevTools → Network tab, throttle to "Slow 3G".
2. Navigate to a valid heist detail URL (e.g., `/heists/<known-id>`).
3. **Expected**: A loading skeleton or indicator appears immediately; no blank
   or broken layout is shown while data loads.

---

## Scenario 3 — Not-found state

1. Navigate to `/heists/this-id-does-not-exist`.
2. **Expected**: Page shows "Heist not found." message and a link back to `/heists`.
   No crash, no blank page.

---

## Scenario 4 — Error state (manual simulation)

1. In DevTools → Network tab, block requests to `firestore.googleapis.com`.
2. Navigate to a heist detail URL.
3. **Expected**: After loading attempt, page shows "Something went wrong." with
   a retry button. Clicking retry re-fetches.
4. Unblock network → click retry → **Expected**: heist details load normally.

---

## Scenario 5 — Empty description

1. Find (or create) a heist with no description.
2. Navigate to its detail page.
3. **Expected**: "No description provided." placeholder appears; layout is intact.

---

## Scenario 6 — Back navigation from direct URL

1. Open a new browser tab and navigate directly to `/heists/<valid-id>`
   (no prior history in this tab).
2. Click "← Back to Heists".
3. **Expected**: Browser navigates to `/heists` — not a blank page or back-button
   failure.

---

## Automated Test Validation

```bash
# Run all tests (must pass before and after feature)
npm run test

# Run only HeistDetail tests
npx vitest tests/components/HeistDetail.test.tsx

# Run only useHeist hook tests
npx vitest tests/hooks/useHeist.test.ts
```

See `data-model.md` for the `useHeist` state matrix and `contracts/HeistDetail.md`
for the full component contract tested by the unit tests.
