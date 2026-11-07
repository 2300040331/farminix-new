import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminUserSession } from '../../server/admin-users.js';
import { handleEnquiries } from '../../server/enquiries.js';
import { redisEnquiries } from '../../server/enquiries-redis.js';
import { redisCustomerStore } from '../../server/customer-redis.js';
export default async function handler(req: VercelRequest, res: VercelResponse) {
  return handleEnquiries(req, res, redisEnquiries, redisCustomerStore, adminUserSession(req));
}
