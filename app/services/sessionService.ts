/**
 * Session management API service.
 */

import { apiCall } from './api';
import type { Session } from '../types/session';

interface SessionResponse {
  session: {
    session_id: string;
    user_id: string;
    session_name: string;
    created_at: string;
    updated_at: string;
    message_count: number;
    last_message_preview: string | null;
    agent_count: number;
  };
}

interface SessionsResponse {
  sessions: SessionResponse['session'][];
}

/** Map backend session format to frontend Session type */
function mapSession(s: SessionResponse['session']): Session {
  return {
    id: s.session_id,
    name: s.session_name,
    userId: s.user_id,
    createdAt: new Date(s.created_at),
    updatedAt: new Date(s.updated_at),
    messageCount: s.message_count,
    lastMessagePreview: s.last_message_preview || undefined,
    agentCount: s.agent_count,
  };
}

export async function listSessions(): Promise<Session[]> {
  const data = await apiCall<SessionsResponse>('GET', 'sessions');
  return data.sessions.map(mapSession);
}

export async function createSession(name?: string): Promise<Session> {
  const body = name ? { session_name: name } : {};
  const data = await apiCall<SessionResponse>('POST', 'sessions', body);
  return mapSession(data.session);
}

export async function getSession(sessionId: string): Promise<Session> {
  const data = await apiCall<SessionResponse>('GET', `sessions/${sessionId}`);
  return mapSession(data.session);
}

export async function updateSession(
  sessionId: string,
  updates: { session_name?: string }
): Promise<Session> {
  const data = await apiCall<SessionResponse>('PUT', `sessions/${sessionId}`, updates);
  return mapSession(data.session);
}

export async function deleteSession(sessionId: string): Promise<void> {
  await apiCall('DELETE', `sessions/${sessionId}`);
}
