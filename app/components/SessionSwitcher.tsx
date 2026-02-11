"use client";

import { useState } from 'react';
import { useSession } from '../contexts/SessionContext';

export default function SessionSwitcher() {
  const { sessionId, switchSession } = useSession();
  const [sessions] = useState([
    { id: 'default', name: 'Default Session' },
    { id: 'session-1', name: 'Session 1' },
    { id: 'session-2', name: 'Session 2' },
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');

  const handleCreateSession = () => {
    if (newSessionName.trim()) {
      // In production, this would call backend API
      const newId = `session-${Date.now()}`;
      sessions.push({ id: newId, name: newSessionName });
      switchSession(newId);
      setNewSessionName('');
      setIsCreating(false);
    }
  };

  return (
    <div style={{
      padding: '1rem 2rem',
      background: '#f5f5f5',
      borderBottom: '1px solid #e0e0e0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <label style={{ fontWeight: '500', color: '#333' }}>
          Session:
        </label>
        
        <select
          value={sessionId || 'default'}
          onChange={(e) => switchSession(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #ddd',
            borderRadius: '5px',
            background: 'white',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          {sessions.map(session => (
            <option key={session.id} value={session.id}>
              {session.name}
            </option>
          ))}
        </select>
        
        {!isCreating ? (
          <button
            onClick={() => setIsCreating(true)}
            style={{
              padding: '0.5rem 1rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            + New Session
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              placeholder="Session name"
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '0.875rem'
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateSession()}
            />
            <button
              onClick={handleCreateSession}
              style={{
                padding: '0.5rem 1rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Create
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewSessionName('');
              }}
              style={{
                padding: '0.5rem 1rem',
                background: '#ccc',
                color: '#333',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
