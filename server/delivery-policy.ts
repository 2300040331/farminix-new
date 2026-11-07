import { gunturBoundary } from './guntur-boundary.js';

export interface DeliveryLocation { lat: number; lng: number }
export interface DeliveryAreaConfig {
  hubName: string;
  hubLatitude: number;
  hubLongitude: number;
  perKmRate: number | null;
  pricingMode?: 'fixed' | 'per-km';
  fixedAmount?: number | null;
}
export const FREE_DELIVERY_RADIUS_KM = 10;
export const defaultDeliveryArea: DeliveryAreaConfig = {
  hubName: 'Farminix Warehouse, Arogyamatha Church Complex, Gorantla, Guntur',
  hubLatitude: 16.346142, hubLongitude: 80.438065, perKmRate: null, pricingMode: 'per-km', fixedAmount: null,
};
export function validDeliveryLocation(value: unknown): value is DeliveryLocation {
  const point = value as DeliveryLocation | undefined;
  return Boolean(point && typeof point.lat === 'number' && Number.isFinite(point.lat) && Math.abs(point.lat) <= 90 && typeof point.lng === 'number' && Number.isFinite(point.lng) && Math.abs(point.lng) <= 180);
}
function pointInRing(point: DeliveryLocation, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    const cross = (point.lng - xi) * (yj - yi) - (point.lat - yi) * (xj - xi);
    if (Math.abs(cross) < 1e-12 && point.lng >= Math.min(xi, xj) && point.lng <= Math.max(xi, xj) && point.lat >= Math.min(yi, yj) && point.lat <= Math.max(yi, yj)) return true;
    if ((yi > point.lat) !== (yj > point.lat) && point.lng < (xj - xi) * (point.lat - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
export function withinGuntur(point: DeliveryLocation): boolean {
  return validDeliveryLocation(point) && pointInRing(point, gunturBoundary[0]) && !gunturBoundary.slice(1).some(ring => pointInRing(point, ring));
}
export function distanceKm(origin: DeliveryLocation, destination: DeliveryLocation) {
  const radians = Math.PI / 180;
  const a = Math.sin((destination.lat - origin.lat) * radians / 2) ** 2 + Math.cos(origin.lat * radians) * Math.cos(destination.lat * radians) * Math.sin((destination.lng - origin.lng) * radians / 2) ** 2;
  return 6371.0088 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
}
export function deliveryAreaSettings(config?: Partial<DeliveryAreaConfig> | null): DeliveryAreaConfig {
  return { ...defaultDeliveryArea, ...config, pricingMode: config?.pricingMode ?? 'per-km', fixedAmount: config?.fixedAmount ?? null };
}
export interface DeliveryCheck {
  allowed: boolean;
  code: 'SUPPORTED' | 'LOCATION_REQUIRED' | 'INVALID_ADDRESS' | 'DELIVERY_NOT_CONFIGURED';
  message: string;
  deliveryFee: number | null;
  distanceKm?: number;
  chargeableKm?: number;
  pricingMode?: 'free' | 'fixed' | 'per-km';
  inGuntur?: boolean;
  perKmRate?: number;
}
export function checkDelivery(address: { city?: string; state?: string; pincode?: string; deliveryLocation?: unknown } | undefined, settings?: Partial<DeliveryAreaConfig> | null): DeliveryCheck {
  const denied = (code: DeliveryCheck['code'], message: string): DeliveryCheck => ({ allowed: false, code, message, deliveryFee: null });
  if (!address || !validDeliveryLocation(address.deliveryLocation)) return denied('LOCATION_REQUIRED', 'Confirm a delivery pin for this address to check availability and delivery charges.');
  const city = String(address.city || '').trim();
  const state = String(address.state || '').trim();
  if (!city || !state || !/^[1-9]\d{5}$/.test(String(address.pincode || '').trim())) return denied('INVALID_ADDRESS', 'Enter the delivery city, state and a valid six-digit pincode.');
  const config = deliveryAreaSettings(settings);
  const origin = { lat: config.hubLatitude, lng: config.hubLongitude };
  if (deliverySettingsError(config)) return denied('DELIVERY_NOT_CONFIGURED', 'Delivery settings are temporarily unavailable. Please contact Farminix.');
  const distance = distanceKm(origin, address.deliveryLocation);
  const inGuntur = withinGuntur(address.deliveryLocation);
  // The existing local benefit belongs to the destination pin, not its typed city label.
  if (inGuntur && distance <= FREE_DELIVERY_RADIUS_KM + 1e-9) return { allowed: true, code: 'SUPPORTED', deliveryFee: 0, distanceKm: distance, chargeableKm: 0, inGuntur, pricingMode: 'free', message: 'Free delivery within Guntur and 10 km of our warehouse.' };
  if (config.pricingMode === 'fixed') {
    if (config.fixedAmount == null) return { ...denied('DELIVERY_NOT_CONFIGURED', 'The fixed delivery charge is not yet configured. Please contact Farminix.'), distanceKm: distance, inGuntur };
    const fee = Math.ceil(config.fixedAmount * 100 - 1e-9) / 100;
    return { allowed: true, code: 'SUPPORTED', deliveryFee: fee, distanceKm: distance, inGuntur, pricingMode: 'fixed', message: `Fixed delivery charge: ₹${fee} per order.` };
  }
  if (config.perKmRate == null) return { ...denied('DELIVERY_NOT_CONFIGURED', 'The delivery charge per kilometre is not yet configured. Please contact Farminix.'), distanceKm: distance, inGuntur };
  // Local paid deliveries retain the first 10 km free; outstation orders use the full distance.
  const chargeableKm = inGuntur ? distance - FREE_DELIVERY_RADIUS_KM : distance;
  const fee = Math.max(0.01, Math.ceil(chargeableKm * config.perKmRate * 100 - 1e-9) / 100);
  return { allowed: true, code: 'SUPPORTED', deliveryFee: fee, distanceKm: distance, chargeableKm, perKmRate: config.perKmRate, inGuntur, pricingMode: 'per-km', message: inGuntur ? `Delivery is charged at ₹${config.perKmRate}/km for the distance beyond 10 km.` : `Delivery outside Guntur is charged at ₹${config.perKmRate}/km from our warehouse.` };
}

export function deliverySettingsError(value: unknown): string | null {
  if (value === undefined) return null;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return 'Invalid delivery-area settings.';
  const config = value as DeliveryAreaConfig;
  if (typeof config.hubName !== 'string' || !config.hubName.trim() || config.hubName.length > 180 || !withinGuntur({ lat: config.hubLatitude, lng: config.hubLongitude })) return 'Choose a valid warehouse name and pin within Guntur.';
  const mode = config.pricingMode ?? 'per-km';
  if (!['fixed', 'per-km'].includes(mode)) return 'Choose fixed delivery charges or charges per kilometre.';
  if (mode === 'per-km' && config.perKmRate !== null && (typeof config.perKmRate !== 'number' || !Number.isFinite(config.perKmRate) || config.perKmRate <= 0 || config.perKmRate > 100000)) return 'Enter a positive delivery rate per kilometre, or leave it unset.';
  if (mode === 'fixed' && config.fixedAmount !== undefined && config.fixedAmount !== null && (typeof config.fixedAmount !== 'number' || !Number.isFinite(config.fixedAmount) || config.fixedAmount <= 0 || config.fixedAmount > 100000)) return 'Enter a positive fixed delivery amount, or leave it unset.';
  return null;
}
