# Customer accounts and order history

Customers must sign in with their email/password before checkout or create a new account in the account dialog. An unknown email returns `ACCOUNT_NOT_FOUND` and the dialog shows a create-account prompt. The cart is retained and checkout resumes after successful login/registration.

The navbar account button, mobile navigation, footer, order confirmation, and former Track Order entry lead to `/orders`. History shows the account's saved item snapshots, quantities, amount breakdown, payment method, delivery address, and current fulfillment status. It supports older-order pagination, manual status refresh, and refresh when the window regains focus. Empty, loading, expired-session, and failure states are handled explicitly.

## Server authorization

- `GET/POST/PUT/DELETE /api/customer-auth` restores a session, signs in or registers, saves delivery addresses, or signs out.
- Passwords use salted scrypt hashes. Existing bcrypt accounts on the SQL backend can still sign in.
- A random opaque token is issued in a seven-day HttpOnly, SameSite=Lax cookie (Secure in production); only its SHA-256 hash is stored server-side. Logout revokes that session. Customer identities supplied in request bodies, localStorage, or history query parameters are never trusted.
- Credential attempts have a per-IP/email fixed-window limit of 20 attempts per ten minutes. Vercel uses Redis atomics; the standalone server limits attempts in process.
- `POST /api/site-config/orders` and `POST /api/payment/create-order` require a valid customer session. Provider payment order IDs are bound to their authenticated owner. Every confirmed order is linked to the account ID, and cross-account order retries are rejected.
- `GET /api/customer-orders?cursor=0` returns at most 20 of that account's orders, newest first, with a `nextCursor`. Reads are private/no-store. Admin order listing and fulfillment updates retain their existing admin authorization.
- The old demonstration OTP endpoints on the standalone backend return 410; the storefront no longer accepts simulated OTPs or treats localStorage profiles as authentication.

## Storage and deployment

Vercel uses the existing `KV_REST_API_URL` / `KV_REST_API_TOKEN` or `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`. Private account, email/phone lookup, session, customer-order index, and payment-owner keys are separate from the public site configuration. New orders and their customer history index are written in one Redis script.

The standalone server uses the existing PostgreSQL users/orders tables, adds saved addresses, customer sessions and payment-owner records, and indexes orders by account/date. Its build copies `server/schema.sql` into `server/dist/schema.sql`, which startup applies idempotently. A configured, working PostgreSQL database is required for durable standalone-server accounts/history; the existing offline in-memory fallback remains development-only and resets after restart. Existing guest orders without an authenticated account ID remain visible to admins; they are not automatically assigned based on an email or phone number.

No external signup provider or new environment secret is required. These changes need the normal frontend/backend deployment to become live.

## Verification

Run `npm run build`, `npm --prefix server run build`, `node_modules/.bin/tsc -p api/tsconfig.json --noEmit`, and `node --test tests/*.test.mjs`. Account tests use isolated Redis fixtures; SQL integration tests exercise Express middleware/routes in-process without binding a network port. Component tests render guest/account/order states with Vite SSR. No real payment is made by these tests.

## Admin Users directory

Admin → Users reads registered accounts from private account storage, including users who have never ordered. The screen shows total registered users, users with orders, and the number of orders associated with registered accounts. Search by name, email, mobile number or account ID; directory results are paginated in groups of 25 and summary totals remain global while searching.

Select **View user** to see account/contact information, registration date (when recorded), saved delivery addresses, reward points, wallet balance, total orders/value, and the last-order date. Expand an order to see its stored product/quantity/pack/price snapshots, totals/discounts/fees, payment method, delivery address and latest status. Histories are loaded 20 orders at a time, without the general Orders screen's 500-record SQL limit. Refresh reloads counts and the selected account's history; returning to the window also refreshes data.

`GET /api/site-config/users` lists registered customers and aggregate counts. `?customerId=<id>&cursor=0` returns one user's profile and history. Both backend implementations require the existing signed admin cookie; a customer session cannot access this endpoint. Private account records remain outside the publicly published site configuration, and the response explicitly omits password hashes and session tokens. The endpoint is under `/api/site-config` to work with the existing scoped Vercel admin cookie. Histories are joined by authenticated account ID, preserving separation when delivery contact numbers overlap. Historical guest orders remain in the admin Orders screen and are not silently assigned to a registered user.

Redis directory totals read all registered-account/order records, then paginate the response; PostgreSQL uses a customer filter and grouped order aggregates. No new database tables or environment variables are required for this admin view. Account registration now records a timestamp in Redis; records made before that addition show an unavailable date rather than an invented date.
