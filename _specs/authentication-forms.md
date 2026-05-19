# Spec for Authentication Forms

branch: claude/feature/authentication-forms

## Summary

Add reusable authentication forms to the `/login` and `/signup` pages. Each form will include email and password input fields, a password visibility toggle icon, and a form-specific submit button (Login/Sign Up). On submission, forms will log user input to the console for now. Users should be able to easily switch between login and signup modes.

## Functional Requirements

- **Email Field**: Text input for user email address
- **Password Field**: Password input that hides characters by default
- **Password Visibility Toggle**: Icon/button to show/hide password text
- **Submit Button**: Form submission button with contextual label ("Log In" for login, "Sign Up" for signup)
- **Console Logging**: On form submission, log email and password to the browser console (temporary, for development)
- **Form Switching**: Users can navigate between `/login` and `/signup` pages to use different forms
- **Form Reset**: Form fields clear after successful submission
- **Single Component**: Create a reusable form component that handles both login and signup modes

## Possible Edge Cases

- User submits form with empty email or password fields
- User toggles password visibility multiple times
- Form submitted with password visibility toggle active
- User navigates away and back to form (state preservation)
- Very long email addresses or passwords

## Acceptance Criteria

- [ ] Form component accepts a `mode` prop ("login" or "signup") to determine submit button text
- [ ] Email and password input fields render correctly
- [ ] Password visibility toggle icon displays and functions properly
- [ ] Clicking submit button triggers form validation and console logging
- [ ] Console output includes email and password values on submit
- [ ] Form fields clear after submission
- [ ] Both `/login` and `/signup` pages render the form component with correct mode
- [ ] Form is styled consistently and responsive on mobile/tablet/desktop

## Open Questions

- Should client-side email validation occur before submission?
- What visual feedback should indicate successful form submission (besides console logging)?
- Should password visibility state persist if user navigates away and returns?
- Should there be error messages displayed on the page, or just console logging for now?
- What icon library should be used for the password toggle (lucide-react is already available)?

## Testing Guidelines

Create test file(s) in the `./tests` folder for the authentication form component:

- Form renders with correct label and button text based on mode (login vs signup)
- Email and password inputs accept and store user input
- Password visibility toggle switches between showing/hiding password text
- Form submission logs correct values to console
- Form fields clear after submission
- Form maintains state while interacting with inputs
