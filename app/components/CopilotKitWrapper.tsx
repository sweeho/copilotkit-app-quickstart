"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { useSession } from "../contexts/SessionContext";
import { ReactNode } from "react";

export default function CopilotKitWrapper({ children }: { children: ReactNode }) {
  const { username, sessionId } = useSession();
  const { showThoughtProcess } = useSession();

  return (
    <CopilotKit 
      key={`${username || 'anon'}-${sessionId || 'none'}`}
      runtimeUrl="/api/copilotkit" 
      agent="my_agent"
      showDevConsole={showThoughtProcess}
      headers={{
        'x-username': username || 'demo_user',
        'x-session-id': sessionId || 'default',
        'x-show-thoughts': showThoughtProcess ? 'true' : 'false',
      }}
    >
      {children}
    </CopilotKit>
  );
}
