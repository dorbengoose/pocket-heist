# Spec for <feature-name>

branch: claude/feature/<feature-name>
figma_component (if used): <figma-component-name>

## Summary
...

# Functional Requirments
- ...

## Figma Design Reference (only if referenced)
Use the **figma-design-extractor** subagent to divide a design guide for the feature, citing
the `figma-hint` and tell it to:

1. Extract only information that is useful for implementation, such as:
   - Dimensions and layout (grid, spacing, alignment)
   - Key typography tokens (font family, size, weight)
   - Color tokens and semantic usage (primary, surface, border, error etc.)
   - Border radius, shadows, and any notable visual detail
   - Icons, buttons, links or other UI elements
2. Summarise this as 3 to 8 concise bullet points and also leave a link to the figma component for future lookups.
3. If lookup fails or the tools are not available, record a note like:
   - `"Design reference could not be retrieved. See Figma manually for details."`

Always summarise into human friendly notes.
- File: ...
- Component Name: ...
- Key visual constraints: ...

## Possible Edge Cases
- ...

## Acceptance Criteria
- ...

# Open Questions
- ...

## Testing Guidelines
Create a tesf file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases,
without going too heavy:
- ...