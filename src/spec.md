# Specification

## Summary
**Goal:** Let admins update a tracked order’s status via the existing backend admin methods, and clearly document the current possible status states in the Track Order UI.

**Planned changes:**
- Add an admin-only “Admin: Update Order Status” area in the Track Order section that appears only when an authenticated admin is present.
- Provide admin actions for a entered tracking code: create tracking entry (with restoration level), mark order received, add a restoration step, complete a restoration step (by index), and mark shipped.
- Refresh the displayed tracking timeline after successful admin actions without a full page reload, and prevent or show errors for non-admin attempts (e.g., Unauthorized).
- Add a short English explanation in the Track Order UI describing the supported statuses: Order Received (Pending/Complete), Restoration Process (restoration level + step list with Pending/Complete), and Shipped (Pending/Complete with shipped date when available), consistent with the timeline display.

**User-visible outcome:** Admin users can update an order’s tracking progress from the Track Order page and immediately see the updated timeline; all users can read a clear explanation of the possible tracking statuses after entering a tracking code.
