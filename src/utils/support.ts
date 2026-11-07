import type { CustomerEnquiry } from '../admin/types';
export type SupportRequest = Pick<CustomerEnquiry, 'id' | 'message' | 'kind' | 'status' | 'createdAt' | 'source' | 'orderId' | 'publicReply' | 'repliedAt'>;
export interface SupportSubmission { name: string; mobile: string; email: string; message: string; kind: 'query' | 'complaint' | 'compliance'; website: string; source: 'support'; orderId?: string }
const phoneNumber = (value: unknown) => {
  if (typeof value !== 'string' || !/^\+?[\d\s().-]+$/.test(value.trim())) return '';
  const digits = value.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15 && !/^0+$/.test(digits) ? (digits.length === 10 ? `+91${digits}` : value.trim().startsWith('+') ? `+${digits}` : digits) : '';
};
export function supportContacts(config: { aboutPage?: { contactPhone?: string; contactEmail?: string }; manufacturer?: { contactPhone?: string; contactEmail?: string; supportHours?: string }; footer?: { whatsappPhone?: string }; header?: { logoUrl?: string } }, message = 'Hello Farminix, I need help with an issue.') {
  const phone = phoneNumber(config.aboutPage?.contactPhone) || phoneNumber(config.manufacturer?.contactPhone);
  const emails = [config.aboutPage?.contactEmail, config.manufacturer?.contactEmail];
  const email = emails.find(value => value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) || '';
  const whatsapp = phoneNumber(config.footer?.whatsappPhone).replace(/\D/g, '');
  return { phone, callUrl: phone ? `tel:${phone}` : '', email, emailUrl: email ? `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent('Farminix support request')}` : '', whatsappUrl: whatsapp ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}` : '', hours: config.manufacturer?.supportHours?.trim() || '', logo: config.header?.logoUrl || '/farminix_logo.png' };
}
export async function sendSupportRequest(payload: SupportSubmission, requestId: string) {
  const response = await fetch('/api/site-config/queries', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, requestId }), signal: AbortSignal.timeout(20000) });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.id || !/^[a-f0-9-]{36}$/i.test(result.id)) {
    const error = new Error(result?.error || 'Your support request has not been confirmed. Please retry; your message is still here.');
    throw Object.assign(error, { status: response.status });
  }
  return result.id as string;
}
