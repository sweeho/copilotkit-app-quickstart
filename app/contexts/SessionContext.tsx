'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Session, ChatMessage } from '../types/session';

interface SessionContextValue {
  sessions: Session[];
  activeSession: Session | null;
  messages: ChatMessage[];
  createSession: (name?: string) => Session;
  selectSession: (id: string) => void;
  deleteSession: (id: string) => void;
  addMessage: (role: 'user' | 'assistant', content: string, agentExecutionId?: string) => ChatMessage;
  clearActiveSession: () => void;
}

const SessionContext = createContext<SessionContextValue>({
  sessions: [],
  activeSession: null,
  messages: [],
  createSession: () => ({} as Session),
  selectSession: () => {},
  deleteSession: () => {},
  addMessage: () => ({} as ChatMessage),
  clearActiveSession: () => {},
});

export const useSession = () => useContext(SessionContext);

const SESSIONS_KEY = 'agent-studio-sessions';
const MESSAGES_KEY = 'agent-studio-messages';

function loadSessions(): Session[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: Session[]) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

function loadMessages(sessionId: string): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(`${MESSAGES_KEY}-${sessionId}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveMessages(sessionId: string, messages: ChatMessage[]) {
  localStorage.setItem(`${MESSAGES_KEY}-${sessionId}`, JSON.stringify(messages));
}

function generateSessionName(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.toLocaleString('en-US', { month: 'short' });
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Load sessions on mount
  useEffect(() => {
    setSessions(loadSessions());
  }, []);

  const createSession = useCallback((name?: string) => {
    const now = new Date().toISOString();
    const session: Session = {
      id: uuidv4(),
      name: name || generateSessionName(),
      createdAt: now,
      updatedAt: now,
      messageCount: 0,
    };
    setSessions((prev) => {
      const updated = [session, ...prev];
      saveSessions(updated);
      return updated;
    });
    setActiveSession(session);
    setMessages([]);
    return session;
  }, []);

  const selectSession = useCallback((id: string) => {
    setSessions((prev) => {
      const session = prev.find((s) => s.id === id);
      if (session) {
        setActiveSession(session);
        setMessages(loadMessages(id));
      }
      return prev;
    });
  }, []);

  const deleteSession = useCallback(
    (id: string) => {
      setSessions((prev) => {
        const updated = prev.filter((s) => s.id !== id);
        saveSessions(updated);
        return updated;
      });
      localStorage.removeItem(`${MESSAGES_KEY}-${id}`);
      if (activeSession?.id === id) {
        setActiveSession(null);
        setMessages([]);
      }
    },
    [activeSession]
  );

  const addMessage = useCallback(
    (role: 'user' | 'assistant', content: string, agentExecutionId?: string) => {
      if (!activeSession) throw new Error('No active session');
      const msg: ChatMessage = {
        id: uuidv4(),
        sessionId: activeSession.id,
        role,
        content,
        timestamp: new Date().toISOString(),
        agentExecutionId,
      };
      setMessages((prev) => {
        const updated = [...prev, msg];
        saveMessages(activeSession.id, updated);
        return updated;
      });
      // Update session metadata
      setSessions((prev) => {
        const updated = prev.map((s) =>
          s.id === activeSession.id
            ? {
                ...s,
                updatedAt: msg.timestamp,
                messageCount: s.messageCount + 1,
                lastMessagePreview: content.substring(0, 80),
              }
            : s
        );
        saveSessions(updated);
        // Also update activeSession reference
        const updatedActive = updated.find((s) => s.id === activeSession.id);
        if (updatedActive) setActiveSession(updatedActive);
        return updated;
      });
      return msg;
    },
    [activeSession]
  );

  const clearActiveSession = useCallback(() => {
    setActiveSession(null);
    setMessages([]);
  }, []);

  return (
    <SessionContext.Provider
      value={{
        sessions,
        activeSession,
        messages,
        createSession,
        selectSession,
        deleteSession,
        addMessage,
        clearActiveSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
