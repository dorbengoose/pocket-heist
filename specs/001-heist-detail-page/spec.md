# Feature Specification: Heist Detail Page

**Feature Branch**: `claude/feature/heist-detail-page`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "Implementar la página de detalle de un heist en
app/(dashboard)/heists/[id]/page.tsx. El tipo Heist ya está definido con todos
sus campos. HeistCard ya genera el link hacia esta ruta, pero la página está
vacía (stub)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Full Heist Details (Priority: P1)

A crew member clicks "View Details" on any heist card from the dashboard list.
They land on a dedicated page showing the complete information for that heist:
its title, description, status, who created it, who is assigned to it, the
deadline, and when it was created. No secondary navigation is required to see
any of these fields.

**Why this priority**: This is the entire purpose of the page — without it,
the feature does not exist. All other stories depend on this content being
visible.

**Independent Test**: Navigate directly to `/heists/<valid-id>`. The page
renders with all heist fields populated and readable without any additional
interaction.

**Acceptance Scenarios**:

1. **Given** a heist with all fields filled, **When** a user navigates to its
   detail URL, **Then** the page displays: title, description, status label,
   creator codename, assignee codename, deadline (human-readable), and creation
   date.
2. **Given** a heist whose `description` is an empty string, **When** the user
   visits its detail page, **Then** the description area shows a clear "No
   description" placeholder — the layout does not break.
   <!-- CORREGIDO: se elimina "hidden or" — conflicto con FR-002, que ya
   decide "placeholder" como comportamiento único. [Conflict] resuelto. -->
3. **Given** a heist with `finalStatus: null`, **When** the page renders,
   **Then** the status is displayed as "Active".
4. **Given** a heist with `finalStatus: 'success'`, **When** the page renders,
   **Then** the status is displayed as "Success".
5. **Given** a heist with `finalStatus: 'failure'`, **When** the page renders,
   **Then** the status is displayed as "Failed".

---

### User Story 2 - Handle Loading and Not-Found States (Priority: P2)

While the heist data is being fetched, the user sees a meaningful loading
indicator rather than a blank or broken layout. If the heist ID in the URL does
not correspond to any existing heist, the user sees a clear, actionable
not-found message — not a crash or empty page.

**Why this priority**: Without proper loading and error states, real users will
encounter blank screens during data fetching or confusing empty pages when
following stale/invalid links. These states are necessary for the feature to be
production-ready.

**Independent Test**: (a) Throttle network speed and navigate to a valid
heist URL — a loading indicator appears before content. (b) Navigate to
`/heists/nonexistent-id` — a not-found message is shown with a link back to
the list.

**Acceptance Scenarios**:

1. **Given** data for the heist is still loading, **When** the user lands on
   the page, **Then** a loading indicator is visible and no partial/empty
   content is shown.
2. **Given** the heist ID in the URL does not match any heist, **When** the
   page finishes loading, **Then** the user sees a "Heist not found" message
   and a link or button to return to the heist list.
3. **Given** a network or Firestore error occurs during fetch, **When** the
   error is detected, **Then** the user sees a distinct "Something went wrong"
   error message (separate from "not found") with a button to retry the fetch.
   The message MUST NOT expose raw error text, stack traces, or Firestore
   error codes to the user.
   <!-- CORREGIDO: se agrega la restricción de no fuga de detalles técnicos.
   [Gap] de requisitos no-funcionales resuelto. -->

---

### Edge Cases

- What happens when the heist's `deadline` is in the past (heist has expired)?
  The deadline date MUST still be displayed faithfully; no "overdue" label is
  required for this version.
- What happens if the user navigates directly to the URL without being
  authenticated? The existing authentication middleware handles this — the
  detail page itself does not add additional auth logic.
- What happens if the heist was deleted between the list render and the detail
  navigation? Treated as the not-found state (User Story 2).
- What happens if a network error occurs (timeout, no connectivity, Firestore
  permission error)? Treated as a fetch error state — distinct from not-found;
  shows a retry action.
- **RESOLVED (2026-07-09)**: If a heist document predates the `deadline`
  field (brownfield data created before this field existed) and the field is
  missing/undefined, the page displays a "No deadline set" placeholder in the
  deadline field's location — same pattern as the empty-description
  placeholder (FR-002). See FR-013.
- **RESOLVED (2026-07-09)**: Since this page fetches data once (`getDoc`, no
  real-time listener — see plan.md, decision by YAGNI), the user does not see
  changes made elsewhere automatically. A manual "Refresh" action is provided
  so the user can re-fetch on demand without a full page reload. This does not
  change the YAGNI decision against real-time listeners. See FR-014.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The page MUST display the heist's title as the primary heading.
- **FR-002**: The page MUST display the heist's description; if empty, show a
  "No description" placeholder without breaking the layout.
- **FR-003**: The page MUST display the heist's status (Active / Success /
  Failed) in a visually distinguishable way (not text-only).
- **FR-004**: The page MUST display the codename of the user who created the
  heist.
- **FR-005**: The page MUST display the codename of the user assigned to the
  heist.
- **FR-006**: The page MUST display the heist's deadline in a human-readable
  date and time format.
- **FR-007**: The page MUST display the date the heist was created, in the
  same human-readable date-and-time format as FR-006.
  <!-- CORREGIDO: se explicita consistencia de formato con FR-006, que antes
  solo decía "date" sin especificar si incluye hora. [Gap] de completitud
  resuelto. -->
- **FR-008**: The page MUST provide a fixed link to `/heists` (not browser
  `back()`) so users can return to the heist list regardless of how they
  arrived at the detail page.
- **FR-009**: The page MUST display a loading indicator while heist data is
  being retrieved.
- **FR-010**: The page MUST display a "not found" message with a return-to-list
  action when the heist ID does not match any existing heist.
- **FR-011**: The page MUST display a distinct "Something went wrong" error
  message with a retry action when a network or Firestore error occurs during
  fetch — this state MUST be visually and textually different from the
  not-found state, and MUST NOT expose raw error text, stack traces, or
  Firestore error codes to the user.
  <!-- CORREGIDO: alineado con el Acceptance Scenario 3 de US2. -->
- **FR-012**: The loading indicator, not-found message, and error message MUST
  be accessible per Constitution Article IV (Accessibility by Default) — at
  minimum: `aria-live` region for the loading/error states, and the "back to
  list" / "retry" actions MUST be keyboard-operable and screen-reader labeled.
  <!-- NUEVO: cierra el [Gap] constitucional — Artículo IV no estaba
  operacionalizado en ningún FR/SC de esta feature. -->
- **FR-013**: If a heist document has no `deadline` value (legacy document
  predating this field), the page MUST display a "No deadline set" placeholder
  in place of the deadline value, without breaking the layout — same pattern
  as FR-002's empty-description placeholder.
  <!-- NUEVO: resuelve el [NEEDS CLARIFICATION: legacy data]. -->
- **FR-014**: The page MUST provide a manual "Refresh" action that re-fetches
  the current heist's data on demand, without introducing a real-time listener
  (consistent with the existing YAGNI decision in plan.md against `onSnapshot`).
  <!-- NUEVO: resuelve el [NEEDS CLARIFICATION: stale data]. -->

### Key Entities

- **Heist**: The primary data object. Fields: `id`, `title`, `description`,
  `createdBy` (uid), `createdByCodename`, `assignedTo` (uid),
  `assignedToCodename`, `createdAt` (Date), `deadline` (Date, **may be
  undefined on legacy documents created before this field existed — displayed
  as "No deadline set" per FR-013**), `finalStatus` (null | 'success' |
  'failure').

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All heist fields (title, description, status, creator, assignee,
  deadline, created date) are visible on the page without requiring any
  additional interaction or scrolling on a standard 1280×800 desktop viewport.
- **SC-002**: The heist status is visually distinguishable from other content
  without relying solely on text (e.g., colour-coded badge), consistent with
  how status is shown in the heist list.
- **SC-003**: Users can return to the heist list in one interaction (one click
  or tap) from the detail page.
- **SC-004**: The loading indicator appears within 100 ms of page navigation
  and is replaced by content or a not-found message once data resolves.
- **SC-005**: Navigating to a URL with an invalid heist ID never results in a
  blank page, uncaught error, or crash — a not-found message is always shown.

## Non-Goals

<!-- NUEVO: sección completa que antes no existía. El primer punto vivía,
mal categorizado, dentro de Assumptions. Los demás son gaps reales
identificados en checklist. -->

- Editing or updating a heist's status, title, description, or assignment is
  explicitly out of scope for this feature — this page is read-only.
  (Future feature, not this one.)
- Real-time updates while viewing the page are out of scope for this version —
  data is fetched once per page load (`getDoc`, no `onSnapshot` listener); the
  user must refresh to see changes made elsewhere. A manual refresh action is
  provided (see FR-014); no automatic polling or listener is introduced.
- No pagination, filtering, or navigation to "related heists" is included.
- No per-heist access restriction is enforced beyond authentication (see
  Clarifications) — this is a confirmed decision, not an open assumption.

## Assumptions

- The existing heist data infrastructure (Firestore hooks, converter) is reused
  as-is; no new data-fetching layer is introduced for this page.
- Codenames (`createdByCodename`, `assignedToCodename`) are safe to display
  directly without sanitization — they are stored as user-controlled strings
  already trusted by the system.
  <!-- ALERTA sin resolver: no hay artículo constitucional que cubra
  sanitización de output para strings user-controlled. Candidato a futuro
  artículo si un segundo caso lo confirma como patrón (ver M4 §5,
  "Dependencias/supuestos"). No se resuelve aquí — se deja marcado. -->
- Timezone for deadline and creation date display follows the user's local
  browser timezone (the same convention used in HeistCard).
- The existing Badge component (used in HeistCard for status) is reused to
  maintain visual consistency.
- Mobile-responsive layout is in scope; the page MUST be usable on small
  screens.
<!-- CORREGIDO: se eliminaron las dos asunciones que ya no eran asunciones
abiertas: (1) "no per-heist access restriction" — ya es una decisión
confirmada en Clarifications, ahora vive en Non-Goals; (2) "no editing" — ya
no es una asunción, es un Non-Goal declarado explícitamente arriba. -->

## Clarifications

### Session 2026-07-06

- Q: Can any authenticated user view the detail page of any heist, or is access restricted to the creator/assignee? → A: Any authenticated user can view any heist (Option A).
- Q: When a network/Firestore error occurs during fetch (not a missing heist), what should the user see? → A: Distinct "Something went wrong" message with a retry button (Option B).
- Q: How should the back-to-list navigation work — fixed link to `/heists` or browser `back()`? → A: Fixed link to `/heists` always (Option A).

### Session 2026-07-09 (resolved via real `/speckit-checklist` run, M4)

- Q: What happens on legacy heist documents missing the `deadline` field? → A: Display "No deadline set" placeholder, same pattern as FR-002 (Option A, recommended). See FR-013.
- Q: How should staleness be handled given no real-time listener (YAGNI)? → A: Manual "Refresh" action, no auto-polling, no listener added (Option A, recommended). See FR-014.

<!--
Nota de proceso: solo 2 de los hallazgos de checklist (CHK002, CHK003,
reflejados también en CHK026) se promovieron a [NEEDS CLARIFICATION] porque
representaban decisiones de negocio pendientes reales, y ya quedaron
resueltas arriba. El resto de los items del checklist real
(CHK001, CHK004-CHK011, CHK013-CHK025, CHK027) son hallazgos válidos de
calidad de redacción/medibilidad/trazabilidad — quedan como backlog
no bloqueante para una siguiente pasada de refinamiento, no para esta
ronda de cierre. Ver M4_Calidad_Especificacion_Guia_Maestra.md §11 para
el detalle completo de qué se resolvió, qué queda pendiente, y por qué
no todo merece la misma urgencia (ceremonia adaptativa).
-->