# UI Contract: HeistDetail Component

**File**: `components/HeistDetail/HeistDetail.tsx`
**Type**: Presentational (server-compatible; no `"use client"` needed)

## Props

```ts
interface HeistDetailProps {
  heist: Heist
}
```

## Rendered Sections (in order)

| Section | Content | Condition |
|---------|---------|-----------|
| Back link | `← Back to Heists` → navigates to `/heists` | Always |
| Title | `heist.title` as `<h1>` | Always |
| Status badge | Badge with label + variant from status mapping | Always |
| Description | `heist.description` as paragraph | If non-empty |
| Description placeholder | "No description provided." | If empty string |
| Creator | Label "Created by" + `heist.createdByCodename` | Always |
| Assignee | Label "Assigned to" + `heist.assignedToCodename` | Always |
| Deadline | Label "Deadline" + formatted date+time | Always |
| Created date | Label "Created" + formatted date+time | Always |

## Date Formatting Convention

Both `deadline` and `createdAt` use the same date+time format, matching the
`HeistCard` convention: `toLocaleDateString('en-US', { month: 'short',
day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })`.

## Accessibility Requirements

- Back link: standard `<a>` / Next.js `<Link>` with descriptive text
- Status badge `<span>` MUST include `aria-label` with full status text
  (e.g., `aria-label="Status: Active"`) so color is not the only signal
- Metadata fields use `<dl>` / `<dt>` / `<dd>` for semantic key-value pairs

---

# UI Contract: HeistDetailsPage

**File**: `app/(dashboard)/heists/[id]/page.tsx`
**Directive**: `"use client"`

## States and Rendered Output

| State | `useHeist` result | Rendered UI |
|-------|-------------------|-------------|
| Loading | `loading: true` | Skeleton (HeistCardSkeleton or equivalent placeholder) |
| Loaded | `heist: Heist` | `<HeistDetail heist={heist} />` |
| Not found | `notFound: true` | "Heist not found." message + link to `/heists` |
| Error | `error: Error` | "Something went wrong." message + retry button |

## Retry Behavior

The retry button re-triggers the fetch by incrementing a `retryCount` state
variable that is included in the `useHeist` dependency array.

---

# Contract: Badge `failure` Variant

**File**: `components/Badge.tsx`

Added variant `'failure'` with styles `bg-red-100 text-red-800`.
Existing variants (`primary`, `secondary`, `success`) remain unchanged.
