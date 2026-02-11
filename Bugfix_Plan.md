# Bugfix Plan

## Summary

8 bugs identified in BUGS.md. Analysis below covers root cause, impact, and precise fix for each.

---

## Bug 1: Hydration Mismatch Error

**Symptom**: `Hydration failed because the server rendered HTML didn't match the client` on the LoginScreen `<Fade>` → `<Box>` component.

**Root Cause**: MUI's `<Fade>` component injects inline styles (`opacity`, `visibility`) on the client that differ from the server-rendered HTML. The `AppThemeProvider` also reads `localStorage` and `window.matchMedia` on mount, causing the resolved theme to differ between SSR (always `light`) and client (could be `dark` or `system`→`dark`).

**Fix**:
1. Add `suppressHydrationWarning` to the `<body>` tag (already done in `layout.tsx`).
2. **Defer rendering until client-side hydration is complete** by adding a `mounted` guard in `AppThemeProvider` that renders `null` (or a loading placeholder) on the server/first render, then renders children once `useEffect` fires. This prevents MUI Emotion styles from generating mismatched class names.

**Files to modify**:
- `app/contexts/ThemeContext.tsx` — add `mounted` state, only render `<MuiThemeProvider>` after mount.

**Code Change**:
```tsx
// In AppThemeProvider:
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

// Before the return, add:
if (!mounted) {
  return <>{children}</>;  // Render without MUI theme until hydrated
}
```

---

## Bug 2: Thoughts Panel Shows No Content

**Symptom**: Clicking the Thoughts toggle opens the sidebar, but it always shows "Agent orchestration details will appear here" — no actual agent thought data displayed.

**Root Cause**: In `ChatView.tsx`, `agentExecutions` is hardcoded as an empty array:
```tsx
const [agentExecutions] = useState<AgentExecution[]>([]);
```
No mechanism exists to populate this from the CopilotKit runtime. The `ag_ui_adk` library supports thinking events (`ThinkingStartEvent`, `ThinkingTextMessageContentEvent`, etc.) — it already emits them if `include_thoughts=True` is set — but the frontend never consumes these events.

**Fix**:
1. Use CopilotKit's `useCopilotChat` hook to access messages, including agent thinking/tool call metadata.
2. Transform CopilotKit messages into `AgentExecution` objects by parsing assistant messages and detecting sub-agent tool calls.
3. Pass real data to `ThoughtsPanel`.

**Files to modify**:
- `app/components/Chat/ChatView.tsx` — hook into CopilotKit messages, build execution data from messages.

**Note**: Full real-time sub-agent streaming requires CopilotKit to forward `ThinkingTextMessage` events. For Phase 1 MVP, we will parse the assistant messages to extract agent orchestration info (which agents were used, what they returned) and display that.

---

## Bug 3: "New Session" Button Does Nothing in Chat Screen

**Symptom**: In the chat view, clicking the "New Session" icon button in the header does nothing visible.

**Root Cause**: The `handleNewSession` in `page.tsx` calls `createSession()`, which:
1. Creates a new session
2. Sets it as `activeSession`
3. Clears messages

This *does* work — it creates a session and switches to it. But since the user is already in chat view and the new session also opens in chat view, it appears as if nothing happened (the chat just clears). There's no visual feedback or confirmation.

**Fix**:
1. When clicking "New Session" from chat view, **clear the CopilotKit chat history** so the new empty session starts fresh.
2. Add a visual indicator (e.g., briefly show the session name change) to confirm the session switch.
3. The key issue is CopilotKit's `<CopilotChat>` maintains its own internal message state. We need to force it to reset when the session changes by using a `key` prop tied to the session ID.

**Files to modify**:
- `app/components/Chat/ChatView.tsx` — add `key={session.id}` to `<CopilotChat>` so it resets when session changes.

---

## Bug 4: "+ New Session" in Home Screen Opens Existing Session

**Symptom**: Clicking "+ New Session" on the session list screen navigates to what appears to be an existing session instead of a fresh one.

**Root Cause**: `createSession()` creates a new session and immediately sets it as `activeSession`, which switches the view to chat. **However**, `<CopilotChat>` retains its internal message state from the previous session because it doesn't know about session changes. The user sees old messages in what should be a new session.

**Fix**: Same as Bug 3 — add `key={session.id}` to `<CopilotChat>` component so React fully remounts it when switching sessions, clearing all internal state.

**Files to modify**:
- `app/components/Chat/ChatView.tsx` — add `key={session.id}` to `<CopilotChat>`.

---

## Bug 5: Session Name Format Should Be `YYYY-MMM-DD HH:MM:SS`

**Symptom**: Session names are generated as `Chat Feb 9 3:42 PM` instead of `YYYY-MMM-DD HH:MM:SS` format.

**Root Cause**: The `generateSessionName()` function in `SessionContext.tsx` uses:
```ts
`Chat ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${now.toLocaleTimeString(...)}`
```

**Fix**: Change the format to produce `YYYY-MMM-DD HH:MM:SS`:
```ts
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
```

Example output: `2026-Feb-09 14:35:22`

**Files to modify**:
- `app/contexts/SessionContext.tsx` — rewrite `generateSessionName()`.

---

## Bug 6: Should Start Agent via `agent.py` Not `main.py`

**Symptom**: User expects the agent to be started directly from `agent.py` without needing a separate `main.py` wrapper.

**Root Cause**: Currently the architecture uses:
- `adk_web_agent/agent.py` — defines agents only (no server)
- `adk_web_agent/main.py` — wraps with FastAPI + `ag_ui_adk`

The user wants `agent.py` to be the single entrypoint that defines agents AND runs the server.

**Fix**: Merge the FastAPI server code from `main.py` into `agent.py`. Add `if __name__ == "__main__"` block to `agent.py` so it can be run directly. Keep the agent definitions, add the FastAPI server setup at the bottom.

**Files to modify**:
- `adk_web_agent/agent.py` — add FastAPI server code at bottom with `if __name__ == "__main__"` block.
- `adk_web_agent/main.py` — update to import from agent.py (keep for backward compatibility) or redirect.
- `README.md` — update startup instructions to reference `agent.py`.

---

## Bug 7: Agent Should Run with `include_thoughts=True`

**Symptom**: Agent does not emit thinking/reasoning data. The `ag_ui_adk` library supports thought events but needs `include_thoughts=True` configuration on the LlmAgent.

**Root Cause**: The `root_agent` and sub-agents in `agent.py` do not have `generate_content_config` set with `ThinkingConfig(include_thoughts=True)`.

**Fix**: Add `generate_content_config` with thinking configuration to the `root_agent` (and optionally sub-agents):
```python
from google.genai import types

root_agent = LlmAgent(
    ...
    generate_content_config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(
            include_thoughts=True,
            thinking_budget=1024,
        )
    ),
)
```

**Files to modify**:
- `adk_web_agent/agent.py` — add `generate_content_config` with `ThinkingConfig` to all agents.

---

## Bug 8: Verify Multi-Agent Architecture per PRD

**Symptom**: User wants confirmation the architecture matches PRD requirements for multi-agent orchestration with sub-agents.

**Analysis**: The current setup in `agent.py` **does** match the PRD:
- `root_agent` (Main Orchestrator) with `sub_agents=[research_agent, analysis_agent, summary_agent]`
- Each sub-agent has its own tools, model, description, and instruction
- ADK's `LlmAgent` with `sub_agents` parameter correctly delegates to sub-agents

**Verification items**:
1. ✅ Root agent orchestrates sub-agents (confirmed via `sub_agents` parameter)
2. ✅ 3 specialized sub-agents (research, analysis, summary)
3. ✅ Each has distinct tools and instructions
4. ✅ Sequential/parallel execution supported by ADK's orchestration
5. ⚠️ Missing `generate_content_config` with thinking (fixed in Bug 7)

**No additional code changes needed** beyond Bug 7 fixes. Will validate by sending a test request and confirming sub-agent delegation occurs.

---

## Execution Order

| Step | Bug | Priority | Dependency |
|------|-----|----------|------------|
| 1 | Bug 1 | High | None — blocks clean page load |
| 2 | Bug 5 | Low | None — simple format fix |
| 3 | Bug 3 & 4 | High | None — CopilotChat key fix |
| 4 | Bug 6 & 7 | High | None — backend agent changes |
| 5 | Bug 2 | High | Depends on Bug 7 (thoughts must be enabled) |
| 6 | Bug 8 | Medium | Depends on Bug 6 & 7 |

## Validation Plan

After all fixes:
1. **Build test**: `npm run build` must pass without errors
2. **Hydration test**: No console errors on page load (Bug 1)
3. **Session format test**: New session names in `YYYY-MMM-DD HH:MM:SS` format (Bug 5)
4. **New session test**: Click "+ New Session" → fresh empty chat (Bug 3 & 4)
5. **Backend start test**: Start from `agent.py` with thinking enabled (Bug 6 & 7)
6. **Thoughts test**: Send message → toggle thoughts panel → see agent reasoning (Bug 2)
7. **Multi-agent test**: Send complex query → verify sub-agent delegation (Bug 8)
8. **Agent response test**: `curl` the endpoint → verify streaming response with thinking events
