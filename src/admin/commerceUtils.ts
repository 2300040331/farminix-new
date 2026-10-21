export const money = (value: number) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
export const orderLabel = (id: string) => id.length > 18 ? `#${id.slice(0, 12)}` : `#${id}`;
export const customerKey = (phone: string) => phone.replace(/\D/g, '').slice(-10);
