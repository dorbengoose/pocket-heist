# Spec for Create Heist Form

branch: claude/feature/create-heist-form

## Summary

Implement a form component for creating new heist documents in the Firestore heists collection using the `CreateHeistInput` interface. The form allows users to:
- Enter a heist title and description (user-provided fields from CreateHeistInput)
- Select the current user as the creator (auto-populated from auth context)
- Assign the heist to another user from the users collection by searching/selecting their codename
- View the automatically calculated 48-hour deadline (display only, not user input)
- Submit the form to create the heist and redirect to the /heists dashboard

The `createdAt` and `deadline` timestamps are generated programmatically on the client before submission using server timestamp values. The form is located at `app/(dashboard)/heists/create/page.tsx` and integrates with Firebase Firestore and user authentication.

## Functional Requirements

- Use the `CreateHeistInput` interface for form input validation and data structure
- Display form fields for title and description (user-provided inputs from CreateHeistInput)
- Pre-populate the "Created By" field with the current logged-in user's name and UID
- Display a read-only "Created At" field showing the current timestamp (will be set programmatically)
- Fetch available users from the Firestore users collection and allow selection by codename
- Calculate and display the deadline as current time + 48 hours in read-only format (will be set programmatically on submission)
- Validate required fields according to CreateHeistInput schema (title, description, assignee)
- Programmatically generate `createdAt` (using `serverTimestamp()`) and `deadline` (createdAt + 48 hours) when form is submitted
- Submit form data to create a new Heist document in Firestore with all required fields:
  - title, description (from form input)
  - createdBy (UID), createdByCodename (from auth context)
  - assignedTo (UID), assignedToCodename (from user selection)
  - createdAt (generated on submit via `serverTimestamp()`)
  - deadline (generated on submit as serverTimestamp + 48 hours)
  - finalStatus (null on creation)
- Handle form submission loading state (disable button, show loading indicator)
- Handle submission errors gracefully with user-facing error messages
- On successful submission, redirect to `/heists` page
- Ensure form is only accessible to authenticated users

## Possible Edge Cases

- User with no other users available to assign heist to (only themselves)
- Network failure during form submission
- User navigates away during form submission
- Firestore write fails (quota exceeded, permissions, etc.)
- Multiple assignees in users collection but none with codenames
- Very long titles or descriptions
- User attempts to submit with incomplete fields
- Rapid clicks on submit button (double submission)

## Acceptance Criteria

- Form component renders on `/heists/create` route and uses CreateHeistInput interface
- Form displays user-input fields: title, description
- Read-only display fields show: "Created By" (current user), "Created At" (current timestamp), "Deadline" (current time + 48 hours)
- Current user is auto-populated in the "Created By" section
- Assignee dropdown loads and displays users from the users collection by codename
- All read-only timestamp fields update in real-time as user views the form
- Form validates title, description, and assignee according to CreateHeistInput schema
- Form prevents submission with missing required fields
- Submit button shows loading state during submission
- On successful submission:
  - createdAt is generated using serverTimestamp() 
  - deadline is calculated as serverTimestamp + 48 hours
  - New Heist document is created in Firestore with correct schema matching Heist interface
  - All fields properly map CreateHeistInput to Heist document
  - User is redirected to `/heists` page
- Error messages are displayed if submission fails
- Timestamps are correctly calculated (deadline = createdAt + 48 hours)

## Open Questions

- Should the form include a preview of what the heist will look like before submission?
- Should users be able to add multiple assignees, or just one per heist?
- What should happen if the user's session expires during form submission?
- Should there be a confirmation dialog before submission?
- How should the assignee dropdown behave if there are many users (pagination, search)?
- Should drafts be auto-saved?

## Testing Guidelines

Create test file(s) in the ./tests folder for the new feature:

- Test that the form renders with all required fields
- Test that the current user is correctly populated in the "Created By" section
- Test that users from the collection are fetched and displayed in the assignee dropdown
- Test form validation (empty title, empty description, no assignee selected)
- Test that the deadline is calculated as 48 hours from now
- Test successful heist creation with valid form data
- Test error handling when Firestore write fails
- Test redirect to `/heists` after successful submission
- Test loading state during submission
- Test that double-click submit doesn't create duplicate heists
- Test with various title/description lengths
