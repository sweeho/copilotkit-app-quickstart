'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User } from '../types/auth';
import * as authService from '../services/authService';
import { getStoredToken, clearStoredToken } from '../services/api';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Validate existing token on mount
  useEffect(() => {
    const validateToken = async () => {
      const token = getStoredToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const result = await authService.validate();
        const restored: User = {
          id: result.user_id,
          email: result.user_id,
          isAdmin: result.is_admin,
          token,
        };
        setUser(restored);
        localStorage.setItem('auth-user', JSON.stringify(restored));
      } catch {
        clearStoredToken();
        localStorage.removeItem('auth-user');
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);

  // Listen for auth-expired events (401 from API)
  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      setError('Session expired. Please log in again.');
    };
    window.addEventListener('auth-expired', handleExpired);
    return () => window.removeEventListener('auth-expired', handleExpired);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await authService.login(email, password);
      const newUser: User = {
        id: result.user.user_id,
        email: result.user.user_id,
        isAdmin: result.user.is_admin,
        lastLogin: result.user.last_login,
        token: result.token,
      };
      setUser(newUser);
      localStorage.setItem('auth-user', JSON.stringify(newUser));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    localStorage.removeItem('auth-user');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
