# Specification

## Summary
**Goal:** Let admins fully read long customer messages in the Quote Forms table without expanding the table layout.

**Planned changes:**
- Update the Quote Forms table in `frontend/src/components/AdminQuoteFormsSection.tsx` to keep a short message preview in the table while adding an explicit interaction to view the full message (e.g., click action or “View full” control).
- Add a full-message view (dialog or drawer) that shows the complete `ticket.formData.message` with preserved line breaks/paragraphs and scrolling for very long text.
- Ensure the existing “Mark Complete / Mark Pending” action continues to work unchanged and is not interfered with by the new message-viewing interaction.

**User-visible outcome:** In the admin Quote Forms view, admins can open and read the entire customer message (including line breaks) for any ticket, even when the table preview is truncated.
