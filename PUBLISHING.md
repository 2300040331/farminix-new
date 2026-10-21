# Publishing admin changes

Admin edits are browser drafts. The Save Changes button in the persistent admin header publishes the whole draft to shared Redis storage through /api/site-config. Storefronts fetch it on load, focus, and every 15 seconds. Publication errors preserve the draft and do not display success.

Before deploying to the existing Vercel project:

1. Connect an Upstash Redis database through Vercel and enable the integration for Production. The API accepts KV_REST_API_URL / KV_REST_API_TOKEN or UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN.
2. Set ADMIN_PASSWORD to the intended admin password and ADMIN_SESSION_SECRET to a random server secret (at least 32 bytes). These must be server environment variables, never VITE_ variables.
3. Deploy the project, then sign out and sign in at https://farminix.in/admin to obtain a server session.
4. On the laptop holding existing edits, review the retained draft, then click Save Changes. Test the changed content in a separate browser or device. Existing drafts are never automatically uploaded.

Images uploaded as data URLs are included in the document. Vercel request size limits apply to the entire document; use hosted image URLs for larger catalogs.

Customer orders and users are excluded from the public configuration document. Website checkout now stores orders privately through `/api/site-config/orders` using the same Redis connection. Only signed-in administrators can list orders or change fulfillment status. The dashboard loads all saved website orders and published stock on sign-in, focus, and every 15 seconds. It includes online payments and COD; customer counts represent unique ordering phone numbers, not registered accounts.

Order creation validates prices, coupons, delivery fees, payment details, and available stock on the server. Paid orders require a valid Razorpay signature and a matching payment amount from Razorpay. Configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the deployment environment for online payments. Confirmed orders and stock deductions are stored in one atomic Redis operation. Retries reuse a request/payment reference to avoid duplicate orders or deductions. Failed saves retain the cart and an already-paid checkout can retry confirmation without charging again.

Inventory revisions prevent an old admin draft from restoring stock sold by online orders. If publishing reports a stock conflict, retain any edits you need, discard the stale draft, and reapply them to the latest catalog. An order save failure after payment still requires customer support if stock or prices changed before confirmation; this implementation does not reserve stock during Razorpay checkout or automatically refund payments.

Existing browser-only orders cannot be recovered from other devices automatically. Existing product data and unpublished drafts remain intact. The new dashboard reports orders confirmed through shared checkout after this update; it does not invent or import sample orders. Payment secrets belong in the server payment environment variables and are stripped from the published document.

Concurrent administrators publish complete snapshots; coordinate edits to avoid overwriting another administrator's changes.
