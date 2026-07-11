# Quickstart: Firestore Access Migration to Hooks

**Feature**: 002-firestore-hooks-migration

This feature cannot be validated with the existing `vi.mock('firebase/firestore')`
pattern (see `research.md` R1) — FR-004 requires verification against the Firebase
Local Emulator Suite. That infrastructure does not exist yet in this repo, so it is
part of this feature's setup, not a prerequisite assumed to be already met.

## Prerequisites

1. Install emulator devDependencies (added by this feature — not present today):
   ```bash
   npm install --save-dev @firebase/rules-unit-testing firebase-tools
   ```
2. `firebase.json` must have an `"emulators"` section (added by this feature).
   Minimum shape:
   ```json
   {
     "emulators": {
       "firestore": { "port": 8080 },
       "ui": { "enabled": true }
     }
   }
   ```
3. Confirm `firestore.rules` exists and is referenced by `firebase.json` (already
   true today — no change needed).

## Running the emulator

```bash
npx firebase emulators:start --only firestore
```

Leave this running in a separate terminal while running the hook tests below (or
wire it into a `pretest`/CI step once the project script is added — implementation
detail for `tasks.md`, not covered here).

## Validation scenarios

### FR-001 — `useCreateUserProfile`

1. Start the emulator (above).
2. Run `npx vitest tests/hooks/useCreateUserProfile.test.tsx`.
3. Expected: test calls the hook's `createUserProfile(uid, codename)`, then reads
   back `users/{uid}` from the emulator directly and asserts
   `{ id: uid, codename }` — proving a real write landed, not a mocked call.
4. Manually verify `AuthForm.tsx` no longer imports `doc`/`setDoc` from
   `firebase/firestore` (`grep -n "firebase/firestore" components/AuthForm/AuthForm.tsx`
   should show no `setDoc`/`doc` names).

### FR-002 — `useUsers`

1. Emulator running, seed 2+ `users/{uid}` docs via `@firebase/rules-unit-testing`
   test setup.
2. Run `npx vitest tests/hooks/useUsers.test.tsx`.
3. Expected: `renderHook(() => useUsers())` resolves `loading: false` and `users`
   matching the seeded docs.
4. Manually verify `CreateHeistForm.tsx` no longer imports `getDocs`/`collection`
   for the assignee list.

### FR-003 — `useCreateHeist`

1. Emulator running.
2. Run `npx vitest tests/hooks/useCreateHeist.test.tsx`.
3. Expected: test calls `createHeist(input)`, then reads back the created
   `heists/{id}` doc from the emulator and asserts field-for-field equality with
   `input`.
4. Manually verify `useHeists.ts` is byte-for-byte unmodified
   (`git diff --stat hooks/useHeists.ts` should be empty).

### End-to-end regression (Non-Goals compliance)

1. `npm run dev`, exercise signup (AuthForm) and heist creation (CreateHeistForm)
   manually against the live/dev Firestore project.
2. Confirm error messages, redirect targets, and redirect timing (2s for signup,
   immediate for heist creation) are unchanged from pre-migration behavior.

## Full suite

```bash
npm run lint
npm run test
```

Both MUST pass clean before the feature is considered complete (Constitution
Article III).
