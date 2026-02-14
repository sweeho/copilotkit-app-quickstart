'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Box } from '@mui/material';
import { CopilotKit } from '@copilotkit/react-core';
import { useAuth } from './contexts/AuthContext';
import { useSession } from './contexts/SessionContext';
import { getStoredToken } from './services/api';
import LoginScreen from './components/Auth/LoginScreen';
import Header from './components/Layout/Header';
import EmptyState from './components/Layout/EmptyState';
import LeftSidebar from './components/Sidebar/LeftSidebar';
import ChatView from './components/Chat/ChatView';
import AdminPanel from './components/Admin/AdminPanel';

export default function Page() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const {
    sessions,
    activeSession,
    isLoading: sessionsLoading,
    createSession,
    selectSession,
    renameSession,
    deleteSession,
  } = useSession();

  const [thoughtsEnabled, setThoughtsEnabled] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      await login(email, password);
    },
    [login]
  );

  const handleNewChat = useCallback(() => {
    setShowAdmin(false);
    createSession();
  }, [createSession]);

  const handleSelectSession = useCallback(
    (id: string) => {
      setShowAdmin(false);
      selectSession(id);
    },
    [selectSession]
  );

  const handleRenameSession = useCallback(
    (id: string, newName: string) => {
      renameSession(id, newName);
    },
    [renameSession]
  );

  const handleDeleteSession = useCallback(
    (id: string) => {
      deleteSession(id);
    },
    [deleteSession]
  );

  // Build CopilotKit headers with auth token and thoughts toggle
  const copilotHeaders = useMemo(() => {
    const token = getStoredToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    headers['x-show-thoughts'] = thoughtsEnabled ? 'true' : 'false';
    return headers;
  }, [user, thoughtsEnabled]); // re-compute when user or toggle changes

  // Login view
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Main layout: header + sidebar + content
  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      agent="my_agent"
      threadId={activeSession?.id}
      key={activeSession?.id ?? 'no-session'}
      headers={copilotHeaders}
    >
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header
          username={user?.email}
          thoughtsEnabled={thoughtsEnabled}
          onThoughtsToggle={() => setThoughtsEnabled((prev) => !prev)}
          onLogout={logout}
          showThoughtsToggle={!!activeSession}
        />

        <Box sx={{ flex: 1, display: 'flex', pt: '64px', overflow: 'hidden' }}>
          {/* Left sidebar — always visible */}
          <LeftSidebar
            sessions={sessions}
            activeSessionId={activeSession?.id ?? null}
            isLoading={sessionsLoading}
            isAdmin={user?.isAdmin ?? false}
            onNewChat={handleNewChat}
            onSelectSession={handleSelectSession}
            onRenameSession={handleRenameSession}
            onDeleteSession={handleDeleteSession}
            onAdminPanel={() => setShowAdmin(true)}
          />

          {/* Content area */}
          {showAdmin ? (
            <AdminPanel
              currentUserId={user?.email ?? ''}
              onClose={() => setShowAdmin(false)}
            />
          ) : activeSession ? (
            <ChatView
              session={activeSession}
              thoughtsEnabled={thoughtsEnabled}
            />
          ) : (
            <EmptyState onNewChat={handleNewChat} />
          )}
        </Box>
      </Box>
    </CopilotKit>
  );
}

