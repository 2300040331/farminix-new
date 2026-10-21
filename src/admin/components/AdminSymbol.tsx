import { Banknote, BellOff, ClipboardList, CreditCard, DoorOpen, Landmark, MapPin, Package, Phone, QrCode, Ruler, ShieldCheck, Truck, Wheat } from 'lucide-react';

const symbols = {
  wheat: Wheat, shield: ShieldCheck, phone: Phone, ruler: Ruler,
  delivery: Truck, door: DoorOpen, bell: BellOff, call: Phone, security: ShieldCheck, location: MapPin,
  razorpay: CreditCard, upi: QrCode, card: CreditCard, netbanking: Landmark,
  cod: Banknote, package: Package,
};

/** Admin controls always use the same standard SVG icon family, including legacy emoji settings. */
export function AdminSymbol({ name }: { name: string }) {
  const Icon = symbols[name as keyof typeof symbols] || ClipboardList;
  return <Icon className="admin-standard-symbol" size={20} strokeWidth={2} aria-hidden="true"/>;
}
