# Customer support

The previous Support modal and demonstration `/api/support/chat` route returned simulated agent messages. The modal now sends real support requests to the private enquiry inbox. It does not display an online-agent badge, a 24/7 staffing claim, a made-up toll-free number, or a guaranteed response/resolution time. The old demonstration chat endpoint returns 410.

## Customer flow

Customer Support is accessible from the footer and the signed-in account dialog. The modal has New request and My requests tabs, native dialog focus handling, a labelled close button, keyboard tab navigation, and an independently scrolling layout on small screens.

- Requests collect name, mobile number, optional email, issue category, and a 5–5,000 character message. Signed-in customers can attach an order belonging to their own account; other references can be written in the message.
- Guests can report issues without creating an account. They receive a saved reference and can follow up by phone, email or WhatsApp. Guest requests are not claimed by an account based on matching contact details.
- A reference/success state appears only after the server confirms the actual saved record. Errors retain the message. An unchanged retry reuses the request ID and cannot create duplicate requests; changing the payload creates a different request ID. Servers reject attempts to reuse a saved reference for different content or ownership.
- Signed-in customers can read their own saved requests, statuses (Received / In progress / Resolved), and actual staff replies in My requests. History supports pages of 25, Refresh updates, and refresh when returning to the browser window. Missing/expired logins prompt real reauthentication. Replies are shown only after an administrator saves them; there are no generated conversational responses.

Quick contact buttons use the configured business contacts. Phone/email come from General Settings (the About-page contact fields), falling back to the configured Manufacturer contact. WhatsApp uses the footer's configured business number. Invalid/unconfigured channels are hidden. Call links are real `tel:` links; email opens a `mailto:` draft; WhatsApp opens a prepared message/reference for the customer to send. These actions do not silently send messages or claim that a member of staff is present. Listed hours come from the configured Manufacturer support hours, with no invented availability.

## Admin flow

Admin → Support & Enquiries contains support requests and existing enquiries. Each row identifies the source, contact details, category, message, reference and optional linked order. Administrators can update status, keep private staff notes, and save a Reply to customer for account-linked requests. The reply becomes visible in that customer's My requests tab. Guest submissions have direct call/email links for follow-up. No external email, SMS or push notification is sent automatically, and staff must monitor the inbox and actually respond.

The existing Trash and restore flow remains available on both backends. Moving an account-linked request to Trash removes it from that customer's active history; restoring it returns it. Legacy guest enquiries remain visible to administrators; legacy standalone-server ENQ references remain manageable.

## API, storage and privacy

`/api/site-config/queries` is shared by the public enquiry page and Support modal:

- Public POST validates and persists the message; source `support` identifies issues submitted from the modal.
- A valid customer cookie associates the request with the server-authenticated account. Body-supplied customer IDs/status/replies/notes are ignored. A linked order must belong to that account. An expired session fails instead of silently submitting an untracked guest request.
- GET `?mine=1&page=0` requires a customer session and returns only that account's requests. Customer DTOs explicitly exclude private staff notes, contact data, and other users' requests. Admin-only GET, PATCH and DELETE retain signed-admin-cookie authorization. History query parameters cannot select a different account.
- Admin PATCH supports status, private notes and an optional public reply; changed replies receive a server timestamp. Requests and reply reads are private/no-store. Same-origin checks reject browser requests from unrelated origins.
- The enquiry-page enabled setting controls new submissions; if disabled, the API explains that support requests are unavailable and points customers to the listed contact options.

Vercel uses the existing Redis connection, atomic request/index writes, and a per-customer request index. PostgreSQL reuses `customer_enquiries` with additional source, customer ID, order ID, public reply and reply timestamp columns, plus an account/date index. Its existing build/startup schema workflow applies the idempotent migration. No new hosting secrets or external messaging provider are required. Deploy frontend and backend together. Durable standalone-server requests require the existing PostgreSQL configuration; the development fallback remains in memory.

Tests cover guest reporting, signed-in order ownership, private history, actual staff replies, note privacy, duplicate-safe retries, pagination, Trash/restore, invalid or expired sessions, disabled requests and storage failures. Contact and UI tests check real links, confirmation handling, and removal of fabricated support claims. Tests use isolated fixtures and never contact the live support team.
