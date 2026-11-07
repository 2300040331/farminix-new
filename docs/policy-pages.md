# Customer policy pages

Three dedicated public pages use the clauses supplied by Farminix:

- `/refund-policy` — Refund and Cancellation Policy, including all five supplied return, refund and cancellation clauses.
- `/privacy-policy` — Privacy Policy, including all five supplied clauses.
- `/terms-and-conditions` — Terms and Conditions, including all five supplied clauses.

`src/data/policies.ts` contains the supplied wording. No return-window duration, jurisdiction, effective date, legal requirement or refund guarantee has been invented. The return clause retains “within the specified return period” as instructed. This change publishes informational pages; it does not add automated cancellations, return approvals or payment refunds.

The footer links are actual anchors with stable URLs, supporting opening in a new tab, copying links and browser navigation. Required policy links survive empty/legacy saved footer configurations; the previous footer sanitizer no longer clears legal links. Other valid custom legal links are retained and duplicate/placeholders/unsafe URLs are omitted. Footer Management includes links to preview the three pages.

Legacy refund/cancellation URLs (`/refund-and-cancellation-policy`, `/refund-cancellation-policy`, `/cancellation-policy`) open the combined policy. `/terms` and `/terms-conditions` open Terms and Conditions. Existing storefront/server SPA routing supports direct links and reloads.

Each page uses the shared storefront header/hero/footer, readable responsive numbered clauses, a policy navigation menu, a customer-support entry point and a Share this policy button. Sharing uses the browser/native share flow when available, falls back to confirmed clipboard copying, and provides a selectable URL if sharing/copying is unavailable. Share links use the current website origin and the canonical policy path. Cancelled shares do not report success.

No backend migration or new environment setting is required. The new routes become publicly available with the frontend deployment. Tests check route aliases, supplied text, footer fallback links and actual share/copy/fallback outcomes.
