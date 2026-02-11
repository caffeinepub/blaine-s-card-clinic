# Specification

## Summary
**Goal:** Fix the missing logo by ensuring the uploaded logo image is served from the exact path the app already references.

**Planned changes:**
- Add/overwrite the logo file at `frontend/public/assets/generated/blaines-card-clinic-logo.dim_512x512.png` using the uploaded image asset, without modifying the image content.
- Verify the header (SiteHeader) and footer (SiteFooter) continue referencing `/assets/generated/blaines-card-clinic-logo.dim_512x512.png` and render without a broken image.

**User-visible outcome:** The logo displays correctly in both the header and footer logo squares, with no broken image icon.
