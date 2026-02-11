# Specification

## Summary
**Goal:** Automatically bootstrap the first authenticated Internet Identity as an admin so the current user can access the admin dashboard without manually adding a principal.

**Planned changes:**
- Update the Motoko backend to grant the caller admin permissions on first authentication under a safe bootstrap rule (e.g., only when no admin has been set yet / only once).
- Ensure existing admin authorization checks remain enforced for non-admin callers across admin-gated endpoints.

**User-visible outcome:** After logging in with Internet Identity, the user can navigate to the admin section without seeing “Access Denied”, and admin-only actions (like listing orders or updating order status) work for that bootstrapped identity.
