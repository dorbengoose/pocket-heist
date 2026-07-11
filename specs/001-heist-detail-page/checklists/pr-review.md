# PR Review Checklist: Heist Detail Page

**Purpose**: Full requirements-quality review for a PR reviewer before merging this feature
**Created**: 2026-07-09
**Feature**: [spec.md](../spec.md)

**Note**: This checklist tests the REQUIREMENTS (spec.md), not the implementation. Each item asks whether the requirement is complete, clear, consistent, and measurable — not whether the code works.

## Requirement Completeness

- [ ] CHK001 Are requirements defined for what happens when `createdByCodename` or `assignedToCodename` is missing/empty on a legacy document? [Gap, Spec §Key Entities]
- [ ] CHK002 Are requirements defined for the legacy `deadline`-missing scenario referenced in Edge Cases, beyond flagging it as unresolved? [Gap, Spec §Edge Cases, NEEDS CLARIFICATION]
- [ ] CHK003 Is the stale-data-while-viewing question resolved with a concrete requirement, or does it remain an open decision blocking sign-off? [Gap, Spec §Edge Cases, NEEDS CLARIFICATION]
- [ ] CHK004 Are requirements defined for the visual treatment/icon differentiating "Active", "Success", and "Failed" status, beyond "not text-only"? [Completeness, Spec §FR-003]
- [ ] CHK005 Are focus-management requirements defined for the transition between loading → content and loading → error/not-found states (e.g., where does keyboard focus land)? [Gap, Spec §FR-012]

## Requirement Clarity

- [ ] CHK006 Is "visually distinguishable" (FR-003) quantified beyond "not text-only" (e.g., color + icon, contrast ratio)? [Clarity, Spec §FR-003]
- [ ] CHK007 Is "human-readable date and time format" (FR-006, FR-007) specified precisely enough to be implemented consistently (e.g., locale, 12h/24h, date pattern)? [Clarity, Spec §FR-006, §FR-007]
- [ ] CHK008 Is "distinct" in FR-011 ("distinct 'Something went wrong' message") defined with concrete differentiators (copy, color, icon) from the not-found state, or left to implementer judgment? [Clarity, Spec §FR-011]
- [ ] CHK009 Is "screen-reader labeled" (FR-012) specific enough about expected label text/pattern for the back-to-list and retry actions? [Clarity, Spec §FR-012]

## Requirement Consistency

- [ ] CHK010 Do the status-display requirements (FR-003) align with the status badge behavior already established for HeistCard, or could implementers reasonably diverge? [Consistency, Spec §Assumptions]
- [ ] CHK011 Is the date/time formatting requirement consistent between FR-006 (deadline) and FR-007 (created date) in practice, given FR-007 explicitly references matching FR-006's format? [Consistency, Spec §FR-006, §FR-007]
- [ ] CHK012 Does the "no editing" Non-Goal conflict with any implied mutation in the Acceptance Scenarios or Key Entities sections? [Consistency, Spec §Non-Goals]

## Acceptance Criteria Quality

- [ ] CHK013 Is SC-001 ("visible without scrolling on 1280×800") measurable independent of content length variance (e.g., very long descriptions)? [Measurability, Spec §SC-001]
- [ ] CHK014 Is SC-004's "100 ms" loading-indicator threshold measurable given it depends on client rendering, not just network response? [Measurability, Spec §SC-004]
- [ ] CHK015 Does every functional requirement (FR-001–FR-012) map to at least one Success Criterion or Acceptance Scenario, or are any FRs untested by the defined criteria? [Traceability, Spec §Requirements, §Success Criteria]

## Scenario Coverage

- [ ] CHK016 Are requirements defined for the retry action's behavior if the retry itself fails again (repeated error)? [Coverage, Gap, Spec §FR-011]
- [ ] CHK017 Are requirements defined for concurrent/rapid navigation (e.g., user clicks a different heist link while this page is still loading)? [Coverage, Gap]
- [ ] CHK018 Are the three status Acceptance Scenarios (Active/Success/Failed) sufficient to cover all values of `finalStatus`, including any other possible states not enumerated in Key Entities? [Coverage, Spec §Acceptance Scenarios, §Key Entities]

## Edge Case Coverage

- [ ] CHK019 Is the "expired deadline" edge case's "no overdue label required" decision reflected anywhere in the Functional Requirements, or only in Edge Cases prose? [Consistency, Gap, Spec §Edge Cases]
- [ ] CHK020 Are empty-string edge cases addressed for `title`, `createdByCodename`, and `assignedToCodename` the way they are for `description` (FR-002)? [Coverage, Gap, Spec §FR-002]

## Non-Functional Requirements

- [ ] CHK021 Are accessibility requirements (FR-012) specific enough to be verifiable against WCAG success criteria, or only described at a high level ("aria-live region")? [Measurability, Spec §FR-012]
- [ ] CHK022 Are performance requirements specified for any state beyond initial load (e.g., retry action latency expectations)? [Gap, Spec §SC-004]
- [ ] CHK023 Is the security/trust boundary around displaying user-controlled codename strings without sanitization documented as a reviewed decision, or left as an unresolved flag? [Assumption, Spec §Assumptions]

## Dependencies & Assumptions

- [ ] CHK024 Is the assumption that "existing Firestore hooks/converter are reused as-is" validated against actual field nullability (e.g., does the converter guarantee `deadline` is never undefined, contradicting the legacy-data edge case)? [Assumption, Conflict?, Spec §Assumptions, §Edge Cases]
- [ ] CHK025 Is the dependency on the existing Badge component's status-variant support (Active/Success/Failed) confirmed, or assumed without verification? [Assumption, Spec §Assumptions]

## Ambiguities & Conflicts

- [ ] CHK026 Do the two remaining `[NEEDS CLARIFICATION]` markers (legacy deadline, stale data) block this spec from being considered ready for merge sign-off, given they are listed as "Pending" rather than resolved? [Ambiguity, Spec §Clarifications]
- [ ] CHK027 Does the Non-Goals statement "no per-heist access restriction beyond authentication" fully align with the Clarifications session answer, or is there residual ambiguity about future access-control expectations? [Consistency, Spec §Non-Goals, §Clarifications]

## Notes

- Focus: full spec review across all requirement-quality dimensions (per user selection).
- Audience/depth: PR reviewer, standard rigor.
- CHK002, CHK003, CHK026 flag that this spec still has 2 open `[NEEDS CLARIFICATION]` markers per the Clarifications section — the stale `requirements.md` checklist (all items checked, dated before these markers existed) should not be relied on to claim the spec is fully resolved.
