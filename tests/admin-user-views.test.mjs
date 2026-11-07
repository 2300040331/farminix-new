import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('admin Users views render real profile fields and detailed order history', async () => {
  const server = await createServer({ configFile: false, server: { middlewareMode: true, watch: null, hmr: false, ws: false } });
  try {
    const { RegisteredUserDirectoryView } = await server.ssrLoadModule('/src/admin/pages/OnlineCustomers.tsx');
    const { RegisteredUserDetailsView } = await server.ssrLoadModule('/src/admin/components/RegisteredUserDetails.tsx');
    const { DeliveryAreaEditor } = await server.ssrLoadModule('/src/admin/components/DeliveryAreaEditor.tsx');
    const shipping = { hubName: 'Guntur Warehouse', hubLatitude: 16.346142, hubLongitude: 80.438065, perKmRate: 10 };
    const kmEditor = renderToStaticMarkup(React.createElement(DeliveryAreaEditor, { value: { ...shipping, pricingMode: 'per-km' }, onChange() {} }));
    assert.match(kmEditor, /Delivery pricing method/); assert.match(kmEditor, /Based on kilometres/); assert.match(kmEditor, /Delivery charge per kilometre/); assert.match(kmEditor, /Outside Guntur/);
    const fixedEditor = renderToStaticMarkup(React.createElement(DeliveryAreaEditor, { value: { ...shipping, pricingMode: 'fixed', fixedAmount: 150 }, onChange() {} }));
    assert.match(fixedEditor, /Fixed delivery amount/); assert.match(fixedEditor, /value="150"/); assert.ok(!fixedEditor.includes('aria-label="Delivery charge per kilometre"'));

    const user = { id: 'user-test', name: 'Test Family', email: 'family@test.invalid', phone: '9999999999', addresses: [{ id: 'home', name: 'Home', street: 'Test Road', city: 'Guntur', state: 'Andhra Pradesh', pincode: '522002', phone: '9999999999', isDefault: true }], rewardPoints: 5, walletBalance: 0, createdAt: '2026-11-07T06:30:00Z', lastOrderAt: '2026-11-07T06:35:00Z', orderCount: 1, orderValue: 2103 };
    const directory = renderToStaticMarkup(React.createElement(RegisteredUserDirectoryView, { directory: { users: [user] }, onSelect() {} }));
    for (const text of ['Test Family', 'family@test.invalid', '9999999999', 'View user', '2,103']) assert.ok(directory.includes(text), text);
    const order = { id: 'FMX-TEST', date: '2026-11-07T06:35:00Z', status: 'Packed', items: [{ product: { id: 'rice', name: 'Family Choice Rice', price: 2100 }, quantity: 1, selectedWeight: '26 Kg' }], totalAmount: 2100, discount: 0, deliveryFee: 0, handlingFee: 3, finalAmount: 2103, paymentMethod: 'Cash on Delivery (COD)', deliveryAddress: user.addresses[0] };
    const markup = renderToStaticMarkup(React.createElement(RegisteredUserDetailsView, { details: { user, orders: [order], nextCursor: null } }));
    for (const text of ['user-test', 'family@test.invalid', 'Saved addresses', 'Test Road', 'Order history', 'FMX-TEST', 'Packed', 'Family Choice Rice', 'Cash on Delivery', '2,103']) assert.ok(markup.includes(text), text);
    assert.ok(!markup.includes('NaN'));
    const empty = renderToStaticMarkup(React.createElement(RegisteredUserDetailsView, { details: { user: { ...user, orderCount: 0, orderValue: 0, lastOrderAt: null }, orders: [] } }));
    assert.match(empty, /registered but has not placed an order/);
  } finally { await server.close(); }
});
