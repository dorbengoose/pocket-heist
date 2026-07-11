# Implementation Plan: Heist Detail Page

**Branch**: `001-heist-detail-page` | **Date**: 2026-07-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-heist-detail-page/spec.md`

## Summary

Implement the read-only heist detail page at `app/(dashboard)/heists/[id]/page.tsx`,
which is currently a stub. The page shows all fields of a single `Heist` document
fetched from Firestore by ID. It handles loading, not-found, and network-error states
distinctly. A new `useHeist` hook is introduced for single-document lookup; a new
`HeistDetail` presentational component renders the data. The shared `Badge` component
gains a `failure` variant to support the "Failed" status display.

## Technical Context

**Language/Version**: TypeScript (strict) — ES2017 / esnext modules

**Primary Dependencies**: Next.js 16 (App Router), React 19, Firebase 10 (Firestore `getDoc`), Tailwind CSS 4

**Storage**: Firestore — existing `heistConverter` and `COLLECTIONS.HEISTS` reused

**Testing**: Vitest + Testing Library (jsdom) — TDD required (Constitution III)

**Target Platform**: Web browser (desktop + mobile responsive)

**Project Type**: Web application — dashboard feature page

**Performance Goals**: Loading indicator within 100 ms of navigation; content or
not-found message as soon as Firestore resolves (typically < 1 s on good connection)

**Constraints**: Read-only page; no auth logic added (handled by dashboard layout);
`"use client"` only on the page file (not the presentational component)

**Scale/Scope**: Single-document Firestore read; no pagination or list handling

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Component-First | ✅ Pass | `HeistDetail` is an isolated, testable presentational component |
| II. Strict Type Safety | ✅ Pass | All props typed via existing `Heist` interface; new hook uses typed return |
| III. Test-First | ✅ Pass | Tests written first for `useHeist` and `HeistDetail`; red before green |
| IV. Accessibility by Default | ✅ Pass | `<dl>/<dt>/<dd>` for metadata; `aria-label` on badge; semantic back link |
| V. Simplicity (YAGNI) | ✅ Pass | No editing, no real-time subscription, no new abstractions beyond what's needed |

*Post-design re-check: all gates still pass. No Complexity Tracking entry needed.*

## Project Structure

### Documentation (this feature)

```text
specs/001-heist-detail-page/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── HeistDetail.md   # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code

```text
components/
├── Badge.tsx                          # MODIFY — add 'failure' variant
└── HeistDetail/                       # NEW
    ├── HeistDetail.tsx                # Presentational component
    ├── HeistDetail.module.css         # Styles
    └── index.ts                       # Barrel export

hooks/
└── useHeist.ts                        # NEW — single-document Firestore fetch

app/(dashboard)/heists/[id]/
└── page.tsx                           # MODIFY — replace stub with full impl

tests/
├── components/
│   └── HeistDetail.test.tsx           # NEW
└── hooks/
    └── useHeist.test.ts               # NEW
```

**Structure Decision**: Standard Next.js App Router web-app layout. New files follow
existing conventions (`components/Name/Name.tsx` + `index.ts` barrel,
`hooks/useName.ts`, `tests/` mirroring `components/` and `hooks/`).
