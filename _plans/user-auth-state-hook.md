# Plan: User Auth State Hook (`useUser`)

## Context
The app has Firebase Auth configured but no way for components to access the current user. This plan implements a global real-time auth state listener exposed via a `useUser()` hook — returning `{ user: User | null, loading: boolean }` — usable in any page or component. No login/logout/signup flows are part of this change.

---

## Files to Create / Modify

### 1. CREATE `context/UserContext.tsx`
Core file. Co-locates context definition, `UserProvider`, and `useUser` hook.

- Mark `"use client"` at the top
- Define `AuthState` type: `{ user: User | null; loading: boolean }`
- Create context with `React.createContext<AuthState>({ user: null, loading: true })`
  - Default `loading: true` prevents premature renders of auth-gated UI
- `UserProvider` component:
  - `useState<User | null>(null)` and `useState<boolean>(true)` for loading
  - `useEffect` registers `onAuthStateChanged(auth, (firebaseUser) => { setUser(firebaseUser); setLoading(false) })`
  - Returns unsubscribe from `useEffect` for cleanup on unmount
  - Wraps `children` in `UserContext.Provider` with `{ user, loading }`
- `useUser()` hook: calls `useContext(UserContext)` and returns the `AuthState` object
- Exports: `UserProvider` (named), `useUser` (named)
- Context object itself is **not** exported (enforce hook usage)
- Imports: `auth` from `@/lib/firebase`; `onAuthStateChanged`, `User` from `firebase/auth`

### 2. CREATE `app/Providers.tsx`
Thin wrapper so `app/layout.tsx` stays a server component (required for `export const metadata`).

- Mark `"use client"` at the top
- Imports `UserProvider` from `@/context/UserContext`
- Default export `Providers({ children })` that renders `<UserProvider>{children}</UserProvider>`
- Named `Providers` (plural) — designed to stack additional providers in future

### 3. MODIFY `app/layout.tsx`
Single change only — wrap `{children}` with the `Providers` component:

```tsx
// Add import:
import Providers from "@/app/Providers"

// Change body from:
<body>{children}</body>
// To:
<body><Providers>{children}</Providers></body>
```

No `"use client"` added. `export const metadata` is preserved.

### 4. CREATE `tests/hooks/useUser.test.tsx`
Four tests using `renderHook` + `wrapper: UserProvider` pattern:

| Test | Mock behavior | Assertion |
|---|---|---|
| Initial loading state | `onAuthStateChanged` never calls callback | `loading === true`, `user === null` |
| Authenticated user | callback fires with `{ uid, email, displayName }` | `loading === false`, `user.uid === 'u1'` |
| Unauthenticated (signed out) | callback fires with `null` | `loading === false`, `user === null` |
| Listener cleanup | hook unmounts | unsubscribe spy called once |

Mocking:
```ts
vi.mock('firebase/auth', () => ({ onAuthStateChanged: vi.fn(), getAuth: vi.fn() }))
vi.mock('@/lib/firebase', () => ({ auth: {} }))
```
Imports: `describe`, `it`, `expect`, `vi`, `beforeEach` from `vitest`; `renderHook`, `act` from `@testing-library/react`.

---

## Reusable Existing Code
- `lib/firebase.ts` — already exports `auth`; import directly, no changes needed
- Firebase `User` type from `firebase/auth` — use as-is (includes `email`, `uid`, `displayName`)

---

## Implementation Order
1. `context/UserContext.tsx`
2. `app/Providers.tsx`
3. `app/layout.tsx` (update)
4. `tests/hooks/useUser.test.tsx`

---

## Verification
- Run `npm run test` — all 4 new tests pass, existing tests unaffected
- Run `npm run dev` — app boots, no console errors
- Open browser DevTools → Console: no Firebase or context errors on any route
- Temporarily add `console.log(useUser())` to any page component, sign in/out via Firebase Console → confirm `user` and `loading` update in real time

## Out of Scope
Per spec, these are explicitly NOT included:
- Login/signup/logout flow implementation
- Firebase auth integration in LoginForm/SignupForm
- Logout button or user menu
- Do not use the hook anywhere in the application yet.
