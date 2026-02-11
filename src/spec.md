# Specification

## Summary
**Goal:** Remove the logo graphics from the site header and footer while keeping navigation and footer content working.

**Planned changes:**
- Update the header component to stop rendering the top logo image while preserving the site name text and desktop/mobile navigation behavior.
- Update the footer component to stop rendering the bottom logo image while preserving footer text, quick links behavior, and existing social links.
- Clean up any now-unused imports/references related to the removed logo assets to avoid console warnings/errors.

**User-visible outcome:** The site shows no logo graphic in the header or footer, while the header navigation and footer links/content continue to function normally with clean spacing on mobile and desktop.
