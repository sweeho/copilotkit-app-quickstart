"use client";

import { CopilotChat } from "@copilotkit/react-ui"; 
import { useSession } from "./contexts/SessionContext";
import Login from "./components/Login";
import Header from "./components/Header";
import SessionSwitcher from "./components/SessionSwitcher";

export default function Page() {
  const { isAuthenticated, showThoughtProcess } = useSession();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <SessionSwitcher />
      <main style={{ flex: 1, overflow: 'hidden' }}>
        <CopilotChat className="copilot-chat-container" />
      </main>
    </div>
  );
}

