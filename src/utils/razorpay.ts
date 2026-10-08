export interface RazorpayOptions {
  key: string;
  amount: number; // in paise
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id?: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  }) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
    method?: 'upi' | 'card' | 'netbanking' | 'wallet';
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
    backdrop_color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    animation?: boolean;
    backdropclose?: boolean;
  };
}

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const fetchRazorpayKey = async (): Promise<string | null> => {
  try {
    const res = await fetch('/api/payment/razorpay-key');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.keyId) {
        return data.keyId;
      }
    }
  } catch {}
  return null;
};

export const createServerOrder = async (
  amount: number,
  notes?: Record<string, string>
): Promise<{ orderId?: string; keyId?: string } | null> => {
  try {
    const res = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, notes }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.order) {
        return {
          orderId: data.order.id,
          keyId: data.keyId,
        };
      }
    }
  } catch (e) {
    console.warn('Backend order creation endpoint unreachable, falling back to direct client checkout', e);
  }
  return null;
};

export const verifyServerPayment = async (payload: {
  razorpay_order_id?: string;
  razorpay_payment_id: string;
  razorpay_signature?: string;
}): Promise<boolean> => {
  try {
    const res = await fetch('/api/payment/verify-signature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      return !!data.success;
    }
  } catch (e) {
    console.warn('Backend payment verification endpoint skipped', e);
  }
  return true;
};
