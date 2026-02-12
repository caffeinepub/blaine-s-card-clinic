# Specification

## Summary
**Goal:** Allow multiple Internet Identity principals to be granted admin access and manage that allowlist from the admin panel.

**Planned changes:**
- Update backend admin access control to support an allowlist of multiple admin principals (instead of implicitly treating the first authenticated principal as the only admin).
- Add backend admin-management endpoints to (1) list current admin principals and (2) add a new admin principal, restricted to existing admins.
- Update the admin panel UI to display the current admin principal list and provide a simple form to add another principal, with clear success/error handling.
- Improve admin access-gate messaging to clearly differentiate “not logged in” vs “logged in but not an accepted admin,” using English user-facing text.

**User-visible outcome:** Admins can view and add accepted Internet Identity principals for admin access; non-admin users see clear guidance depending on whether they are unauthenticated or simply not authorized.
