"use client";

import { useSession } from '../contexts/SessionContext';

export default function Header() {
  const { username, logout, showThoughtProcess, toggleThoughtProcess } = useSession();

  return (
    <header style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: '40px',
          height: '40px',
          background: 'white',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          color: '#667eea',
          fontSize: '1.25rem'
        }}>
          AI
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
            AI Agent Assistant
          </h1>
          <p style={{ fontSize: '0.875rem', margin: 0, opacity: 0.9 }}>
            Powered by Google ADK
          </p>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={toggleThoughtProcess}
          style={{
            padding: '0.5rem 1rem',
            background: showThoughtProcess ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '5px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
          onMouseOut={(e) => e.currentTarget.style.background = showThoughtProcess ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}
        >
          {showThoughtProcess ? '🧠 Hide Thoughts' : '🧠 Show Thoughts'}
        </button>
        
        <div style={{
          padding: '0.5rem 1rem',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '5px',
          fontSize: '0.875rem'
        }}>
          👤 {username}
        </div>
        
        <button
          onClick={logout}
          style={{
            padding: '0.5rem 1rem',
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '5px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
