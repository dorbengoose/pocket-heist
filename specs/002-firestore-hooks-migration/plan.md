# Implementation Plan: Firestore Access Migration to Hooks (Article VI Compliance)

**Branch**: `002-firestore-hooks-migration` | **Date**: 2026-07-11 | **Spec**: `specs/002-firestore-hooks-migration/spec.md`

**Input**: Feature specification from `/specs/002-firestore-hooks-migration/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

`AuthForm.tsx` and `CreateHeistForm.tsx` call `firebase/firestore` directly,
violating Constitution Article VI (hooks MUST be the sole encapsulation layer for
Firestore reads/writes). This plan extracts three hooks — `useCreateUserProfile`,
`useUsers`, `useCreateHeist` — with identical observable behavior to what the forms
do today. The primary technical unknown resolved in Phase 0 is that the repo has
**no Firebase Local Emulator Suite infrastructure**, which FR-004 requires tests to
run against; standing that infrastructure up is now in scope for this feature
(see `research.md`, R1).

## Technical Context

**Language/Version**: TypeScript (strict mode), ES2017 target, esnext modules

**Primary Dependencies**: `firebase` ^12.13.0 (client SDK, already present);
`@firebase/rules-unit-testing` and `firebase-tools` (devDependencies — **NOT yet
installed**, must be added, see research.md R1)

**Storage**: Firestore (`users`, `heists` collections per `types/firestore/`) — via
the Firebase Local Emulator Suite for tests, live Firestore for the app itself

**Testing**: Vitest + Testing Library + jsdom, `renderHook`/`waitFor` (existing
pattern in `tests/hooks/useHeists.test.tsx`) — but against the Emulator Suite per
FR-004, not `vi.mock('firebase/firestore', ...)` as that existing test does

**Target Platform**: Web (Next.js 16 App Router, browser + Node test runner)

**Project Type**: Web application (single Next.js project, no separate
frontend/backend split)

**Performance Goals**: N/A — no behavior change, no new perf requirements (spec
Non-Goals)

**Constraints**: Zero change to observable behavior of `AuthForm.tsx` and
`CreateHeistForm.tsx` (same error messages, same redirects, same timing);
`useHeists.ts` MUST remain unmodified (FR-003 design note)

**Scale/Scope**: 3 new hook files, 3 new hook test files, edits to 2 existing form
components, 1 emulator infrastructure setup (`firebase.json`, `package.json`, a
Vitest emulator connection helper)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|---|---|---|
| I. Component-First | PASS | No new components; forms continue composing hooks, not inline Firestore logic. |
| II. Strict Type Safety | PASS | Hooks will be fully typed against `types/firestore/`; no `any`. |
| III. Test-First (NON-NEGOTIABLE) | PASS (conditional) | Tests MUST be written and failing before hook implementation. FR-004 additionally requires Emulator Suite verification — see research.md R1 for the infrastructure gap this surfaces and how it's closed before hook tests are written. |
| IV. Accessibility by Default | N/A | No UI/markup changes — pure data-layer extraction, forms' rendered output is unchanged. |
| V. Simplicity (YAGNI) | PASS | Hooks are 1:1 mechanical extractions of existing calls; no generic Firestore abstraction introduced (research.md R3). |
| VI. Firestore as Sole Data Integration | PASS (this feature's purpose) | Closes the known gap recorded at ratification (v1.1.0 Sync Impact Report) — `useHeists.ts` explicitly left unmodified per FR-003. |

No violations requiring Complexity Tracking justification.

## Project Structure

### Documentation (this feature)

```text
specs/002-firestore-hooks-migration/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created here)
```

### Source Code (repository root)

```text
hooks/
├── useHeists.ts              # existing — unmodified (FR-003)
├── useHeistById.ts           # existing — unmodified
├── useCreateUserProfile.ts   # NEW — FR-001
├── useUsers.ts                # NEW — FR-002
└── useCreateHeist.ts          # NEW — FR-003

components/
├── AuthForm/AuthForm.tsx                    # edited — drop setDoc/doc import, call useCreateUserProfile
└── CreateHeistForm/CreateHeistForm.tsx      # edited — drop getDocs/collection/addDoc imports, call useUsers + useCreateHeist

tests/hooks/
├── useHeists.test.tsx            # existing — unmodified
├── useUser.test.tsx              # existing — unmodified
├── useCreateUserProfile.test.tsx # NEW — against Emulator Suite (FR-004)
├── useUsers.test.tsx              # NEW — against Emulator Suite (FR-004)
└── useCreateHeist.test.tsx        # NEW — against Emulator Suite (FR-004)

firebase.json          # edited — add "emulators" section (research.md R1)
package.json            # edited — add @firebase/rules-unit-testing, firebase-tools devDependencies
```

**Structure Decision**: Single Next.js project (existing `Option 1`-style layout, no
frontend/backend split). All new code lives in the existing `hooks/` and
`tests/hooks/` directories, following the established pattern set by `useHeists.ts`
/ `useHeists.test.tsx`. No new top-level directories.

## Complexity Tracking

> Fill ONLY if Constitution Check has violations that must be justified

No violations — table omitted.
