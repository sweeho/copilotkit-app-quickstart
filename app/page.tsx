'use client';

import React, { useState, useCallback } from 'react';
import { Box } from '@mui/material';
import { CopilotKit } from '@copilotkit/react-core';
import { useAuth } from './contexts/AuthContext';
import { useSession } from './contexts/SessionContext';
import LoginScreen from './components/Auth/LoginScreen';
import SessionList from './components/Session/SessionList';
import Header from './components/Layout/Header';
import ChatView from './components/Chat/ChatView';

type AppView = 'login' | 'sessions' | 'chat';

export default function Page() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const {
    sessions,
    activeSession,
    createSession,
    selectSession,
    deleteSession,
    clearActiveSession,
  } = useSession();

  const [thoughtsEnabled, setThoughtsEnabled] = useState(false);

  const currentView: AppView = !isAuthenticated
    ? 'login'
    : activeSession
      ? 'chat'
      : 'sessions';

  const handleLogin = useCallback(
    (username: string) => {
      login(username);
    },
    [login]
  );

  const handleNewSession = useCallback(() => {
    createSession();
  }, [createSession]);

  const handleSelectSession = useCallback(
    (id: string) => {
      selectSession(id);
    },
    [selectSession]
  );

  const handleBackToSessions = useCallback(() => {
    clearActiveSession();
  }, [clearActiveSession]);

  if (currentView === 'login') {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      agent="my_agent"
      threadId={activeSession?.id}
      key={activeSession?.id ?? 'no-session'}
    >
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header
          username={user?.username}
          thoughtsEnabled={thoughtsEnabled}
          onThoughtsToggle={() => setThoughtsEnabled((prev) => !prev)}
          onNewSession={handleNewSession}
          onLogout={logout}
          showSessionControls={currentView === 'chat'}
        />

        {currentView === 'sessions' && (
          <SessionList
            sessions={sessions}
            onSelectSession={handleSelectSession}
            onDeleteSession={deleteSession}
            onCreateSession={handleNewSession}
          />
        )}

        {currentView === 'chat' && activeSession && (
          <ChatView
            session={activeSession}
            thoughtsEnabled={thoughtsEnabled}
            onBackToSessions={handleBackToSessions}
          />
        )}
      </Box>
    </CopilotKit>
  );
}

