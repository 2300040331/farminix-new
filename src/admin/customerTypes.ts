import type { Order, User } from '../types';

export interface RegisteredAdminUser extends User {
  createdAt: string | null;
  orderCount: number;
  orderValue: number;
  lastOrderAt: string | null;
}
export interface AdminUserDirectory {
  users: RegisteredAdminUser[];
  totalUsers: number;
  usersWithOrders: number;
  totalOrders: number;
  matchedUsers: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
export interface AdminUserDetails {
  user: RegisteredAdminUser;
  orders: Order[];
  nextCursor: number | null;
}
