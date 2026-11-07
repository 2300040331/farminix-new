import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTypeScript } from './helpers/load-typescript.mjs';
const policy = loadTypeScript(new URL('../server/delivery-policy.ts', import.meta.url));
const { parseDeliveryPin } = loadTypeScript(new URL('../src/utils/deliveryPin.ts', import.meta.url));
const { checkDelivery, defaultDeliveryArea, withinGuntur, distanceKm, deliverySettingsError } = policy;
const origin = { lat: defaultDeliveryArea.hubLatitude, lng: defaultDeliveryArea.hubLongitude };
const address = point => ({ city: 'Guntur', state: 'Andhra Pradesh', pincode: '522002', deliveryLocation: point });
const far = { lat: 16.25, lng: 80.36 };
function destination(km, bearing = 225) {
  const radius = km / 6371.0088, lat = origin.lat * Math.PI / 180, lng = origin.lng * Math.PI / 180, direction = bearing * Math.PI / 180;
  const nextLat = Math.asin(Math.sin(lat) * Math.cos(radius) + Math.cos(lat) * Math.sin(radius) * Math.cos(direction));
  return { lat: nextLat * 180 / Math.PI, lng: (lng + Math.atan2(Math.sin(direction) * Math.sin(radius) * Math.cos(lat), Math.cos(radius) - Math.sin(lat) * Math.sin(nextLat))) * 180 / Math.PI };
}
test('local and outstation delivery pricing rules', async t => {
  await t.test('uses the Google Maps church landmark and municipal polygon', () => {
    assert.equal(origin.lat, 16.346142); assert.equal(origin.lng, 80.438065); assert.ok(withinGuntur(origin));
    assert.ok(withinGuntur({ lat: 16.30, lng: 80.44 })); assert.ok(withinGuntur(far));
    for (const point of [{ lat: 16.5062, lng: 80.6480 }, { lat: 16.2428, lng: 80.6400 }, { lat: 16.55, lng: 80.44 }, { lat: 16.37, lng: 80.438065 }]) { const result = checkDelivery(address(point), { perKmRate: 10 }); assert.equal(result.allowed, true); assert.equal(result.inGuntur, false); assert.ok(result.deliveryFee > 0); }
  });
  await t.test('within 10 km, and exactly 10 km, are free even with old cart delivery charges', () => {
    for (const km of [0, 5, 9.999, 10]) {
      const point = destination(km); assert.ok(withinGuntur(point));
      const result = checkDelivery(address(point), { perKmRate: 99 }); assert.equal(result.allowed, true); assert.equal(result.deliveryFee, 0);
    }
  });
  await t.test('only extra distance is charged, including fractional kilometres and tiny positive charges', () => {
    const point = destination(10.001), result = checkDelivery(address(point), { perKmRate: 10 });
    assert.equal(result.allowed, true); assert.ok(result.deliveryFee > 0);
    const calculated = checkDelivery(address(far), { perKmRate: 10 });
    assert.equal(calculated.deliveryFee, 35.54); assert.ok(Math.abs(calculated.chargeableKm - (distanceKm(origin, far) - 10)) < 1e-9);
    assert.equal(checkDelivery(address(far), { perKmRate: 20 }).deliveryFee, 71.08);
  });
  await t.test('an unset rate blocks paid-distance orders; it never silently waives the fee', () => {
    assert.equal(checkDelivery(address(origin)).deliveryFee, 0);
    for (const perKmRate of [null, 0, -10, '10', Infinity, NaN]) { const result = checkDelivery(address(far), { perKmRate }); assert.equal(result.allowed, false); assert.equal(result.code, 'DELIVERY_NOT_CONFIGURED'); }
  });
  await t.test('invalid destination details still cannot place orders', () => {
    for (const point of [undefined, { lat: NaN, lng: 80.44 }, { lat: '16.3', lng: 80.44 }, { lat: 100, lng: 80.44 }]) assert.equal(checkDelivery(address(point)).allowed, false);
    for (const patch of [{ city: '' }, { state: '' }, { pincode: '52001' }]) assert.equal(checkDelivery({ ...address(origin), ...patch }).allowed, false);
    const outside = checkDelivery({ ...address({ lat: 16.5062, lng: 80.648 }), city: 'Vijayawada', pincode: '520010', distanceKm: 0, deliveryFee: 0 }, { perKmRate: 10 }); assert.equal(outside.allowed, true); assert.equal(outside.deliveryFee, 286.03);
  });
  await t.test('admin settings validate numeric rates and hub locations', () => {
    assert.equal(deliverySettingsError(defaultDeliveryArea), null); assert.equal(deliverySettingsError({ ...defaultDeliveryArea, perKmRate: 12.5 }), null);
    for (const patch of [{ hubLatitude: 17.5 }, { hubName: '' }, { perKmRate: -1 }, { perKmRate: 0 }, { perKmRate: '10' }]) assert.ok(deliverySettingsError({ ...defaultDeliveryArea, ...patch }));
  });
  await t.test('fixed pricing charges one amount for paid local and outstation orders', () => {
    const settings = { pricingMode: 'fixed', fixedAmount: 150, perKmRate: null };
    for (const point of [far, { lat: 16.5062, lng: 80.648 }, { lat: 17.385, lng: 78.4867 }, { lat: 16.37, lng: 80.438065 }]) {
      const result = checkDelivery(address(point), settings); assert.equal(result.allowed, true); assert.equal(result.deliveryFee, 150); assert.equal(result.pricingMode, 'fixed');
    }
    assert.equal(checkDelivery(address(origin), settings).deliveryFee, 0);
    assert.equal(checkDelivery(address(far), { ...settings, fixedAmount: 250 }).deliveryFee, 250);
    assert.equal(deliverySettingsError({ ...defaultDeliveryArea, ...settings }), null);
  });
  await t.test('unconfigured or invalid fixed pricing fails closed and never falls back to a kilometre rate', () => {
    for (const fixedAmount of [null, 0, -1, '150', Infinity, NaN]) assert.equal(checkDelivery(address(far), { pricingMode: 'fixed', fixedAmount, perKmRate: 10 }).allowed, false);
    assert.equal(checkDelivery(address(far), { pricingMode: 'unknown', perKmRate: 10 }).allowed, false);
    for (const patch of [{ pricingMode: 'unknown' }, { pricingMode: 'fixed', fixedAmount: -1 }, { pricingMode: 'fixed', fixedAmount: '150' }]) assert.ok(deliverySettingsError({ ...defaultDeliveryArea, ...patch }));
  });
  await t.test('maps pins are parsed locally without requesting arbitrary URLs', () => {
    assert.deepEqual(parseDeliveryPin('16.30, 80.44'), { lat: 16.30, lng: 80.44 });
    assert.deepEqual(parseDeliveryPin('https://www.google.com/maps/place/Test/@16.9,80.9,12z/data=!3d16.3!4d80.44'), { lat: 16.3, lng: 80.44 });
    assert.deepEqual(parseDeliveryPin('https://www.openstreetmap.org/?mlat=16.3&mlon=80.44'), { lat: 16.3, lng: 80.44 });
    for (const input of ['https://untrusted.invalid/?q=16.3,80.44', 'javascript:alert(1)', 'https://maps.app.goo.gl/short', '100,80', 'wrong']) assert.equal(parseDeliveryPin(input), undefined);
  });
});
