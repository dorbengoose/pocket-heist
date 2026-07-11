# Phase 0 Research: Firestore Access Migration to Hooks

**Feature**: 002-firestore-hooks-migration
**Date**: 2026-07-11

## R1: Firebase Local Emulator Suite infrastructure (BLOCKING)

**Finding**: The repository has no Firebase Local Emulator Suite infrastructure today.

Evidence gathered directly from the repo:

- `package.json` — `dependencies` lists only `"firebase": "^12.13.0"` (the client
  SDK). `devDependencies` has no `@firebase/rules-unit-testing`, no `firebase-tools`,
  and no emulator-related package.
- `firebase.json` — has `projects`, `firestore` (rules/indexes/location), and `auth`
  sections only. There is no `"emulators"` key (no `firestore` port, no `auth` port,
  no `ui` config), so `firebase emulators:start` has nothing to bind to.
- `tests/hooks/useHeists.test.tsx` (the one existing hook test in the repo) mocks
  `firebase/firestore` entirely with `vi.mock(...)` — it stubs `collection`,
  `onSnapshot`, `query`, `where`, `Timestamp` as `vi.fn()`. This is the established
  precedent for hook testing in this codebase today, and it is a **mock**, not a
  Firestore substitute running real query/write semantics.

**Why this blocks FR-004**: FR-004 requires the three new hooks
(`useCreateUserProfile`, `useUsers`, `useCreateHeist`) to be tested "verified against
the Firebase Local Emulator Suite — not against Firestore mocks (real vs. substitute
infrastructure verification)." With zero emulator infrastructure in place, there is
currently no way to satisfy FR-004 by following the existing `useHeists.test.tsx`
pattern — that pattern is exactly the mock-based approach FR-004 rejects.

**Decision**: Emulator infrastructure must be stood up as an explicit, first-class
part of this feature's implementation — not assumed to already exist. Concretely:

1. Add `@firebase/rules-unit-testing` and `firebase-tools` as `devDependencies`.
2. Add an `"emulators"` block to `firebase.json` (at minimum `firestore` and `ui`;
   `auth` only if a hook under test needs authenticated reads/writes — confirm during
   Phase 1 which hooks require an authenticated context).
3. Add a Vitest setup path (or per-test `beforeAll`/`afterAll`) that connects to the
   emulator via `connectFirestoreEmulator` from `firebase/firestore`, and a project
   `npm` script (e.g. `emulators:start`) to run the suite locally/in CI ahead of
   `npm run test`.
4. Document the emulator startup step in this feature's `quickstart.md` so it is
   runnable, not just described.

**Rationale**: FR-004 is explicit and non-negotiable (ties to Constitution Article
III, Test-First). Silently testing against mocks (the path of least resistance,
matching existing precedent) would satisfy the letter of "tests exist" but violate
the explicit real-vs-substitute requirement the spec calls out by name. Standing up
the emulator is a one-time repo-level cost that also benefits any future Firestore
hook work, not scope creep specific to this feature's three hooks.

**Alternatives considered**:
- *Keep using `vi.mock('firebase/firestore', ...)` as `useHeists.test.tsx` does* —
  Rejected. This is precisely the substitute-infrastructure approach FR-004 rules
  out; reusing it would silently fail the acceptance criteria.
- *Test against the live Firebase project (`pocket-heist-website-f87be`)* — Rejected.
  Writes/reads against production data are not repeatable, pollute real data, and
  are unsafe to run in CI without dedicated throwaway credentials; the Emulator Suite
  exists specifically to avoid this.
- *Defer FR-004's emulator requirement and ship with mocks now, add emulator later* —
  Rejected. FR-004 is explicit and NON-NEGOTIABLE; deferring it would mean shipping
  the feature without meeting its own acceptance criteria.

## R2: Hook placement and naming

**Decision**: Three new standalone hook files under `hooks/`:
`useCreateUserProfile.ts`, `useUsers.ts`, `useCreateHeist.ts` — matching FR-001–FR-003
and the existing Clarifications session (2026-07-11) which already ruled out
extending an existing auth hook (none exists) or extending `useHeists.ts` (rejected
per FR-003's design note, to preserve Article I single-responsibility).

**Rationale**: Already settled in `spec.md` Clarifications and FR-003's explicit
design note. No further research needed.

**Alternatives considered**: N/A — already resolved in the spec itself.

## R3: Preserving observable behavior during migration

**Decision**: Each hook wraps the exact same Firestore call currently inline in the
component (same collection paths, same field shapes, same error propagation via
throw/catch), so the calling component's existing `try/catch`, error message
strings, and `router.push` timing are unchanged. The hooks return the same shapes
the components already destructure locally (e.g. `useUsers` returns
`{ users, loading, error }` matching `CreateHeistForm`'s existing local state names).

**Rationale**: Spec's Non-Goals section explicitly forbids any change to observable
behavior (error messages, redirects, timing). The safest way to guarantee this is a
mechanical extraction — move the call and its surrounding state into the hook,
change nothing about *what* is called or *when*.

**Alternatives considered**:
- *Redesign hooks to use a shared generic `useFirestoreQuery`/`useFirestoreMutation`
  abstraction* — Rejected per Constitution Article V (YAGNI) and spec Non-Goals; no
  requirement calls for this generality, and it risks subtly changing error/loading
  timing.
