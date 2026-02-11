/**
 * Authentication API service.
 */

import { apiCall, setStoredToken, clearStoredToken } from './api';

export interface LoginResponse {
  token: string;
  user: {
    user_id: string;
    is_admin: boolean;
    last_login: string;
  };
}

export interface ValidateResponse {
  valid: boolean;
  user_id: string;
  is_admin: boolean;
}

export async function login(userId: string, password: string): Promise<LoginResponse> {
  const data = await apiCall<LoginResponse>('POST', 'auth/login', {
    user_id: userId,
    password,
  });
  // Store the token for future requests
  setStoredToken(data.token);
  return data;
}

export async function validate(): Promise<ValidateResponse> {
  return apiCall<ValidateResponse>('GET', 'auth/validate');
}

export async function logout(): Promise<void> {
  try {
    await apiCall('POST', 'auth/logout');
  } catch {
    // Ignore errors on logout
  }
  clearStoredToken();
}
