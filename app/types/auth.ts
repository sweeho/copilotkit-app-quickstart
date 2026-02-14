export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
  lastLogin?: string;
  token: string;
}

export interface LoginRequest {
  user_id: string;
  password: string;
}

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
