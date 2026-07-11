# Spec for Authentication Forms

branch: claude/feature/authentication-forms
figma_component (if used): N/A

## Summary

Add a reusable `AuthForm` component used by both the `/login` and `/signup` pages. The form includes an email field, a password field with a show/hide toggle icon, and a context-aware submit button. On submission the form logs the entered values to the browser console (placeholder for real auth logic). Each page includes a navigation link to the other, so users can easily switch between logging in and signing up.

# Functional Requirements

Email field: Controlled text input, accepts any string, labelled "Email"
Password field: Controlled password input that masks characters by default, labelled "Password"
Password visibility toggle: Clickable icon (Eye / EyeOff from lucide-react) that toggles the password field between type="password" and type="text"
Submit button: Full-width button whose label reads "Log In" on /login and "Sign Up" on /signup
[FR-AUTH-01] Authentication on submit (supersedes original console.log placeholder): In signup mode, the system MUST create an account via Firebase Auth's createUserWithEmailAndPassword. In login mode, the system MUST authenticate via signInWithEmailAndPassword.
[FR-AUTH-02] Codename assignment (new): On successful signup, the system MUST generate a unique codename (generateCodename()) and set it as the user's displayName via updateProfile.
[FR-AUTH-03] User profile document (new): On successful signup, the system MUST create a document in the users collection in Firestore, keyed by the user's UID, containing {codename, id}.
[FR-AUTH-04] Error mapping (new): The system MUST map known Firebase Auth error codes (auth/invalid-email, auth/user-not-found, auth/wrong-password, auth/email-already-in-use, auth/weak-password, auth/network-request-failed) to human-readable messages. Any other error MUST show a generic fallback message.
Form reset: Clear both fields after the form is submitted
Form switching link: Each page shows a plain text link to the other page — /login shows "Don't have an account? Sign up", /signup shows "Already have an account? Log in"
Reusable component: A single AuthForm component accepts a mode prop ("login" | "signup") to control button label and is used by both pages


Console logging on submit: console.log the submitted email and password
SUPERSEDED by FR-AUTH-01 through FR-AUTH-04 above — real authentication
was implemented after this spec was originally written and was never
back-documented. See reconciliation note below.

Reconciliation Note (added retroactively)

This spec originally described a console.log placeholder for
authentication. The actual implementation in AuthForm.tsx has long
since replaced that placeholder with real Firebase Auth + Firestore
profile creation. FR-AUTH-01 through FR-AUTH-04 above document that real
behavior so this spec is no longer a stale contract. No new behavior is
being requested here — this is a documentation catch-up before the
Article VI hooks-migration change spec is applied.

Open Questions — resolved


Should the form switching link be a Next.js <Link> component or a
plain <a> tag? Resolved by evidence: the code uses next/link.*Reusable component**: A single `AuthForm` component accepts a `mode` prop (`"login"` | `"signup"`) to control button label and is used by both pages

## Figma Design Reference (only if referenced)

N/A — no Figma file provided. Style with existing Tailwind utility classes consistent with the rest of the project.

## Possible Edge Cases

- Form submitted with one or both fields empty
- Whitespace-only values entered in either field
- Password visibility toggled on, then form is submitted — values should still be logged and cleared
- User clicks the toggle icon rapidly multiple times
- Very long email or password strings (layout should not break)
- User navigates away mid-entry and returns (fields reset, not preserved)

## Acceptance Criteria

- [ ] `AuthForm` component accepts a `mode` prop of `"login"` or `"signup"`
- [ ] Email input is rendered with a visible label and correct `type="email"` or `type="text"` attribute
- [ ] Password input renders masked by default (`type="password"`)
- [ ] Password visibility toggle icon is visible and accessible (keyboard-clickable)
- [ ] Clicking the toggle switches password field between masked and plain text
- [ ] Submitting the form calls `console.log` with the entered email and password values
- [ ] Default form submission (page reload) is prevented
- [ ] Both fields are cleared after submission
- [ ] Submit button reads "Log In" when `mode="login"` and "Sign Up" when `mode="signup"`
- [ ] `/login` page renders `<AuthForm mode="login" />` and includes a link to `/signup`
- [ ] `/signup` page renders `<AuthForm mode="signup" />` and includes a link to `/login`
- [ ] Layout is responsive and visually consistent on mobile, tablet, and desktop

# Open Questions

- Should empty-field submission be silently ignored, or should inline validation messages be shown?
- Is there any minimum password length to enforce client-side at this stage?
- Should the form switching link be a Next.js `<Link>` component or a plain `<a>` tag?
- Should the password visibility state reset when the form resets after submit?

## Testing Guidelines

Create a test file in `./tests` for the `AuthForm` component, covering the following without going too heavy:

- Renders email input, password input, and submit button
- Submit button label matches the `mode` prop ("Log In" vs "Sign Up")
- Password field is masked by default
- Clicking the toggle changes the password field type to `text` and back to `password`
- Submitting the form calls `console.log` with the correct email and password values
- Both fields are empty after submission
- Form switching link points to the correct route for each mode
