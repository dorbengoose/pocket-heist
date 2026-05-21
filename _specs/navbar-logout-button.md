# Spec for Navbar Logout Button

branch: claude/feature/navbar-logout-button

## Summary

Add a logout button to the Navbar component that allows authenticated users to sign out from the application. The button should only be visible when a user is logged in (determined via the `useUser()` hook). Clicking the button calls Firebase's `signOut()` and immediately signs out the user without additional navigation (redirects will be handled separately). The button should use Vercel's logout button style conventions.

## Functional Requirements

- Display a logout button in the Navbar component only when a user is authenticated
- Clicking the logout button calls Firebase's `signOut(auth)` from `firebase/auth`
- The logout action is synchronous and completes immediately
- Button is disabled during the logout process to prevent multiple clicks
- Show a brief loading state while the logout request is in progress
- Clear any UI state or error messages after successful logout
- No redirect logic in this feature — the home page's existing `AuthRedirect` component will handle navigation once the user is logged out
- Use the Navbar's existing styling and layout patterns
- Button should be positioned logically in the Navbar (e.g., top-right or end of nav)

## Possible Edge Cases

- User clicks logout multiple times rapidly (button should be disabled)
- Logout request fails due to network error (show error message, allow retry)
- User is logged out from Firebase but UI hasn't updated yet (button should respect `useUser()` hook state)
- Logout called while other async operations are in progress (Firebase will handle atomically)

## Acceptance Criteria

- Logout button is only visible when `useUser().user` is not null
- Logout button is clearly labeled and easy to find in the Navbar
- Clicking logout calls `signOut(auth)` and displays loading state
- Button is disabled during the logout request
- After successful logout, the button disappears from the UI
- Error message displays if logout fails, with option to retry
- All existing Navbar tests still pass
- New tests verify the logout button appears/disappears based on auth state

## Open Questions

- Should there be a confirmation dialog before logging out, or is a single click sufficient? (single click preferred for now)
- Should the logout button show an icon, text, or both? (Vercel style uses icon + text or icon alone)

## Testing Guidelines

Create test file(s) in the ./tests folder for the logout functionality:

- Test that logout button is hidden when user is not logged in (`useUser().user === null`)
- Test that logout button is visible when user is logged in (`useUser().user !== null`)
- Test that clicking logout calls `signOut(auth)`
- Test that logout button is disabled during the logout request
- Test that button shows loading state (e.g., "Signing out..." or spinner icon)
- Test that logout button disappears after successful logout
- Test that error message shows if logout fails
- Test that retry button/action is available after logout failure
- Verify Navbar renders correctly with and without the logout button
