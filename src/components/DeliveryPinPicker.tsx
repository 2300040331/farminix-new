import { parseDeliveryPin } from '../utils/deliveryPin';
import { useState } from 'react';
import { Loader2, MapPin, Navigation } from 'lucide-react';
import { validDeliveryLocation } from '../../server/delivery-policy';
import type { DeliveryLocation } from '../../server/delivery-policy';

export function DeliveryPinPicker({ value, onChange }: { value?: DeliveryLocation; onChange: (point?: DeliveryLocation) => void }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [mapLink, setMapLink] = useState('');
  const useGps = () => {
    if (!navigator.geolocation) { setError('GPS is unavailable. Paste a map pin or enter its coordinates below.'); return; }
    setBusy(true); setError('');
    navigator.geolocation.getCurrentPosition(position => {
      setBusy(false);
      if (position.coords.accuracy > 100) { setError('GPS is not accurate enough. Try again outdoors or enter the exact delivery pin.'); return; }
      onChange({ lat: position.coords.latitude, lng: position.coords.longitude });
    }, () => { setBusy(false); setError('Unable to access GPS. Allow location access or paste the delivery pin below.'); }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  };
  return <div className="checkout-pin-picker">
    <h4><MapPin size={16} />Delivery location</h4><p>Choose the exact delivery pin. We deliver within and outside Guntur. Your delivery charge is calculated from the selected pin using our current delivery pricing.</p>
    <button type="button" onClick={useGps} disabled={busy} className="checkout-outline-button">{busy ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}{busy ? 'Finding your location…' : 'Use my current GPS location'}</button>
    <label>Or paste a full maps link / latitude, longitude<div className="checkout-pin-link"><input value={mapLink} onChange={event => setMapLink(event.target.value)} placeholder="16.346142, 80.438065" /><button type="button" onClick={() => { const point = parseDeliveryPin(mapLink); if (point) { onChange(point); setError(''); } else setError('Paste coordinates or the full map URL after opening a shared link in your browser.'); }}>Use pin</button></div></label>
    <div className="checkout-pin-coordinates"><label>Latitude<input type="number" step="any" min="-90" max="90" value={value?.lat ?? ''} onChange={event => onChange(event.target.value === '' ? undefined : { lat: Number(event.target.value), lng: value?.lng ?? 80.438065 })} /></label><label>Longitude<input type="number" step="any" min="-180" max="180" value={value?.lng ?? ''} onChange={event => onChange(event.target.value === '' ? undefined : { lat: value?.lat ?? 16.346142, lng: Number(event.target.value) })} /></label></div>
    {error && <p role="alert" className="checkout-pin-error">{error}</p>}
    {value && validDeliveryLocation(value) && <><iframe title="Confirm your delivery pin" loading="lazy" referrerPolicy="no-referrer" src={`https://www.openstreetmap.org/export/embed.html?bbox=${value.lng - 0.008},${value.lat - 0.005},${value.lng + 0.008},${value.lat + 0.005}&layer=mapnik&marker=${value.lat},${value.lng}`} /><a href={`https://www.openstreetmap.org/?mlat=${value.lat}&mlon=${value.lng}#map=17/${value.lat}/${value.lng}`} target="_blank" rel="noopener noreferrer">View selected pin · © OpenStreetMap contributors</a></>}
  </div>;
}
