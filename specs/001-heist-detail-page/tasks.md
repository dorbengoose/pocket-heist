---

description: "Task list for Heist Detail Page implementation"
---

# Tasks: Heist Detail Page

**Input**: Design documents from `specs/001-heist-detail-page/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/HeistDetail.md ✅

**Tests**: Included — Constitution Principle III mandates TDD (tests written and confirmed failing BEFORE implementation).

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)

---

## Phase 1: Setup

**Purpose**: Create typed stubs so TDD tests have importable targets that fail by
**assertion** (not by import/type error). Each stub MUST export the correct signature
with no real logic — tests must fail because the behavior is absent, not because the
module is missing or malformed.

- [x] T001 Create `components/HeistDetail/HeistDetail.tsx` — export a typed stub:
  `export default function HeistDetail(_props: { heist: Heist }): JSX.Element { return <></> }`
  (correct prop type, empty render — tests will fail on missing content assertions)
- [x] T002 [P] Create `components/HeistDetail/HeistDetail.module.css` as an empty CSS module
- [x] T003 [P] Create `components/HeistDetail/index.ts` — export the stub:
  `export { default as HeistDetail } from './HeistDetail'`
- [x] T004 [P] Create `hooks/useHeist.ts` — export a typed stub that always returns the
  loading state: `export function useHeist(_id: string, _retry = 0): UseHeistResult { return { heist: null, loading: true, error: null, notFound: false } }`
  (tests expecting loaded/notFound/error states will fail by assertion, not by missing export)

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: Extend `Badge` with `failure` variant — required by both user stories' status display.

**⚠️ CRITICAL**: The `HeistDetail` component (US1) depends on `Badge` rendering the `failure` variant. This MUST be complete before US1 implementation.

- [x] T005 Add `failure` variant (`bg-red-100 text-red-800`) to `BadgeProps` union and
  `variantStyles` map in `components/Badge.tsx`
- [x] T005a Run `npx vitest tests/components/Badge.test.tsx` and confirm ALL existing
  Badge tests still pass — if any fail, fix `components/Badge.tsx` before proceeding
  (Principle IV: accessibility contract of existing variants must not regress)

**Checkpoint**: Badge renders all four variants; existing test suite green.

---

## Phase 3: User Story 1 — View Full Heist Details (Priority: P1) 🎯 MVP

**Goal**: A user navigating to `/heists/<id>` sees all heist fields rendered with correct content, status badge, accessible markup, and a back link to `/heists`.

**Independent Test**: Navigate to `/heists/<valid-id>` after implementing T005–T012; all heist fields are visible and the back link works.

### Tests for User Story 1 ⚠️ Write FIRST — confirm they FAIL before implementing

- [x] T006 [P] [US1] Write tests for `useHeist` hook covering the **loaded** state in `tests/hooks/useHeist.test.tsx`:
  - Mock `getDoc` to return a heist document snapshot
  - Assert `{ heist: Heist, loading: false, error: null, notFound: false }` is returned
- [x] T007 [P] [US1] Write tests for `HeistDetail` component in `tests/components/HeistDetail.test.tsx`:
  - Renders `heist.title` as `<h1>`
  - Renders `heist.description` as paragraph when non-empty
  - Renders "No description provided." when `description` is empty string
  - Renders status badge "Active" for `finalStatus: null`
  - Renders status badge "Success" for `finalStatus: 'success'`
  - Renders status badge "Failed" for `finalStatus: 'failure'`
  - Badge `<span>` has `aria-label` containing status text (e.g. `"Status: Active"`)
  - Renders `heist.createdByCodename` in a `<dd>` element
  - Renders `heist.assignedToCodename` in a `<dd>` element
  - Renders formatted `heist.deadline` in a `<dd>` element
  - Renders formatted `heist.createdAt` in a `<dd>` element
  - Back link has `href="/heists"` and text containing "Back"

### Implementation for User Story 1

- [x] T008 [US1] Implement `useHeist(id: string)` hook in `hooks/useHeist.ts`:
  - Use Firestore `getDoc` on `COLLECTIONS.HEISTS` with `heistConverter`
  - Return `{ heist, loading, error, notFound }` per state matrix in `data-model.md`
  - Accept `retryCount` as second parameter (default 0) so page can trigger re-fetch
- [x] T009 [US1] Implement `HeistDetail` presentational component in `components/HeistDetail/HeistDetail.tsx`:
  - Props: `{ heist: Heist }` — no `"use client"` directive
  - Render back link as `<Link href="/heists">← Back to Heists</Link>`
  - Render `heist.title` as `<h1>`
  - Render `<Badge>` with label and variant from status mapping in `data-model.md`; add `aria-label="Status: <label>"`
  - Render description or "No description provided." placeholder
  - Render metadata (`createdByCodename`, `assignedToCodename`, `deadline`, `createdAt`) using `<dl>/<dt>/<dd>` pairs
  - Format `deadline` with `{ month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }`
  - Format `createdAt` with `{ month: 'short', day: 'numeric', year: 'numeric' }`
- [x] T010 [US1] Add styles to `components/HeistDetail/HeistDetail.module.css` (layout, metadata grid, back link)
- [x] T011 [US1] Add barrel export to `components/HeistDetail/index.ts`: `export { default as HeistDetail } from './HeistDetail'`
- [x] T012 [US1] Update `app/(dashboard)/heists/[id]/page.tsx` — mark `"use client"`, use `useParams()` to get `id`, call `useHeist(id)`, render `<HeistDetail heist={heist!} />` for the loaded state (US2 states handled next phase)

**Checkpoint**: At this point, User Story 1 is fully functional. `npm run test` passes for T006 and T007.

---

## Phase 4: User Story 2 — Loading and Not-Found/Error States (Priority: P2)

**Goal**: The page shows a loading skeleton while fetching, a "Heist not found." message for unknown IDs, and a "Something went wrong." message with a retry button for network/Firestore errors.

**Independent Test**: (a) Throttle network → loading skeleton appears. (b) Navigate to `/heists/nonexistent-id` → not-found message shown. (c) Block Firestore requests → error message + retry button shown.

### Tests for User Story 2 ⚠️ Write FIRST — confirm they FAIL before implementing

- [x] T013 [P] [US2] Add test cases to `tests/hooks/useHeist.test.tsx` for not-found and error states:
  - Mock `getDoc` returning `exists(): false` → assert `{ notFound: true, heist: null, error: null, loading: false }`
  - Mock `getDoc` throwing an error → assert `{ error: Error, heist: null, notFound: false, loading: false }`
  - Initial call → assert `{ loading: true }` before promise resolves
- [x] T014 [P] [US2] Write tests for page state rendering in `tests/components/HeistDetailsPage.test.tsx`:
  - Mock `useHeist` returning `loading: true` → assert `HeistCardSkeleton` or loading indicator is present
  - Mock `useHeist` returning `notFound: true` → assert text "Heist not found" is present; link to `/heists` present
  - Mock `useHeist` returning `error: Error` → assert text "Something went wrong" is present; retry button present
  - Click retry button → assert `useHeist` is called again (retryCount increments)

### Implementation for User Story 2

- [x] T015 [US2] Add loading, not-found, and error states to `app/(dashboard)/heists/[id]/page.tsx`:
  - `loading: true` → render `<HeistCardSkeleton />` (reuse existing component)
  - `notFound: true` → render "Heist not found." paragraph + `<Link href="/heists">Back to Heists</Link>`
  - `error` → render "Something went wrong." paragraph + `<button onClick={() => setRetryCount(c => c + 1)}>Retry</button>`
  - Pass `retryCount` as second argument to `useHeist(id, retryCount)`

**Checkpoint**: All user stories complete and independently testable. `npm run test` passes for all new test files.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T016 [P] Run `npm run lint` and fix any reported issues across all modified/created files
- [x] T017 [P] Run `npm run test` — confirm ALL tests pass (new + pre-existing)
- [x] T018 Manually validate all 6 scenarios in `specs/001-heist-detail-page/quickstart.md`

---

## Phase 6: Remediation

**Purpose**: Address CRITICAL/HIGH findings from `/speckit-analyze` before this feature is considered merge-ready.

- [X] T019 Make `deadline` optional in the `Heist` type; in `heistConverter.fromFirestore`,
  do not invoke `.toDate()` when `deadline` is undefined. In `HeistDetail`, render
  "No deadline set" when `deadline` is missing.
  Files: `types/firestore/heist.ts`, `components/HeistDetail/HeistDetail.tsx`
  (Also guarded `components/HeistCard/HeistCard.tsx:58` and `hooks/useHeists.ts:49`,
  which independently consume `Heist.deadline` and would otherwise crash/misbehave
  once the field became optional on the shared type.)
- [X] T020 Change `createdAt` to date+time format, using the same helper already used
  for `deadline`.
  Files: `components/HeistDetail/HeistDetail.tsx`, `contracts/HeistDetail.md`
  (Renamed `formatDeadline` → `formatDateTime` since it's now shared by both
  fields; removed the now-unused `formatDate` helper.)
- [X] T021 Add `role="status"` (or `aria-live`) to the not-found and error blocks in
  `page.tsx`.
  File: `app/(dashboard)/heists/[id]/page.tsx`
  (Back-link and retry actions already keyboard-operable and screen-reader
  labeled as native `<a>`/`<button>` elements — no change needed there.)
- [X] T022 Convert `HeistDetail.module.css` to Tailwind classes; delete the CSS file.
  Files: `components/HeistDetail/HeistDetail.tsx`, delete `HeistDetail.module.css`
  (Colors remapped to theme tokens matching `HeistCard`'s convention, e.g.
  `text-heading`/`text-body`/`border-light`, fixing near-invisible dark-on-dark
  text from the original hardcoded light-theme hex values. Spacing/sizing/layout
  kept as literal translations of the original CSS, not homogenized with
  `HeistCard`.)
- [X] T023 Implement a "Refresh" button that re-runs the existing fetch, without adding
  `onSnapshot`.
  File: `app/(dashboard)/heists/[id]/page.tsx`
  (Reused the existing `retryCount`/`setRetryCount` mechanism already used by the
  error-state "Retry" button — no change to `useHeist.ts` needed.)
- [ ] T024 Update `checklists/requirements.md` so it no longer asserts "No NEEDS
  CLARIFICATION remain" about an outdated spec.
  File: `specs/001-heist-detail-page/checklists/requirements.md`

**Checkpoint**: All CRITICAL/HIGH `/speckit-analyze` findings resolved; `npm run test` and `npm run lint` pass.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (Badge.tsx exists); BLOCKS US1 implementation
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion
  - Tests (T006–T007): can be written in parallel after T001–T004 stubs exist
  - Implementation (T008–T012): sequential within story; requires T005 done
- **User Story 2 (Phase 4)**: Depends on Phase 3 completion (page has loaded-state wiring before adding other states)
- **Polish (Phase 5)**: Depends on Phases 3 and 4

### User Story Dependencies

- **User Story 1 (P1)**: Foundational phase complete → no dependency on US2
- **User Story 2 (P2)**: Depends on US1 — page must exist with loaded state before adding other states

### Within Each User Story

1. Write tests → confirm they FAIL
2. Implement until tests PASS (Red → Green)
3. Refactor if needed (Green → Refactor)

### Parallel Opportunities

- T002, T003, T004 can run in parallel after T001
- T006 and T007 can run in parallel (different test files)
- T013 and T014 can run in parallel (different files)
- T016 and T017 can run in parallel (lint vs test)

---

## Parallel Example: User Story 1 Tests

```bash
# Write both test files simultaneously (parallel):
# tests/hooks/useHeist.test.tsx     (T006)
# tests/components/HeistDetail.test.tsx  (T007)

# Then implement:
# hooks/useHeist.ts                 (T008)
# components/HeistDetail/HeistDetail.tsx  (T009)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup stubs
2. Complete Phase 2: Badge `failure` variant
3. Write and confirm-failing tests for US1 (T006–T007)
4. Implement US1 (T008–T012)
5. **STOP and VALIDATE**: Run `npm run test` — US1 tests pass; navigate to a heist detail page in the running app
6. Demo if ready

### Incremental Delivery

1. Setup + Foundational → Badge extended
2. US1 complete → Test and demo the happy path
3. US2 complete → Test all edge states
4. Polish → Lint + full test suite clean

---

## Notes

- `[P]` tasks target different files — safe to work in parallel
- `[US1]`/`[US2]` label maps each task to its user story for traceability
- TDD is NON-NEGOTIABLE per Constitution Principle III: tests must be written AND confirmed failing before implementation starts
- `HeistCardSkeleton` is reused for the loading state (no new skeleton component needed)
- `HeistDetail` has NO `"use client"` directive — it is a server-compatible presentational component
- Only `app/(dashboard)/heists/[id]/page.tsx` gets `"use client"` (uses `useParams` and `useHeist`)
