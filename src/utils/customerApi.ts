export class CustomerApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) { super(message); this.status = status; this.code = code; }
}

export async function customerApi<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, { ...options, credentials: 'same-origin', cache: 'no-store', headers: { 'Content-Type': 'application/json', ...options.headers } });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new CustomerApiError(data?.error || 'Unable to connect. Please try again.', response.status, data?.code);
  if (!data) throw new CustomerApiError('Account services are unavailable. Please try again.', 503);
  return data as T;
}
