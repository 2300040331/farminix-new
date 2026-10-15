# Publishing admin changes

Admin edits are browser drafts. The Save Changes button in the persistent admin header publishes the whole draft to shared Redis storage through /api/site-config. Storefronts fetch it on load, focus, and every 15 seconds. Publication errors preserve the draft and do not display success.

Before deploying to the existing Vercel project:

1. Connect an Upstash Redis database through Vercel and enable the integration for Production. The API accepts KV_REST_API_URL / KV_REST_API_TOKEN or UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN.
2. Set ADMIN_PASSWORD to the intended admin password and ADMIN_SESSION_SECRET to a random server secret (at least 32 bytes). These must be server environment variables, never VITE_ variables.
3. Deploy the project, then sign out and sign in at https://farminix.in/admin to obtain a server session.
4. On the laptop holding existing edits, review the retained draft, then click Save Changes. Test the changed content in a separate browser or device. Existing drafts are never automatically uploaded.

Images uploaded as data URLs are included in the document. Vercel request size limits apply to the entire document; use hosted image URLs for larger catalogs.

Customer orders and users are excluded from this public configuration document. Shared order processing needs its own authenticated backend; this change publishes storefront content and settings only. Payment secrets belong in the existing server payment environment variables and are stripped from the published document.

Concurrent administrators publish complete snapshots; coordinate edits to avoid overwriting another administrator's changes.
