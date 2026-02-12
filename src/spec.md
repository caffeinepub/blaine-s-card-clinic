# Specification

## Summary
**Goal:** Allow admins to capture and view customer details and cleaning type when creating and managing orders.

**Planned changes:**
- Extend the backend Order model to store customer name, customer email, number of cards, and cleaning type (Super Potion / Hyper Potion / Max Potion) per tracking number.
- Update backend admin order-creation to accept and persist the new customer fields with the initial status "Processing", enforcing admin-only access.
- Update backend admin order listing to include the new customer fields in returned order records (admin-only access remains).
- Add a backend state migration to preserve existing stored orders by backfilling new fields with safe defaults during upgrade.
- Update the Admin Panel "Create New Order" form to collect name, email, number of cards, and cleaning type (dropdown) in addition to tracking number, with basic validation and form reset on success.
- Update frontend admin React Query hooks to send/receive the new fields for order creation and listing.
- Update the Admin Panel "All Orders" table to display name, email, cards, and cleaning type alongside tracking number and status, remaining readable on smaller screens.

**User-visible outcome:** Admins can create orders with customer name/email, card count, and cleaning type, and can see those details in the admin orders list.
