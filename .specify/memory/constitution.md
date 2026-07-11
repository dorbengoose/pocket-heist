<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 1.1.0 (new principle added — Article VI)

Modified principles: N/A (I-V unchanged)

Added sections:
  - VI. Firestore as Sole Data Integration

Removed sections: N/A

Templates requiring updates:
  - .specify/templates/plan-template.md ⚠ pending manual review — Constitution
    Check section should reference Article VI where data-access decisions
    are evaluated
  - .specify/templates/spec-template.md ✅ No changes required
  - .specify/templates/tasks-template.md ✅ No changes required

Follow-up TODOs:
  - [Gap] Existing violation of Article VI, bullet 3 detected at ratification
    time in components/AuthForm/AuthForm.tsx and
    components/CreateHeistForm/CreateHeistForm.tsx (direct firebase/firestore
    imports outside hooks). Documented as technical debt, not blocking
    ratification. See knowledge-base.md M8 gap log for full detail.
-->

# Pocket Heist Constitution

## Core Principles

### I. Component-First

Every piece of UI MUST be built as a reusable, independently testable React component
located in `components/`. Pages in `app/` MUST compose components rather than containing
inline UI logic. Components MUST have a single, clearly defined purpose; extract logic
into custom hooks when state or side-effects become non-trivial. No organizational-only
components without clear UI responsibility.

### II. Strict Type Safety

TypeScript strict mode is NON-NEGOTIABLE across the entire codebase. The `any` type MUST
NOT be used. All component props MUST be explicitly typed. All API boundaries and external
data MUST be validated and typed. Path aliases (`@/*`) MUST be used for imports to avoid
fragile relative paths.

### III. Test-First (NON-NEGOTIABLE)

TDD is mandatory for all components and features:
- Tests MUST be written and confirmed failing before implementation begins.
- Red-Green-Refactor cycle MUST be strictly followed.
- Tests MUST use Testing Library with accessible queries (`getByRole`, `getByLabelText`)
  as the first resort; `queryByTestId` is a last resort only.
- Use `userEvent` instead of `fireEvent` for user interaction simulation.
- All tests MUST pass (`npm run test`) before a feature is considered complete.

### IV. Accessibility by Default

All interactive components MUST be accessible:
- Semantic HTML elements MUST be used where available.
- ARIA roles and labels MUST be applied when semantic HTML is insufficient.
- Accessible query-first testing (`getByRole`, `getByLabelText`) enforces this at the
  test layer — if a component is hard to query accessibly, the component itself is
  non-compliant and MUST be fixed.

### V. Simplicity (YAGNI)

Features MUST be implemented to the minimal scope required by the specification.
- No features, abstractions, or helpers added speculatively.
- Three similar lines of code are preferable to a premature abstraction.
- Components without client-side hooks MUST NOT use the `"use client"` directive.
- No half-finished implementations; each merged feature MUST be complete and functional.

### VI. Firestore as Sole Data Integration

Firestore MUST be the only data integration used by this project.
- No additional data-fetching SDKs, external REST APIs, or third-party data
  services MUST be introduced without first amending this article.
- All application data access MUST pass through Firestore, governed by the
  rules defined in `firestore.rules`.
- Hooks (e.g. `useHeist.ts`, `useHeists.ts`) MUST remain the sole
  encapsulation layer for Firestore reads/writes — no direct Firestore calls
  from components. **[Known gap at ratification: see Follow-up TODOs below —
  AuthForm.tsx and CreateHeistForm.tsx currently violate this bullet.]**

## Technology Stack & Constraints

- **Framework**: Next.js 16 with App Router — server components by default; `"use client"`
  only when `useState`, `useEffect`, or browser APIs are required.
- **Language**: TypeScript (strict mode) — ES2017 target, esnext modules.
- **Styling**: Tailwind CSS 4 — utility classes only; no separate CSS files unless
  PostCSS features are strictly required.
- **Testing**: Vitest + Testing Library + jsdom — test files mirror `app/` and
  `components/` structure under `tests/`.
- **Linting**: ESLint with Next.js and TypeScript rules — `npm run lint` MUST pass clean.
- **Node Compatibility**: Dependencies MUST be compatible with the project's locked
  Node.js version as defined in `package.json`.

## Development Workflow

1. Create or update components in `components/` as reusable, testable units.
2. Write tests in `tests/` mirroring the component location — confirm they fail.
3. Implement the component until tests pass.
4. Integrate the component into page routes within `app/`.
5. Run `npm run lint` — fix all reported issues before proceeding.
6. Run `npm run test` — ALL tests MUST pass.
7. Use `npm run dev` for iterative development with hot reload before marking complete.

## Governance

This constitution supersedes all other development practices and guidelines for
Pocket Heist. Where conflicts exist between this document and any other convention,
this constitution takes precedence.

**Amendment procedure**: Amendments MUST be submitted as a pull request that:
1. Updates this document with a version bump.
2. Prepends a Sync Impact Report as an HTML comment (as shown above).
3. Updates any dependent templates listed in the Sync Impact Report.

**Versioning policy**:
- MAJOR: Backward-incompatible removals or redefinitions of existing principles.
- MINOR: New principles or sections added.
- PATCH: Clarifications, wording fixes, non-semantic refinements.

**Compliance**: All PRs MUST be reviewed against this constitution. Complexity or
deviations MUST be explicitly justified in the plan's Complexity Tracking table.
See `CLAUDE.md` for runtime development guidance.

**Version**: 1.0.0 | **Ratified**: 2026-07-06 | **Last Amended**: 2026-07-06
