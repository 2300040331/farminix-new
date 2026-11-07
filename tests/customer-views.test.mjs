import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

// Render public account states with the real components and styles, without a browser/network port.
test('account prompts and order details render with actual customer data', async () => {
  const server = await createServer({ configFile: false, server: { middlewareMode: true, watch: null, hmr: false, ws: false }, plugins: [{
    name: 'customer-context-fixture', enforce: 'pre',
    resolveId(source) {
      if (source.endsWith('/context/AppContext')) return '\0customer-context-fixture';
      if (source.endsWith('/admin/context/AdminConfigContext')) return '\0customer-admin-fixture';
    },
    load(id) {
      if (id === '\0customer-context-fixture') return 'export const useApp = () => globalThis.__customerViewFixture';
      if (id === '\0customer-admin-fixture') return 'export const useAdminConfig = () => ({ publishedConfig: { checkoutPayment: { deliveryArea: globalThis.__customerDeliveryPricing || { perKmRate: 10 } }, cart: {} } })';
    },
  }] });
  const fixture = { user: null, authStatus: 'guest', isAuthOpen: true, authIntent: 'checkout', orders: [], ordersLoading: false, ordersError: '', hasMoreOrders: false, cart: [], cartTotal: 0, cartDiscount: 0, requestLogin() {}, navigate() {} };
  globalThis.__customerViewFixture = fixture;
  try {
    const { AuthModal } = await server.ssrLoadModule('/src/modals/AuthModal.tsx');
    const { CheckoutPage } = await server.ssrLoadModule('/src/components/CheckoutPage.tsx');
    const { OrderHistoryPage } = await server.ssrLoadModule('/src/components/OrderHistoryPage.tsx');
    const auth = renderToStaticMarkup(React.createElement(AuthModal));
    assert.match(auth, /Log in before placing your order/); assert.match(auth, /type="email"/); assert.match(auth, /type="password"/); assert.match(auth, /Create an account/); assert.ok(!auth.includes('OTP'));
    const checkout = renderToStaticMarkup(React.createElement(CheckoutPage));
    assert.match(checkout, /Log in to place your order/); assert.ok(!checkout.includes('Pay with Razorpay'));
    assert.match(renderToStaticMarkup(React.createElement(OrderHistoryPage)), /Log in or create an account/);
    fixture.user = { id: 'customer', name: 'Test Customer', email: 'customer@test.invalid', addresses: [] }; fixture.authStatus = 'authenticated';
    assert.match(renderToStaticMarkup(React.createElement(AuthModal)), /Order History/);
    assert.match(renderToStaticMarkup(React.createElement(OrderHistoryPage)), /No orders yet/);
    fixture.orders = [{ id: 'FMX-TEST', date: '2026-11-07T06:30:00Z', status: 'Packed', items: [{ product: { id: 'rice', name: 'Family Choice Rice', price: 2100, image: '/farminix_rice_front.png', weight: '26 Kg' }, selectedWeight: '26 Kg', quantity: 1 }], totalAmount: 2100, discount: 0, deliveryFee: 0, handlingFee: 3, finalAmount: 2103, paymentMethod: 'Cash on Delivery (COD)', deliveryAddress: { name: 'Test Family', street: 'Test Road', city: 'Guntur', state: 'Andhra Pradesh', pincode: '522002', phone: '9999999999' } }];
    const markup = renderToStaticMarkup(React.createElement(OrderHistoryPage));
    for (const text of ['FMX-TEST', 'Family Choice Rice', 'Packed', 'Test Road', 'Cash on Delivery', '2,103', 'aria-current="step"']) assert.ok(markup.includes(text), text);
    assert.ok(!markup.includes('NaN')); assert.ok(!markup.includes('8 Mins'));
    fixture.cart = fixture.orders[0].items; fixture.cartTotal = 2100;
    fixture.user.addresses = [{ id: 'home', ...fixture.orders[0].deliveryAddress, deliveryLocation: { lat: 16.3, lng: 80.44 } }];
    const supported = renderToStaticMarkup(React.createElement(CheckoutPage));
    assert.ok(!supported.includes('Express Delivery')); assert.ok(!supported.includes('delivery-slot')); assert.match(supported, /Scheduled Delivery/); assert.match(supported, /Free delivery within Guntur and 10 km/);
    fixture.user.addresses[0].deliveryLocation = { lat: 16.25, lng: 80.36 };
    const paidDistance = renderToStaticMarkup(React.createElement(CheckoutPage));
    assert.match(paidDistance, /35.54/); assert.match(paidDistance, /charged at/); assert.match(paidDistance, /chargeable distance/i);
    fixture.user.addresses[0].deliveryLocation = { lat: 16.5062, lng: 80.648 };
    const outstation = renderToStaticMarkup(React.createElement(CheckoutPage));
    assert.match(outstation, /Delivery outside Guntur/); assert.match(outstation, /286.03/); assert.ok(!outstation.includes('disabled="" class="checkout-pay-button"'));
    globalThis.__customerDeliveryPricing = { pricingMode: 'fixed', fixedAmount: 150, perKmRate: 10 };
    const fixed = renderToStaticMarkup(React.createElement(CheckoutPage));
    assert.match(fixed, /Fixed delivery charge/); assert.match(fixed, /150/); assert.ok(!fixed.includes('Chargeable distance:')); assert.ok(!fixed.includes('NaN'));
    delete globalThis.__customerDeliveryPricing;
    fixture.user.addresses[0].deliveryLocation = undefined;
    const missingPin = renderToStaticMarkup(React.createElement(CheckoutPage));
    assert.match(missingPin, /Confirm a delivery pin/); assert.match(missingPin, /disabled="" class="checkout-pay-button"/);
    fixture.ordersError = 'Unable to load your orders'; fixture.orders = [];
    assert.match(renderToStaticMarkup(React.createElement(OrderHistoryPage)), /role="alert"/);
  } finally { delete globalThis.__customerDeliveryPricing; delete globalThis.__customerViewFixture; await server.close(); }
});
