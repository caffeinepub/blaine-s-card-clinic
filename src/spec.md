# Specification

## Summary
**Goal:** Ensure the site logo displays as a true square (no stretching/expanded look) in the header and footer, without overlapping or visually including navigation/tab elements.

**Planned changes:**
- Update `SiteHeader` logo container styling so the logo is constrained to a square box and preserves aspect ratio.
- Update `SiteFooter` logo container styling so the logo is constrained to a square box and preserves aspect ratio.
- Adjust header layout/spacing as needed so navigation buttons don’t overlap the logo across common mobile and desktop widths.
- Keep the logo source path unchanged: `/assets/generated/blaines-card-clinic-logo.dim_512x512.png`.

**User-visible outcome:** The logo appears as a clean, true square in both header and footer, with no stretching and no nav/tab elements overlapping or appearing inside the logo area.
