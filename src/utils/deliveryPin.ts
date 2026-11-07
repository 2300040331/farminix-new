import { validDeliveryLocation } from '../../server/delivery-policy';
import type { DeliveryLocation } from '../../server/delivery-policy';

export function parseDeliveryPin(input: string): DeliveryLocation | undefined {
  const text = input.trim();
  const direct = text.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  let values = direct?.slice(1);
  if (!values) {
    try {
      const url = new URL(text);
      if (!['http:', 'https:'].includes(url.protocol) || !['www.google.com', 'google.com', 'maps.google.com', 'www.google.co.in', 'www.openstreetmap.org', 'openstreetmap.org'].includes(url.hostname)) return;
      const precise = [...url.href.matchAll(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/g)].at(-1);
      const query = (url.searchParams.get('query') || url.searchParams.get('q') || url.searchParams.get('ll') || '').match(/^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
      const marker = url.searchParams.get('mlat') && url.searchParams.get('mlon') ? [url.searchParams.get('mlat')!, url.searchParams.get('mlon')!] : undefined;
      const viewport = decodeURIComponent(url.pathname).match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
      values = precise?.slice(1, 3) || query?.slice(1) || marker || viewport?.slice(1);
    } catch { return; }
  }
  if (!values) return;
  const point = { lat: Number(values[0]), lng: Number(values[1]) };
  return validDeliveryLocation(point) ? point : undefined;
}

