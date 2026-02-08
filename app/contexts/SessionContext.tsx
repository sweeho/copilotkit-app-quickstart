"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SessionContextType {
  username: string | null;
  sessionId: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => void;
  logout: () => void;
  switchSession: (sessionId: string) => void;
  showThoughtProcess: boolean;
  toggleThoughtProcess: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showThoughtProcess, setShowThoughtProcess] = useState(false);

  // Load username from localStorage on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      setUsername(savedUsername);
      // Create a fresh session for the restored username
      setSessionId(`session-${Date.now()}`);
    }
  }, []);

  const login = (username: string, password: string) => {
    // MVP: No actual validation, just store username
    setUsername(username);
    localStorage.setItem('username', username);
    // Start a fresh unique session when logging in
    setSessionId(`session-${Date.now()}`);
  };

  const logout = () => {
    setUsername(null);
    // Reset session so UI/backends remount and start fresh
    setSessionId(null);
    localStorage.removeItem('username');
  };

  const switchSession = (newSessionId: string) => {
    setSessionId(newSessionId);
  };

  const toggleThoughtProcess = () => {
    setShowThoughtProcess(prev => !prev);
  };

  return (
    <SessionContext.Provider
      value={{
        username,
        sessionId,
        isAuthenticated: !!username,
        login,
        logout,
        switchSession,
        showThoughtProcess,
        toggleThoughtProcess,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
