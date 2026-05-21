# Spec for Firebase Signup with Generated Codename

branch: claude/feature/firebase-signup-codename

## Summary

Integrate Firebase Authentication into the signup form at `app/(public)/signup/page.tsx`. Upon successful signup, automatically generate a random codename for the user by combining words from three distinct word sets in PascalCase, set it as the user's `displayName` in Firebase Auth, and create a corresponding user profile document in the Firestore `users` collection containing the codename and user ID (but not email).

## Functional Requirements

- Hook the signup form to Firebase Authentication using `createUserWithEmailAndPassword()`
- Generate a random codename by selecting one word from each of three word sets and combining them in PascalCase format (e.g., "SilentBlueFox", "QuietRedPanda")
- Set the generated codename as the user's `displayName` using `updateProfile()`
- Create a Firestore document in the `users` collection with the following structure:
  - Document ID: the user's Firebase UID
  - Fields: `codename` (string) and `id` (string, same as UID)
  - Do NOT store email in the user profile document
- Display appropriate error messages if signup fails (email already in use, weak password, network error, etc.)
- Handle loading state while signup is in progress
- Clear form fields on successful signup (or redirect to login/dashboard)
- Only use Firebase Web SDK (modular SDK from `firebase/auth` and `firebase/firestore`)

## Possible Edge Cases

- Email already registered with Firebase (should display specific error)
- Password does not meet Firebase requirements (minimum 6 characters, display specific error)
- Network error during signup or profile creation (should display error and allow retry)
- Profile creation succeeds but Firestore document creation fails (user is created in Auth but no profile—needs recovery)
- User navigates away before signup completes (request may still complete)
- Rapid successive form submissions (button should be disabled during submission)

## Acceptance Criteria

- AuthForm component in signup mode accepts email and password input
- Upon submit, `createUserWithEmailAndPassword()` is called with the provided credentials
- On successful auth creation, a random codename is generated and set as `displayName`
- A document is created in Firestore `users` collection with structure: `{ codename, id }`
- Error messages display appropriately for common failure cases
- Submit button is disabled during the signup request
- Form clears or user is redirected after successful signup
- No email data is stored in the Firestore user profile

## Open Questions

- What should happen after successful signup? Redirect to dashboard, redirect to login, or clear form and show confirmation message?
- Should the generated codename be displayed to the user immediately after signup (e.g., in a confirmation message)?
- How many words should be in each of the three word sets for codename generation?

## Testing Guidelines

Create test file(s) in the ./tests folder for the new feature:

- Test that a valid email and password successfully creates a user in Firebase Auth
- Test that a codename is generated in the expected format (PascalCase with three word combinations)
- Test that the codename is set as the user's `displayName`
- Test that a Firestore document is created in the `users` collection with correct structure (no email field)
- Test that duplicate email signup fails with appropriate error message
- Test that weak password fails with appropriate error message
- Test that the submit button is disabled during the signup request
- Test that form validation or error handling works for network errors
