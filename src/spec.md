# Specification

## Summary
**Goal:** Hide the admin panel behind an “Admin” quick link + password prompt, and ensure submitted quote requests are visible inside the admin UI.

**Planned changes:**
- Do not render the admin panel section on initial load; add an “Admin” unlock flow that shows a password modal and only reveals the admin panel after entering the exact password `PonytaPower17!`.
- Add an “Admin” quick link to the footer Quick Links list that triggers the same unlock/scroll behavior as the existing header Admin control.
- In the unlocked admin panel, add/ensure a “Quotes” (quote requests) view that lists submitted quote/contact form tickets and shows an empty state when none exist.
- Ensure the backend endpoint used to list quote request tickets is admin-protected (rejects non-admin callers).

**User-visible outcome:** Visitors won’t see the admin panel unless they click “Admin” and enter the correct password; admins can access the admin section from both header and footer, and can view submitted quote requests in the admin UI.
