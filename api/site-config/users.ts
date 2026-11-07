import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminUserSession, handleAdminUsers } from '../../server/admin-users.js';
import { redisAdminUsers } from '../../server/admin-users-redis.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return handleAdminUsers(req, res, redisAdminUsers, adminUserSession(req));
}
