# Plan: Create Heist Form

## Context

The `/heists/create` page is currently a stub with only a heading. This plan implements a full form that creates a new Firestore document in the `heists` collection using the existing `CreateHeistInput` interface, then redirects to `/heists`. The implementation follows the established `AuthForm` pattern exactly — no new patterns or libraries introduced.

---

## Files to Create

### 1. `components/CreateHeistForm/CreateHeistForm.tsx`
Core client component. Follows `AuthForm.tsx` pattern:
- `"use client"` directive
- Individual `useState` per field (no form library)
- `useUser()` from `@/context/UserContext` for `user.uid` and `user.displayName` (createdBy / createdByCodename)
- `useRouter()` from `next/navigation` for post-submit redirect
- `useEffect` on mount to fetch users from Firestore `users` collection

**State:**
- `title: string`, `description: string` — controlled inputs
- `assigneeId: string`, `assigneeCodename: string` — from dropdown selection
- `users: Array<{ id: string; codename: string }>` — populated on mount via `getDocs(collection(db, COLLECTIONS.USERS))`
- `isLoadingUsers: boolean` — true while user fetch is in flight
- `isLoading: boolean`, `error: string | null` — same as AuthForm

**Users dropdown:**
- On mount: `getDocs(collection(db, COLLECTIONS.USERS))` → map each doc to `{ id: doc.id, codename: doc.data().codename }`
- While loading: `disabled` select with "Loading agents..." placeholder option
- After load: static first option `"Select an agent"` (value `""`) + one `<option>` per user (value = uid, text = codename)
- On change: set both `assigneeId` and `assigneeCodename` from the matching user

**Read-only display fields (no user input):**
- "Created By": `user.displayName` from auth context
- "Deadline": `new Date(Date.now() + 48 * 60 * 60 * 1000).toLocaleString()` — display only, recalculated at render

**`handleSubmit`:**
1. `e.preventDefault()`, `setError(null)`
2. Validate: title, description, assigneeId — set error and `return` if any are empty
3. `setIsLoading(true)`
4. Build `CreateHeistInput` object:
   - `title`: `title.trim()`
   - `description`: `description.trim()`
   - `createdBy`: `user!.uid`
   - `createdByCodename`: `user!.displayName ?? "Unknown Agent"`
   - `assignedTo`: `assigneeId`
   - `assignedToCodename`: `assigneeCodename`
   - `createdAt`: `serverTimestamp()`
   - `deadline`: `Timestamp.fromDate(new Date(Date.now() + 48 * 60 * 60 * 1000))`
   - `finalStatus`: `null`
5. `await addDoc(collection(db, COLLECTIONS.HEISTS), heistData)`
6. `router.push("/heists")`
7. `catch`: `setIsLoading(false)`, `setError("Something went wrong. Please try again.")`

**⚠️ Type note on `deadline`:** `CreateHeistInput.deadline` is typed as `FieldValue`, but `Timestamp.fromDate()` returns a `Timestamp` (not a `FieldValue`). Firestore accepts `Timestamp` as a write value. Fix: update `CreateHeistInput.deadline` type in `types/firestore/heist.ts` to `FieldValue | Timestamp`. Import `Timestamp` from `firebase/firestore`.

---

### 2. `components/CreateHeistForm/CreateHeistForm.module.css`
Replicates `AuthForm.module.css` exactly. Start with `@reference "../../app/globals.css"`. Additional classes needed:

| Class | Purpose |
|---|---|
| `.textarea` | Extends `.input`; adds `resize-none min-h-24` |
| `.select` | Same as `.input`; browser default arrow retained |
| `.readOnlyField` | Slightly dimmer: `bg-light text-body` to signal non-editable |

All other classes (`.form`, `.field`, `.field label`, `.input`, `.input:focus`, `.submit`, `.submit:hover`, `.submit:disabled`, `.errorMessage`) are direct copies from `AuthForm.module.css`.

---

### 3. `tests/components/CreateHeistForm.test.tsx`
Vitest + Testing Library. Query by role/label, use `userEvent`.

**Top-level mocks:**
- `vi.mock("next/navigation")` → `useRouter` with `push` spy
- `vi.mock("@/lib/firebase")` → `db: {}`
- `vi.mock("firebase/firestore")` → mock `addDoc`, `collection`, `getDocs`, `serverTimestamp`, `Timestamp`
- `vi.mock("@/context/UserContext")` → `{ user: { uid: "uid-123", displayName: "ShadowFox" }, loading: false }`

**Test cases:**
- Renders all labels and fields (title, description, assign-to dropdown, created-by, submit button)
- Shows "Loading agents..." while users fetch is pending
- Populates dropdown with codenames after fetch resolves (`waitFor`)
- Shows error if users fetch fails
- Validates title required, description required, assignee required (each separately, no `addDoc` called)
- Disables submit button while `addDoc` is in flight
- Calls `addDoc` with correct payload (all fields verified including `finalStatus: null`)
- Calls `serverTimestamp()` for `createdAt`; `Timestamp.fromDate` for `deadline`
- Redirects to `/heists` after success
- Shows "Something went wrong" on `addDoc` rejection and re-enables button

---

## Files to Modify

### 4. `types/firestore/heist.ts`
Update `CreateHeistInput.deadline` type:
```
deadline: FieldValue  →  deadline: FieldValue | Timestamp
```
Import `Timestamp` from `firebase/firestore` at the top of the file.

### 5. `app/(dashboard)/heists/create/page.tsx`
Replace stub — keep the outer layout, import and render `<CreateHeistForm />`:
```tsx
import CreateHeistForm from '@/components/CreateHeistForm/CreateHeistForm'
// no "use client" needed on the page
export default function CreateHeistPage() {
  return (
    <div className="center-content">
      <div className="page-content">
        <h2 className="form-title">Create a New Heist</h2>
        <CreateHeistForm />
      </div>
    </div>
  )
}
```

---

## Reusable Imports (already exist)

| Symbol | Source |
|---|---|
| `db` | `@/lib/firebase` |
| `COLLECTIONS` | `@/types/firestore` |
| `CreateHeistInput` | `@/types/firestore` |
| `useUser` | `@/context/UserContext` |
| `addDoc`, `collection`, `getDocs`, `serverTimestamp`, `Timestamp` | `firebase/firestore` |

---

## Verification

1. `npx vitest run tests/components/CreateHeistForm.test.tsx` — all tests pass
2. `npm run test` — no regressions in existing tests
3. `npm run dev` → navigate to `/heists/create` while logged in:
   - Form renders with all fields
   - Dropdown loads agent codenames from Firestore
   - Read-only "Created By" shows current user's codename
   - Submit with blank fields shows correct validation errors
   - Valid submit creates Firestore document and redirects to `/heists`
   - Firebase console confirms document with correct field values and deadline ~48h ahead
