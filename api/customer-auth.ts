import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCustomerAuth } from '../server/customer-auth.js';
import { redisCustomerStore } from '../server/customer-redis.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  return handleCustomerAuth(req, res, redisCustomerStore);
}
