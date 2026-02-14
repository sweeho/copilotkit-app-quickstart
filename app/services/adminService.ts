/**
 * Admin API service for user management.
 */

import { apiCall } from './api';

export interface AdminUser {
  user_id: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  last_login: string | null;
}

interface UsersResponse {
  users: AdminUser[];
}

interface UserResponse {
  user: AdminUser;
}

export async function listUsers(): Promise<AdminUser[]> {
  const data = await apiCall<UsersResponse>('GET', 'admin/users');
  return data.users;
}

export async function createUser(params: {
  user_id: string;
  password: string;
  is_admin?: boolean;
  is_active?: boolean;
}): Promise<AdminUser> {
  const data = await apiCall<UserResponse>('POST', 'admin/users', params);
  return data.user;
}

export async function updateUser(
  userId: string,
  updates: { is_admin?: boolean; is_active?: boolean }
): Promise<AdminUser> {
  const data = await apiCall<UserResponse>('PUT', `admin/users/${userId}`, updates);
  return data.user;
}

export async function resetPassword(
  userId: string,
  newPassword: string
): Promise<void> {
  await apiCall('POST', `admin/users/${userId}/reset-password`, {
    new_password: newPassword,
  });
}

export async function deleteUser(userId: string): Promise<void> {
  await apiCall('DELETE', `admin/users/${userId}`);
}
