# Spec for User Auth State Hook

branch: claude/feature/user-auth-state-hook

## Summary

Implement a global auth state management solution that provides real-time access to the current user throughout the application via a `useUser()` hook. The hook returns `null` when the user is logged out and the user object when logged in. This enables any page or component to subscribe to auth state changes without requiring prop drilling or manual user object passing.

## Functional Requirements

- Create a custom hook `useUser()` that returns the current user object or `null`
- Implement a real-time listener to Firebase Authentication that updates global state whenever auth status changes
- The listener should initialize on app startup and persist throughout the app lifecycle
- Provide a `UserProvider` context wrapper to set up the auth listener at the application root
- Hook must be usable in any client component without additional setup
- Auth state updates should reflect immediately across all components using the hook
- Support server-side rendering (SSR) compatibility for Next.js app router

## Possible Edge Cases

- User logs in/out from a different browser tab (should reflect immediately via Firebase auth state)
- App initialization before Firebase auth listener is ready (should handle loading state)
- Components mounting before auth state is determined
- Multiple instances of `useUser()` should share the same auth state
- User session expires during app usage (should reflect as `null`)
- Network disconnection and reconnection during auth operations

## Acceptance Criteria

- `useUser()` hook is created and exported from a dedicated auth utilities file
- `UserProvider` context component is created and wraps the app at the root level
- Hook returns `User | null` with correct TypeScript typing
- Auth listener is established via Firebase's `onAuthStateChanged()`
- State updates are reflected in real-time across all components using the hook
- No errors occur when hook is used in multiple components simultaneously
- App renders correctly while auth state is loading

## Open Questions

- Should we include a loading state in the returned object (e.g., `useUser()` returns `{ user, loading }`) or handle loading separately?
- Should the hook include user metadata beyond the basic user object (e.g., profile data from Firestore)? no
- Error handling: Should auth errors be included in the hook return or handled separately? not for now
- Specific properties the user object should contain: email, uid, displayName

## Testing Guidelines

Create test file(s) in the ./tests folder for the new feature:

- Test that `useUser()` returns `null` when no user is logged in
- Test that `useUser()` returns the user object when a user is logged in
- Test that multiple components using `useUser()` receive the same user state
- Test that `useUser()` updates when Firebase auth state changes
- Test that the hook works in different component tree positions
- Test TypeScript type safety (user object shape, null handling)
