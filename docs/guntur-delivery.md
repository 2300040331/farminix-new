# Local and outstation delivery pricing

## Checkout and admin behavior

Orders are accepted within and outside Guntur. Express Delivery remains removed from Secure Checkout; Scheduled Delivery remains. Admin → Payments & Delivery → Delivery area & charges offers two pricing methods:

- **Fixed amount per delivery:** one configurable positive rupee amount for each paid delivery, independent of distance.
- **Based on kilometres:** a configurable positive rate per kilometre. Outstation orders use the full straight-line distance from the warehouse. Within Guntur, only distance beyond the first 10 km is charged.

Guntur destinations within 10 km of the warehouse remain free in either mode. A nearby destination outside Guntur is treated as an outstation order, even if it lies within the 10 km radius. Admin copy and checkout show which rule applies. For example, a fixed ₹150 fee gives a ₹150 delivery charge for a paid order; a 28.6 km outstation delivery at ₹10/km costs approximately ₹286. A 12.5 km Guntur delivery at ₹10/km costs ₹25.

Save Changes publishes the pricing method, amount/rate, and warehouse pin to checkout and both backends. Legacy settings without a pricing method keep per-kilometre pricing and their existing rate. Changing the method preserves the inactive method's stored amount for later use. Unset pricing blocks paid deliveries instead of guessing a fee or silently granting free delivery. Fixed and per-kilometre charges must be positive; local free deliveries still work when the chosen charge is unset.

The starting warehouse landmark is Arogyamatha Church, Amaravati Road, Gorantla, Guntur (16.346142, 80.438065), beside the saved warehouse address. This is the public church landmark pin, not a separately verified Shop No. 2 doorway. The admin can adjust the dispatch pin within Guntur when a more precise warehouse pin is available.

Customers add a destination pin using GPS, coordinates, or a full Google Maps/OpenStreetMap URL, review the marker, and explicitly confirm that it belongs to their delivery address. City/state and a valid six-digit pincode are still required. The form accepts pins outside Guntur. Short URLs are opened by customers in their browser before copying a full link; the server never fetches arbitrary map URLs. GPS is optional and low-accuracy GPS results are rejected. Delivery staff can open the stored pin from admin order details.

## Rules and enforcement

`server/delivery-policy.ts` contains the shared rules used by the frontend, order submission, and online-payment creation. The Guntur polygon now identifies the local free-delivery benefit; it does not block outstation orders. A typed city name cannot change which geographic pricing rule applies.

Distances use the Haversine formula with mean Earth radius 6371.0088 km. They are straight-line distances, not road-route distances. Kilometre fees use the unrounded chargeable distance and round up to the next paise; partial kilometres are proportional. Fixed fees are rounded up to the next paise. UI distances are rounded only for display.

Old cart delivery fees and spend thresholds do not override either pricing method. Coupons discount eligible products, not shipping. Handling/packaging remains a separate existing fee. Checkout displays the current fixed charge or chargeable kilometres/rate, and blocks submission when a pin, address field, or selected charge is missing.

Both `POST /api/site-config/orders` and `POST /api/payment/create-order` recalculate charges from the current published settings. Client-supplied fee/distance overrides are ignored. Changing a fixed amount, rate or pricing method invalidates stale checkout totals before a new order/payment can be created. Actual provider payment amounts must cover the final total. Selected pins persist in account addresses and order snapshots. The customer-declared pin is authoritative; the feature does not prove physical presence or geocode house numbers against third-party address records.

## Map provenance and operation

No new geocoding API key is needed. Checkout's delivery checks do not call a public geocoder; they use the saved pin and a local polygon, so geocoder failures cannot change delivery prices. Only the optional map preview loads OpenStreetMap tiles/embedding.

- [Google Maps church lookup](https://www.google.com/maps/search/?api=1&query=Arogyamatha+Church+Gorantla+Guntur), retrieved 2026-11-07. The search result identifies Arogyamatha Church at 16.346142, 80.438065 (place identifier `0x3a358ac1537bfb11:0xbd911bf8785ecf4a`).
- [Guntur municipal boundary, OpenStreetMap relation 20783721](https://www.openstreetmap.org/relation/20783721), retrieved 2026-11-07 using the existing Nominatim provider's public lookup endpoint with `polygon_geojson=1&polygon_threshold=0.00005`. The polygon is stored in `server/guntur-boundary.ts`, retaining holes and the supplied ring coordinates. It is the city/local-authority boundary, not Guntur district or an arbitrary bounding box.
- Map geometry © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), available under [Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/). The geometry is distributed with this source and visible attribution appears in the delivery admin and map preview. Recheck the source when city limits change.
- The public Nominatim service has a [usage policy](https://operations.osmfoundation.org/policies/nominatim/): maximum one request per second across an application, identifying User-Agent, attribution, and caching. Setup used only a few sequential public-place lookups, with no customer names, phones, or private address queries. No runtime geocoder is added by this feature.

## Verification

Tests cover free local delivery at exactly 10 km, proportional local/outstation kilometre fees, fixed fees, pricing method/amount changes, legacy settings, invalid or unset charges, missing coordinates, and map-link parsing. API tests exercise real order/payment handlers for outside-Guntur destinations in both pricing modes and reject stale or manipulated totals. Render checks cover the admin selector/amount fields and checkout fixed/kilometre summaries. Existing authentication, history, admin, and inventory tests remain in the suite. No real payment or customer order is submitted by these tests.
