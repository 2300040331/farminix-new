import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'] as string;

  if (webhookSecret && signature) {
    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.warn('[RAZORPAY WEBHOOK] Invalid signature');
      res.status(400).json({ error: 'Invalid webhook signature' });
      return;
    }
  }

  const event = req.body?.event;
  console.log(`[RAZORPAY WEBHOOK] Received valid event: ${event}`);

  res.status(200).json({ status: 'ok', received: true });
}
