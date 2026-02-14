'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Session } from '../types/session';
import * as sessionService from '../services/sessionService';
import { useAuth } from './AuthContext';

interface SessionContextValue {
  sessions: Session[];
  activeSession: Session | null;
  isLoading: boolean;
  error: string | null;
  loadSessions: () => Promise<void>;
  createSession: (name?: string) => Promise<Session>;
  selectSession: (id: string) => void;
  renameSession: (id: string, newName: string) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  clearActiveSession: () => void;
}

const SessionContext = createContext<SessionContextValue>({
  sessions: [],
  activeSession: null,
  isLoading: false,
  error: null,
  loadSessions: async () => {},
  createSession: async () => ({} as Session),
  selectSession: () => {},
  renameSession: async () => {},
  deleteSession: async () => {},
  clearActiveSession: () => {},
});

export const useSession = () => useContext(SessionContext);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sessionService.listSessions();
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load sessions when user authenticates
  useEffect(() => {
    if (isAuthenticated) {
      loadSessions();
    } else {
      setSessions([]);
      setActiveSession(null);
    }
  }, [isAuthenticated, loadSessions]);

  const createSession = useCallback(async (name?: string) => {
    setError(null);
    try {
      const session = await sessionService.createSession(name);
      setSessions((prev) => [session, ...prev]);
      setActiveSession(session);
      return session;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create session';
      setError(message);
      throw err;
    }
  }, []);

  const selectSession = useCallback((id: string) => {
    setSessions((prev) => {
      const session = prev.find((s) => s.id === id);
      if (session) {
        setActiveSession(session);
      }
      return prev;
    });
  }, []);

  const renameSession = useCallback(async (id: string, newName: string) => {
    setError(null);
    try {
      const updated = await sessionService.updateSession(id, { session_name: newName });
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? updated : s))
      );
      setActiveSession((prev) => (prev?.id === id ? updated : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename session');
      throw err;
    }
  }, []);

  const deleteSession = useCallback(async (id: string) => {
    setError(null);
    try {
      await sessionService.deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      setActiveSession((prev) => (prev?.id === id ? null : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session');
      throw err;
    }
  }, []);

  const clearActiveSession = useCallback(() => {
    setActiveSession(null);
  }, []);

  return (
    <SessionContext.Provider
      value={{
        sessions,
        activeSession,
        isLoading,
        error,
        loadSessions,
        createSession,
        selectSession,
        renameSession,
        deleteSession,
        clearActiveSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
