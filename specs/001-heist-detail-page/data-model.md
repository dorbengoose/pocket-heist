# Data Model: Heist Detail Page

## Primary Entity: Heist (existing, read-only)

Defined in `types/firestore/heist.ts`. No schema changes required.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Firestore document ID |
| `title` | `string` | Primary heading on detail page |
| `description` | `string` | May be empty string → show placeholder |
| `createdBy` | `string` | UID — NOT displayed; use `createdByCodename` |
| `createdByCodename` | `string` | Displayed as creator label |
| `assignedTo` | `string` | UID — NOT displayed; use `assignedToCodename` |
| `assignedToCodename` | `string` | Displayed as assignee label |
| `createdAt` | `Date` | Display as human-readable date |
| `deadline` | `Date` | Display as human-readable date + time |
| `finalStatus` | `null \| 'success' \| 'failure'` | Drives status badge variant |

## Status → Badge Variant Mapping

| `finalStatus` | Display Label | Badge Variant |
|---------------|---------------|---------------|
| `null` | Active | `primary` |
| `'success'` | Success | `success` |
| `'failure'` | Failed | `failure` *(new variant)* |

## Hook Return Shape: `useHeist`

New hook at `hooks/useHeist.ts`.

```ts
interface UseHeistResult {
  heist: Heist | null
  loading: boolean
  error: Error | null   // network/Firestore error (not "not found")
  notFound: boolean     // true when document does not exist
}
```

**State matrix**:

| Scenario | `loading` | `error` | `notFound` | `heist` |
|----------|-----------|---------|------------|---------|
| Fetching | `true` | `null` | `false` | `null` |
| Loaded | `false` | `null` | `false` | `Heist` |
| Not found | `false` | `null` | `true` | `null` |
| Fetch error | `false` | `Error` | `false` | `null` |

## Badge Component Extension

File: `components/Badge.tsx`

Add `failure` to the `variant` union and `variantStyles` map:

```ts
variant?: 'primary' | 'secondary' | 'success' | 'failure'
// failure → 'bg-red-100 text-red-800'
```
