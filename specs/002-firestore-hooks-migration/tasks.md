---

description: "Task list template for feature implementation"
---

# Tasks: Firestore Access Migration to Hooks (Article VI Compliance)

**Input**: Design documents from `/specs/002-firestore-hooks-migration/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Included — FR-004 makes tests NON-NEGOTIABLE (Constitution Article III) and requires them to run against the Firebase Local Emulator Suite, not mocks.

**Organization**: Tasks are grouped by user story, one per hook/FR (FR-001, FR-002, FR-003). FR-004 (Emulator Suite verification) is cross-cutting and lives in Foundational since it blocks every story's tests.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

## Path Conventions

Single Next.js project (see plan.md Structure Decision) — `hooks/`, `components/`, `tests/hooks/`, `firebase.json`, `package.json` at repository root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Bring in the emulator-testing dependencies this feature needs but the repo doesn't have yet (research.md R1).

- [ ] T001 Add `@firebase/rules-unit-testing` and `firebase-tools` as devDependencies in `package.json` and run `npm install`
- [ ] T002 [P] Verify `hooks/` and `tests/hooks/` directories exist per plan.md structure (they do today via `useHeists.ts`/`useHeists.test.tsx` — no action needed if present)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Stand up the Firebase Local Emulator Suite so FR-004 can be satisfied by every user story below. Without this phase, none of the hook tests can run against real Firestore semantics (research.md R1).

**⚠️ CRITICAL**: No user story test can be written-and-verified-failing until this phase is complete.

- [ ] T003 Add an `"emulators"` section to `firebase.json` (`firestore.port: 8080`, `ui.enabled: true`)
- [ ] T004 [P] Add an `"emulators:start"` script to `package.json` (`firebase emulators:start --only firestore`)
- [ ] T005 Create a shared Firestore emulator test helper in `tests/helpers/firestoreEmulator.ts` that wraps `@firebase/rules-unit-testing`'s `initializeTestEnvironment`/`connectFirestoreEmulator` and exposes a per-test setup/teardown (clear data between tests) for reuse by all three hook test files
- [ ] T006 Verify `firestore.rules` permits the emulator test helper's writes/reads to `users/{uid}` and `heists/{id}` under test auth context; adjust rules only if the emulator's default-deny blocks legitimate test operations

**Checkpoint**: Emulator running (`npm run emulators:start`), `tests/helpers/firestoreEmulator.ts` importable — user story work can begin.

---

## Phase 3: User Story 1 - useCreateUserProfile / AuthForm (Priority: P1) 🎯 MVP

**Goal**: `AuthForm.tsx` signup no longer calls `setDoc`/`doc` directly (FR-001); the write is encapsulated in `hooks/useCreateUserProfile.ts`.

**Independent Test**: Run `tests/hooks/useCreateUserProfile.test.tsx` against the emulator and confirm `users/{uid}` is written with `{ id, codename }`; separately confirm `AuthForm.tsx` no longer imports `doc`/`setDoc`.

### Tests for User Story 1 ⚠️

> Write this test FIRST, confirm it fails (hook doesn't exist yet), before implementing.

- [ ] T007 [P] [US1] Write failing test in `tests/hooks/useCreateUserProfile.test.tsx`: using the emulator helper (T005), call the hook's `createUserProfile(uid, codename)` and assert `users/{uid}` reads back as `{ id: uid, codename }`

### Implementation for User Story 1

- [ ] T008 [US1] Implement `hooks/useCreateUserProfile.ts` exposing `{ createUserProfile }`, wrapping `setDoc(doc(db, "users", uid), { codename, id: uid })` exactly as it exists today in `components/AuthForm/AuthForm.tsx:81-84` (depends on T007 failing)
- [ ] T009 [US1] Update `components/AuthForm/AuthForm.tsx` to call `useCreateUserProfile()` instead of the inline `doc`/`setDoc` call; remove the `firebase/firestore` import for `doc`/`setDoc`
- [ ] T010 [US1] Manually verify via `npm run dev`: signup flow preserves the existing error message and the 2-second redirect to `/login` (quickstart.md FR-001 scenario)

**Checkpoint**: User Story 1 fully functional and testable independently — `AuthForm.tsx` no longer imports `firebase/firestore` for writes.

---

## Phase 4: User Story 2 - useUsers / CreateHeistForm assignee list (Priority: P2)

**Goal**: `CreateHeistForm.tsx` no longer calls `getDocs`/`collection` directly for the assignee dropdown (FR-002); the read is encapsulated in `hooks/useUsers.ts`.

**Independent Test**: Run `tests/hooks/useUsers.test.tsx` against the emulator with seeded user docs and confirm `useUsers()` resolves `{ users, loading: false, error: null }` matching the seed data; separately confirm `CreateHeistForm.tsx` no longer imports `getDocs`/`collection` for this purpose.

### Tests for User Story 2 ⚠️

- [ ] T011 [P] [US2] Write failing test in `tests/hooks/useUsers.test.tsx`: seed 2+ `users/{uid}` docs via the emulator helper (T005), `renderHook(() => useUsers())`, assert `users` matches the seeded docs and `loading` becomes `false`

### Implementation for User Story 2

- [ ] T012 [US2] Implement `hooks/useUsers.ts` exposing `{ users, loading, error }`, wrapping `getDocs(collection(db, COLLECTIONS.USERS))` in a `useEffect` on mount, matching the current `fetchUsers` effect in `components/CreateHeistForm/CreateHeistForm.tsx:30-49` (depends on T011 failing)
- [ ] T013 [US2] Update `components/CreateHeistForm/CreateHeistForm.tsx` to call `useUsers()` instead of the inline `fetchUsers` effect/state (`users`, `isLoadingUsers` → hook's `users`, `loading`); remove `getDocs`/`collection` import for the assignee list
- [ ] T014 [US2] Manually verify via `npm run dev`: the assignee dropdown populates identically to before (quickstart.md FR-002 scenario)

**Checkpoint**: User Stories 1 AND 2 both work independently.

---

## Phase 5: User Story 3 - useCreateHeist / CreateHeistForm submission (Priority: P3)

**Goal**: `CreateHeistForm.tsx` no longer calls `addDoc` directly (FR-003); the write is encapsulated in `hooks/useCreateHeist.ts`, and `hooks/useHeists.ts` remains untouched.

**Independent Test**: Run `tests/hooks/useCreateHeist.test.tsx` against the emulator and confirm `createHeist(input)` results in a `heists/{id}` doc matching `input` field-for-field; separately confirm `CreateHeistForm.tsx` no longer imports `addDoc`, and `git diff --stat hooks/useHeists.ts` is empty.

### Tests for User Story 3 ⚠️

- [ ] T015 [P] [US3] Write failing test in `tests/hooks/useCreateHeist.test.tsx`: using the emulator helper (T005), call `createHeist(input)` with a sample `CreateHeistInput`, then read back the created `heists/{id}` doc and assert field equality

### Implementation for User Story 3

- [ ] T016 [US3] Implement `hooks/useCreateHeist.ts` exposing `{ createHeist }`, wrapping `addDoc(collection(db, COLLECTIONS.HEISTS), heistData)` exactly as it exists today in `components/CreateHeistForm/CreateHeistForm.tsx:105`; MUST NOT modify or extend `hooks/useHeists.ts` (FR-003 design note) (depends on T015 failing)
- [ ] T017 [US3] Update `components/CreateHeistForm/CreateHeistForm.tsx` to call `useCreateHeist()` instead of the inline `addDoc` call; remove `addDoc`/`collection` import for heist creation (keep `serverTimestamp`/`Timestamp` imports — the form still builds `CreateHeistInput` itself per data-model.md)
- [ ] T018 [US3] Manually verify via `npm run dev`: heist creation preserves the existing error message and immediate redirect to `/heists` (quickstart.md FR-003 scenario)

**Checkpoint**: All three user stories independently functional; `CreateHeistForm.tsx` and `AuthForm.tsx` fully migrated off direct Firestore calls.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Repo-wide verification against the spec's Verification Checklist and constitution gates.

- [ ] T019 [P] Run `npm run lint` and fix any issues introduced by the migration
- [ ] T020 Run `npm run test` — the full suite (existing + new hook tests) MUST pass
- [ ] T021 Verify `hooks/useHeists.ts` is byte-for-byte unmodified (`git diff --stat hooks/useHeists.ts` empty)
- [ ] T022 Verify neither `components/AuthForm/AuthForm.tsx` nor `components/CreateHeistForm/CreateHeistForm.tsx` imports `firebase/firestore` directly (`grep -rn "firebase/firestore" components/AuthForm/AuthForm.tsx components/CreateHeistForm/CreateHeistForm.tsx` returns nothing)
- [ ] T023 Run all `quickstart.md` validation scenarios end-to-end, including the manual end-to-end regression check for observable-behavior parity

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup (needs `@firebase/rules-unit-testing` installed) — BLOCKS all user stories' test tasks
- **User Stories (Phase 3-5)**: All depend on Foundational completion; independent of each other (each touches its own hook file and its own slice of a form component)
- **Polish (Phase 6)**: Depends on all three user stories being complete

### User Story Dependencies

- **User Story 1 (P1 — useCreateUserProfile)**: No dependency on US2/US3 — touches only `AuthForm.tsx`
- **User Story 2 (P2 — useUsers)**: No dependency on US1; shares a file (`CreateHeistForm.tsx`) with US3 but a different section of it (the fetch-on-mount effect vs. the submit handler) — sequence T013 before T017 if one person does both, to avoid merge noise, but they are not logically dependent
- **User Story 3 (P3 — useCreateHeist)**: No dependency on US1; shares `CreateHeistForm.tsx` with US2 (see above)

### Within Each User Story

- Test task MUST be written and confirmed failing before its implementation task (Article III)
- Hook implementation before form component update
- Form component update before manual verification

### Parallel Opportunities

- T002 (Setup) can run alongside T001
- T004 (Foundational) can run alongside T003
- T007, T011, T015 (the three failing tests) can all be written in parallel — different files, no shared dependency beyond the Phase 2 emulator helper
- US1, US2, US3 implementation can proceed in parallel across developers once Phase 2 is done, with the caveat above about `CreateHeistForm.tsx` (US2 and US3 both edit it)

---

## Parallel Example: Writing all three failing tests together

```bash
# After Phase 2 (Foundational) is complete:
Task: "Write failing test in tests/hooks/useCreateUserProfile.test.tsx"
Task: "Write failing test in tests/hooks/useUsers.test.tsx"
Task: "Write failing test in tests/hooks/useCreateHeist.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (emulator infrastructure — CRITICAL, blocks all stories)
3. Complete Phase 3: User Story 1 (`useCreateUserProfile`)
4. **STOP and VALIDATE**: run `tests/hooks/useCreateUserProfile.test.tsx` against the emulator, exercise signup manually
5. Ship AuthForm's Article VI compliance independently if desired — it does not require US2/US3

### Incremental Delivery

1. Setup + Foundational → emulator ready
2. US1 (`useCreateUserProfile`) → test independently → AuthForm compliant
3. US2 (`useUsers`) → test independently → CreateHeistForm's read path compliant
4. US3 (`useCreateHeist`) → test independently → CreateHeistForm's write path compliant, `useHeists.ts` still untouched
5. Polish → full-repo verification against spec.md's Verification Checklist

### Parallel Team Strategy

1. One person/pair completes Setup + Foundational (Phases 1-2) — this is the emulator groundwork and must land first
2. Once done: Developer A takes US1, Developer B takes US2+US3 (both live in `CreateHeistForm.tsx`, so keeping them with one owner avoids merge conflicts on that file)
3. Stories complete and integrate independently; Polish phase runs once all three land

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story/FR for traceability
- FR-004 (Emulator Suite, not mocks) is why Phase 2 exists — see research.md R1 for the full rationale and rejected alternatives
- US2 and US3 both edit `components/CreateHeistForm/CreateHeistForm.tsx` but different sections (mount-effect vs. submit-handler) — sequence to avoid conflicts if one person does both
- Commit after each task or logical group
- Stop at any checkpoint to validate a story independently
