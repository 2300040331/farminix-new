import type { VercelRequest, VercelResponse } from '@vercel/node';
import Razorpay from 'razorpay';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method Not Allowed' });
    return;
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    res.status(500).json({
      success: false,
      error: 'Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) not configured in environment',
    });
    return;
  }

  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    if (!amount || Number(amount) <= 0) {
      res.status(400).json({ success: false, error: 'Valid amount is required' });
      return;
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100), // amount in paise
      currency: currency || 'INR',
      receipt: receipt || `farminix_${Date.now()}`,
      notes: notes || {},
    });

    res.status(200).json({
      success: true,
      order,
      keyId,
    });
  } catch (error: any) {
    console.error('Razorpay Create Order Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create Razorpay order',
    });
  }
}
