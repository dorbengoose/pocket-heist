# Spec for Heists Data Access Hook

branch: claude/feature/use-heists-hook

## Summary

Implement a custom React hook `useHeists()` that provides real-time access to Firestore heist documents with filtering based on the current user and heist status. The hook accepts a filter parameter to query three different heist categories:
- **'active'**: Heists assigned to the current user with a deadline that has not yet passed
- **'assigned'**: Heists created by the current user with a deadline that has not yet passed
- **'expired'**: All heists where the deadline has passed and `finalStatus` is not null (regardless of user)

The hook returns an array of `Heist` documents and can be used throughout the application to display heist data based on context. The heists page (`app/(dashboard)/heists/page.tsx`) will display heist titles grouped by these three categories.

## Functional Requirements

- Create a custom hook `useHeists(filterType)` that accepts a filter parameter: `'active'` | `'assigned'` | `'expired'`
- Hook subscribes to real-time Firestore data via `onSnapshot` listener
- For **'active'** filter:
  - Query heists collection where `assignedTo` equals current user's UID
  - Filter results where `deadline` is greater than current time (deadline has not passed)
  - Return all matching heist documents
- For **'assigned'** filter:
  - Query heists collection where `createdBy` equals current user's UID
  - Filter results where `deadline` is greater than current time (deadline has not passed)
  - Return all matching heist documents
- For **'expired'** filter:
  - Query heists collection where `deadline` is less than or equal to current time (deadline has passed)
  - Filter results where `finalStatus` is not null
  - Return all matching heist documents (ignore user context)
- Hook maintains loading state while data is being fetched
- Hook maintains error state for handling Firestore errors
- Hook cleans up the Firestore listener on component unmount via `useEffect` cleanup function
- Return type: `{ heists: Heist[], loading: boolean, error: Error | null }`
- Hook is usable in any client component under the dashboard layout (auth is already verified)

## Possible Edge Cases

- User has no active heists (empty array returned)
- User has no assigned heists (empty array returned)
- No expired heists exist in the collection (empty array returned)
- Firestore query fails (error state populated)
- Deadline is exactly at current time (boundary condition: should be treated as expired)
- Component unmounts while data fetch is in progress (listener should be cleaned up)
- Multiple instances of `useHeists()` with same filter type (each maintains independent subscription)
- Heist document is missing `deadline` field (should be handled gracefully)
- Heist document is missing `finalStatus` field in expired query (should still be returned if deadline passed)

## Acceptance Criteria

- `useHeists()` hook is created and exported from a new hooks file (e.g., `hooks/useHeists.ts`)
- Hook accepts a filter parameter typed as a string literal union: `'active' | 'assigned' | 'expired'`
- Hook returns an object with `{ heists: Heist[], loading: boolean, error: Error | null }`
- For 'active' filter: correctly queries and filters heists assigned to current user with future deadlines
- For 'assigned' filter: correctly queries and filters heists created by current user with future deadlines
- For 'expired' filter: correctly returns all heists with past deadlines and non-null finalStatus
- Real-time listener is established via `onSnapshot()` and updates component when data changes
- Loading state is true while initial fetch is in progress
- Error state captures and returns Firestore errors
- Listener is unsubscribed on component unmount
- Hook works correctly when used multiple times with different filter types
- Heists page displays titles from all three filter categories correctly

## Open Questions

- Should the hook support multiple filter types simultaneously, or just one at a time?
- Should the hook cache results locally, or always maintain a live subscription?
- How should the hook handle network disconnections?
- Should there be a `refetch` function returned by the hook?
- Should the hook support sorting the results (e.g., by deadline or createdAt)?
- How should heists with missing `deadline` or `finalStatus` fields be handled—skip them or include them?

## Testing Guidelines

Create test file(s) in the ./tests folder for the new feature:

- Test that hook renders and subscribes to Firestore
- Test that 'active' filter returns only heists assigned to current user with future deadlines
- Test that 'assigned' filter returns only heists created by current user with future deadlines
- Test that 'expired' filter returns only heists with past deadlines and non-null finalStatus
- Test that hook returns empty array when no heists match the filter
- Test that hook returns loading=true while fetching and loading=false when done
- Test that hook captures and returns Firestore errors
- Test that listener is cleaned up on component unmount
- Test that hook handles real-time updates (data changes while component is mounted)
- Test that multiple instances of the hook with different filters work independently
- Test boundary conditions (deadline exactly at current time, null/missing fields)
- Test with `useHeists` hook integrated into the heists page to verify titles display correctly
