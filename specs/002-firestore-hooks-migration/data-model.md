# Phase 1 Data Model: Firestore Access Migration to Hooks

**Feature**: 002-firestore-hooks-migration

This feature introduces no new persisted entities or schema changes. It relocates
existing Firestore calls (already defined against `types/firestore/`) into hooks.
Documented here for traceability between the hooks and the collections/shapes they
touch.

## Entities touched (pre-existing, unmodified)

### User document — `users/{uid}` (`COLLECTIONS.USERS`)

Written by `useCreateUserProfile` (FR-001), read (all docs) by `useUsers` (FR-002).

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Firebase Auth UID, also the document ID |
| `codename` | `string` | Generated at signup, becomes Auth `displayName` too |

Source of truth for the shape: current inline write in `AuthForm.tsx:81-84`
(`setDoc(doc(db, "users", uid), { codename, id })`) — the hook must write exactly
this shape, no additions.

### Heist document — `heists/{id}` (`COLLECTIONS.HEISTS`)

Written by `useCreateHeist` (FR-003). Read (filtered) by the pre-existing
`useHeists.ts`, which this feature does not touch.

| Field | Type | Notes |
|---|---|---|
| `title` | `string` | trimmed |
| `description` | `string` | trimmed |
| `createdBy` | `string` | current user's uid |
| `createdByCodename` | `string` | current user's displayName, falls back to `'Unknown Agent'` |
| `assignedTo` | `string` | selected assignee's uid |
| `assignedToCodename` | `string` | selected assignee's codename |
| `createdAt` | `FieldValue` | `serverTimestamp()` |
| `deadline` | `Timestamp` | now + 48h, computed client-side |
| `finalStatus` | `null` | always `null` at creation |

Source of truth: `types/firestore/heist.ts` (`CreateHeistInput`) and the current
inline write in `CreateHeistForm.tsx:92-105`.

## Hook contracts (inputs/outputs, not Firestore schema)

### `useCreateUserProfile()`

- **Returns**: `{ createUserProfile: (uid: string, codename: string) => Promise<void> }`
- **Behavior**: Wraps `setDoc(doc(db, "users", uid), { codename, id: uid })`.
  Throws on failure (caller in `AuthForm.tsx` already catches and maps to its
  existing error message — hook must not swallow or alter the thrown error).

### `useUsers()`

- **Returns**: `{ users: Array<{ id: string; codename: string }>, loading: boolean, error: Error | null }`
- **Behavior**: Wraps `getDocs(collection(db, COLLECTIONS.USERS))` in a `useEffect`
  on mount, matching `CreateHeistForm.tsx`'s current `fetchUsers` effect timing and
  state names exactly (`isLoadingUsers` → `loading`).

### `useCreateHeist()`

- **Returns**: `{ createHeist: (input: CreateHeistInput) => Promise<void> }`
- **Behavior**: Wraps `addDoc(collection(db, COLLECTIONS.HEISTS), heistData)`.
  Does not compute `deadline`/`createdAt`/`finalStatus` itself — the caller
  (`CreateHeistForm.tsx`) still builds the `CreateHeistInput` object, matching
  current behavior; the hook is a thin write wrapper only, per FR-003's design
  note (must not absorb `useHeists.ts`-style query/filter logic).

No state transitions — these are one-shot reads/writes, not real-time subscriptions
(unlike `useHeists.ts`, which this feature explicitly leaves alone).
