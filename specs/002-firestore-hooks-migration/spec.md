# Feature Spec: Firestore Access Migration to Hooks (Article VI Compliance)

**Branch**: `002-firestore-hooks-migration`

## Summary
`AuthForm.tsx` and `CreateHeistForm.tsx` currently call `firebase/firestore`
directly, violating Article VI, bullet 3 of the constitution (hooks MUST
be the sole encapsulation layer for Firestore reads/writes). This gap was
documented as known technical debt at the time Article VI was ratified
(v1.1.0 Sync Impact Report). This spec closes it.

## Non-Goals
- No change to observable behavior of either form (same error messages,
  same redirects, same timing).
- No new feature (heist reassignment, etc.) — out of scope, tracked
  separately as a roadmap item.
- No resolution of the concurrency contract question — already evaluated
  and rejected for Article VII promotion (see Governance Decision Log,
  2026-07-11): 0 real concurrent-write FRs found in this repo.

## Functional Requirements

- **FR-001**: A new hook `useCreateUserProfile.ts` MUST encapsulate the
  Firestore write currently inline in `AuthForm.tsx`
  (`setDoc(doc(db, "users", uid), {...})`).
  - Acceptance: `AuthForm.tsx` no longer imports `doc`/`setDoc` from
    `firebase/firestore`.

- **FR-002**: A new hook `useUsers.ts` MUST encapsulate the Firestore read
  currently inline in `CreateHeistForm.tsx`
  (`getDocs(collection(db, COLLECTIONS.USERS))`).
  - Acceptance: `CreateHeistForm.tsx` no longer imports `getDocs`/
    `collection` for the assignee list.

- **FR-003**: A new hook `useCreateHeist.ts` MUST encapsulate the Firestore
  write currently inline in `CreateHeistForm.tsx`
  (`addDoc(collection(db, COLLECTIONS.HEISTS), heistData)`).
  - Design note: this MUST NOT extend `useHeists.ts` — that hook has a
    distinct, already-established purpose (filtered real-time reads via
    `onSnapshot`). Mixing a write concern into it would violate Article I
    (single responsibility per unit).
  - Acceptance: `CreateHeistForm.tsx` no longer imports `addDoc` directly;
    `useHeists.ts` remains unmodified.

- **FR-004**: All three hooks MUST have tests written before
  implementation (Article III, NON-NEGOTIABLE), verified against the
  Firebase Local Emulator Suite — not against Firestore mocks (real vs.
  substitute infrastructure verification).

## Clarifications

### Session 2026-07-11
- Q: Where should `useCreateUserProfile` live — a new standalone file, or
  as an additional method on an existing auth-related hook? → A: New
  standalone file, `hooks/useCreateUserProfile.ts` (no existing auth hook
  was found to extend; confirmed via `find hooks/ -type f`, which only
  returned `useHeistById.ts` and `useHeists.ts`).

## Verification Checklist
- [ ] Each new FR tested against the Emulator Suite, not a mock
- [ ] Neither `AuthForm.tsx` nor `CreateHeistForm.tsx` imports
      `firebase/firestore` directly after this change
- [ ] Observable behavior (messages, redirects) identical before/after
- [ ] `useHeists.ts` left unmodified