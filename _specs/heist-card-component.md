# Spec for Heist Card Component

branch: claude/feature/heist-card-component
figma_component (if used): N/A - Design extracted from Vercel reference

## Summary

Create a reusable HeistCard component that displays active and assigned heists on the /heists page in a responsive 3-column grid layout. Each card shows heist details with a clickable title linking to the individual heist details page. Additionally, create a HeistCardSkeleton component for displaying a loading state while heist data is being fetched.

## Functional Requirements

- **HeistCard Component**
  - Display heist information (title, description, difficulty/risk level, target reward, status)
  - Make heist titles clickable links to `/heists/:id` detail page
  - Show only active and assigned heists (filter out expired heists)
  - Support responsive design that works across mobile, tablet, and desktop
  - Display appropriate visual indicators for heist status/difficulty

- **HeistCardSkeleton Component**
  - Render in the same layout and dimensions as HeistCard
  - Show placeholder shimmer/skeleton state during data loading
  - Maintain grid alignment with actual cards

- **Grid Layout**
  - Display cards in a 3-column grid on desktop
  - Responsive behavior for smaller breakpoints (2 columns on tablet, 1 column on mobile)
  - Consistent spacing and alignment between cards
  - Proper gap/gutter spacing between grid items

- **Data Filtering**
  - Filter heists to show only active and assigned heists
  - Exclude expired heists from display
  - Maintain data from existing heist model/API

## Design Reference

Design reference could not be retrieved from Vercel MCP without a specific design link. Please consult Vercel's card component patterns or design system directly for visual specifications on:
- Card dimensions and padding
- Typography (font family, sizes, weights)
- Color tokens and semantic usage
- Border radius and shadows
- Spacing and alignment rules

## Possible Edge Cases

- Empty state: No active/assigned heists to display
- Loading state: Multiple cards rendering with skeleton loaders
- Long heist titles: Text truncation and overflow handling
- Card hover states: Visual feedback for interactive cards
- Different screen sizes: Responsive grid behavior
- Data loading errors: Handle API failures gracefully

## Acceptance Criteria

- [x] HeistCard component renders heist data correctly
- [x] Card title is a clickable link to `/heists/:id`
- [x] Only active and assigned heists are displayed (expired heists filtered)
- [x] HeistCardSkeleton component displays while loading
- [x] 3-column grid layout displays on desktop
- [x] Grid responds properly on tablet (2 columns) and mobile (1 column)
- [x] Cards have consistent spacing and alignment
- [x] Visual indicators for heist status are clear
- [x] No content added to detail page yet (placeholder only)

## Open Questions

- What heist properties should be displayed on the card? (e.g., title, description, difficulty, reward, status, assigned date) all 
- Should cards have action buttons (accept, view details)? yes
- What defines "active" vs "assigned" status in the data model? assigned if created by user, active if creative for current user.
- Should there be pagination for large lists of heists? yes
- What visual style/design system should be used (existing Tailwind tokens)? Find the most suitable from vercel.

## Testing Guidelines

Create test files in the ./tests folder for the new components:

- **HeistCard.test.tsx**
  - Renders heist data correctly
  - Title is a clickable link to the correct route
  - Only displays active/assigned heists (filtering works)
  - Handles missing or incomplete data gracefully
  - Renders correctly on different screen sizes

- **HeistCardSkeleton.test.tsx**
  - Renders skeleton loaders in correct layout
  - Matches dimensions of actual HeistCard
  - Multiple skeletons display in grid format

- **HeistGrid integration**
  - Cards display in 3-column grid on desktop
  - Grid is responsive to screen size changes
  - Empty state displays appropriately when no heists available
  - Loading state shows skeletons while fetching data
