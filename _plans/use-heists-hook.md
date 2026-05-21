# Plan: useHeists Hook + Heists Page Integration

## Context

The `/heists` dashboard page is a stub showing three static section headings. This plan implements a `useHeists()` real-time Firestore hook that subscribes to the `heists` collection with three filter modes, and wires it into the page to display heist titles per category.

---

## Files to Create

### 1. `hooks/useHeists.ts`
New directory and file. No `"use client"` directive needed — hooks are plain functions.

**Signature:**
```ts
type HeistFilter = 'active' | 'assigned' | 'expired'
function useHeists(filter: HeistFilter): { heists: Heist[], loading: boolean, error: Error | null }
```

**Internal state (3 `useState` calls):**
- `heists: Heist[]` — init `[]`
- `loading: boolean` — init `true`
- `error: Error | null` — init `null`

**Hooks used internally:**
- `useUser()` from `@/context/UserContext` — provides `user.uid` for per-user queries
- `useEffect([filter, user?.uid])` — re-subscribes when filter or user changes

**Query logic (inside `useEffect`):**

| Filter | Firestore `where` | Client-side filter |
|--------|-------------------|---------------------|
| `'active'` | `where('assignedTo', '==', user.uid)` | `h.deadline > now` |
| `'assigned'` | `where('createdBy', '==', user.uid)` | `h.deadline > now` |
| `'expired'` | `where('deadline', '<=', Timestamp.fromDate(now))` | `h.finalStatus !== null` |

**Guard for null user:**
If `filter` is `'active'` or `'assigned'` and `user` is `null`, immediately set `heists: []`, `loading: false`, and return without setting up a listener.

**Collection reference:**
Use `collection(db, COLLECTIONS.HEISTS).withConverter(heistConverter)` so `snapshot.docs.map(doc => doc.data())` returns typed `Heist[]` with `deadline` already converted to `Date`.

**`onSnapshot` setup:**
```ts
const unsubscribe = onSnapshot(q,
  (snapshot) => {
    const now = new Date()
    const all = snapshot.docs.map(doc => doc.data())
    const filtered = filter === 'expired'
      ? all.filter(h => h.finalStatus !== null)
      : all.filter(h => h.deadline > now)
    setHeists(filtered)
    setLoading(false)
  },
  (err) => { setError(err); setLoading(false) }
)
return unsubscribe   // cleanup on unmount
```

**Reusable imports:**
| Symbol | Source |
|---|---|
| `collection`, `onSnapshot`, `query`, `where`, `Timestamp` | `firebase/firestore` |
| `db` | `@/lib/firebase` |
| `COLLECTIONS`, `Heist`, `heistConverter` | `@/types/firestore` |
| `useUser` | `@/context/UserContext` |

---

### 2. `tests/hooks/useHeists.test.tsx`
Mirrors the pattern in `tests/hooks/useUser.test.tsx`: `renderHook` from `@testing-library/react`, module-level `vi.mock`, per-test `vi.mocked().mockImplementation()`.

**Top-level mocks:**
- `vi.mock('firebase/firestore')` → stub `collection`, `query`, `where`, `onSnapshot`, `Timestamp.fromDate`
- `vi.mock('@/lib/firebase')` → `db: {}`
- `vi.mock('@/context/UserContext')` → `useUser` returns `{ user: { uid: 'test-uid' }, loading: false }`
- `vi.mock('@/types/firestore')` → stub `COLLECTIONS`, `heistConverter`

**Key test cases:**
- Initial render: `loading: true`, `heists: []`
- After `onSnapshot` fires: `loading: false`, heists populated
- 'active': verifies `where('assignedTo', '==', uid)` called; past-deadline heists filtered out
- 'assigned': verifies `where('createdBy', '==', uid)` called; past-deadline heists filtered out
- 'expired': verifies `where('deadline', '<=', ...)` called; heists with `finalStatus === null` filtered out
- Null user + 'active': returns `[]`, `loading: false` immediately (no listener)
- Null user + 'assigned': same as above
- Error callback: sets `error` state
- Unmount: unsubscribe mock called once
- Filter change: new `onSnapshot` call triggered

---

## Files to Modify

### 3. `app/(dashboard)/heists/page.tsx`
Add `"use client"` directive. Import and call `useHeists` three times. Display only titles.

- Add `"use client"` at the top
- Import `useHeists` from `@/hooks/useHeists`
- Call hook with all three filter types, destructure `heists` and `loading`
- Each section: heading → loading indicator → `<ul>` of `<li>{h.title}</li>` keyed by `h.id`
- Empty state: short "No heists yet." message when not loading and `heists.length === 0`

---

## Verification

1. `npx vitest run tests/hooks/useHeists.test.tsx` — all tests pass
2. `npm run test` — full suite still passing, no regressions
3. `npm run dev` → log in, navigate to `/heists`:
   - Three sections render with headings
   - Loading indicators show briefly while Firestore connects
   - Titles appear for any existing heists in the correct sections
   - Creating a new heist and returning to the page shows it in real-time
