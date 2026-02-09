# Implementation Plan: Real-time Agent Reasoning Stream

## Overview

Replace the current **fake/simulated** thought stream (which guesses sub-agents by keyword-matching assistant message content in `ChatView.tsx` → `buildExecutionsFromMessages()`) with a **real-time streaming** implementation using the AG-UI protocol, `ToolContext.state` on the ADK backend, and `useCoAgent` / `useCoAgentStateRender` hooks on the frontend.

---

## Current State Analysis

### What exists today (is fake)

- **`ChatView.tsx`** contains `buildExecutionsFromMessages()` which parses completed assistant messages and keyword-matches words like "research", "analy", "summar" to fabricate sub-agent execution data.
- **`ThoughtsPanel.tsx`** receives these fabricated `AgentExecution[]` and renders them.
- **No real state flows from the ADK backend** — the panel is purely cosmetic.

### What the PRD asks for

- Real-time `thought_stream` emitted from the backend as the agent thinks and works.
- Streamed into the Thoughts sidebar via AG-UI protocol → `useCoAgent` hook.
- Shows active (pulsing) vs completed (checkmark) vs error (red) steps.
- Auto-scrolls, persists across the session.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  ADK Backend (Python/FastAPI)                               │
│                                                             │
│  root_agent                                                 │
│   ├── emit_thought() tool  →  writes to ToolContext.state   │
│   ├── research_agent  (instrumented with emit_thought)      │
│   ├── analysis_agent  (instrumented with emit_thought)      │
│   └── summary_agent   (instrumented with emit_thought)      │
│                                                             │
│  State flows via AG-UI protocol (ag_ui_adk)                 │
└────────────────────────┬────────────────────────────────────┘
                         │  SSE / WebSocket
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Next.js Frontend (React)                                   │
│                                                             │
│  useCoAgent<AgentState>({ name: "my_agent" })               │
│   └── state.thought_stream: ThoughtStep[]                   │
│                                                             │
│  ThoughtsPanel (sidebar)                                    │
│   ├── Renders thought_stream from useCoAgent state          │
│   ├── Active step → pulsing blue indicator                  │
│   ├── Completed step → green checkmark                      │
│   ├── Error step → red warning                              │
│   └── Auto-scroll to latest                                 │
│                                                             │
│  useCoAgentStateRender (optional, in-chat progress)         │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Backend — State Schema & Thought Emission

### 1.1 Define the `thought_stream` state structure

**File:** `adk_web_agent/agent.py` (top of file, new imports + schema)

Add a Pydantic model and a helper tool that sub-agents use to report their status:

```python
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

class ThoughtStep(BaseModel):
    id: str
    agent_name: str          # "research_agent", "analysis_agent", etc.
    message: str             # "Searching knowledge base..."
    status: str              # "running" | "completed" | "error"
    timestamp: str           # ISO 8601
    duration_ms: Optional[int] = None
```

### 1.2 Create `emit_thought` tool function

**File:** `adk_web_agent/tools/thought_tools.py` (new file)

```python
import uuid
from datetime import datetime
from google.adk.tools import ToolContext

def emit_thought(tool_context: ToolContext, agent_name: str, message: str, status: str = "running") -> dict:
    """Emit a thought step to the frontend thought stream.

    Args:
        tool_context: The tool context for accessing state.
        agent_name: Name of the agent emitting the thought.
        message: Description of what the agent is doing.
        status: One of "running", "completed", "error".

    Returns:
        dict with the thought step id.
    """
    thought_stream = tool_context.state.get("thought_stream", [])

    # If status is "completed" or "error", find and update existing running thought
    if status in ("completed", "error"):
        for thought in thought_stream:
            if thought["agent_name"] == agent_name and thought["status"] == "running":
                thought["status"] = status
                thought["message"] = message
                break
    else:
        # Add new running thought
        step = {
            "id": str(uuid.uuid4())[:8],
            "agent_name": agent_name,
            "message": message,
            "status": status,
            "timestamp": datetime.now().isoformat(),
        }
        thought_stream.append(step)

    tool_context.state["thought_stream"] = thought_stream
    return {"status": "ok", "thought_id": thought_stream[-1]["id"]}
```

### 1.3 Instrument each sub-agent's tools

**Files to modify:**
- `adk_web_agent/tools/research_tools.py`
- `adk_web_agent/tools/analysis_tools.py`
- `adk_web_agent/tools/summary_tools.py`

**Strategy:** Add `tool_context: ToolContext` parameter to each tool function. At the start of each tool, call a helper to write a "running" thought; at the end, write "completed".

Example for `search_knowledge_base`:

```python
from google.adk.tools import ToolContext
import uuid
from datetime import datetime

def search_knowledge_base(query: str, tool_context: ToolContext) -> str:
    """Search the internal knowledge base..."""

    # Emit "running" thought
    thought_stream = tool_context.state.get("thought_stream", [])
    thought_id = str(uuid.uuid4())[:8]
    thought_stream.append({
        "id": thought_id,
        "agent_name": "research_agent",
        "message": f"Searching knowledge base for: {query}",
        "status": "running",
        "timestamp": datetime.now().isoformat(),
    })
    tool_context.state["thought_stream"] = thought_stream

    # ... existing logic ...

    # Emit "completed" thought
    for t in thought_stream:
        if t["id"] == thought_id:
            t["status"] = "completed"
            t["message"] = f"Knowledge base search completed — {results['results_found']} results found"
            break
    tool_context.state["thought_stream"] = thought_stream

    return json.dumps(results, indent=2)
```

Apply the same pattern to all 5 tool functions:
- `search_knowledge_base` → "Searching knowledge base…" → "KB search completed"
- `web_search` → "Searching the web…" → "Web search completed"
- `analyze_data` → "Analyzing data…" → "Analysis completed"
- `calculate_metrics` → "Calculating metrics…" → "Metrics calculated"
- `format_report` → "Formatting report…" → "Report formatted"
- `extract_key_points` → "Extracting key points…" → "Key points extracted"

### 1.4 Add a root-level thought emission tool

Give the **root_agent** access to `emit_thought` so it can report orchestration decisions:

```python
root_agent = LlmAgent(
    ...
    tools=[emit_thought],    # add this
    sub_agents=[research_agent, analysis_agent, summary_agent],
    ...
)
```

And update root_agent instruction to include:
```
Before delegating to any sub-agent, use the emit_thought tool to report:
- agent_name: "root_agent"
- message: a brief description of what you're about to do (e.g. "Delegating to Research Agent for information gathering")
- status: "running"
After receiving results, emit a completed thought.
```

---

## Phase 2: Frontend — Subscribe to Real State

### 2.1 Define TypeScript `AgentState` type

**File:** `app/types/agent.ts` (add to existing file)

```typescript
// Real-time state from the ADK backend via AG-UI protocol
export interface ThoughtStep {
  id: string;
  agent_name: string;
  message: string;
  status: 'running' | 'completed' | 'error';
  timestamp: string;
  duration_ms?: number;
}

export interface CoAgentState {
  thought_stream: ThoughtStep[];
}
```

### 2.2 Create a `useAgentThoughts` hook

**File:** `app/hooks/useAgentThoughts.ts` (new file)

This hook wraps `useCoAgent` and exposes the thought stream for the ThoughtsPanel:

```typescript
'use client';

import { useCoAgent } from '@copilotkit/react-core';
import type { CoAgentState } from '../types/agent';

export function useAgentThoughts() {
  const { state } = useCoAgent<CoAgentState>({
    name: 'my_agent',  // must match CopilotRuntime agent name
    initialState: {
      thought_stream: [],
    },
  });

  return {
    thoughtStream: state.thought_stream ?? [],
    hasThoughts: (state.thought_stream?.length ?? 0) > 0,
    activeThoughts: (state.thought_stream ?? []).filter(t => t.status === 'running'),
    completedThoughts: (state.thought_stream ?? []).filter(t => t.status === 'completed'),
  };
}
```

### 2.3 Rewrite `ThoughtsPanel.tsx` to use real state

**File:** `app/components/AgentThoughts/ThoughtsPanel.tsx`

Replace the prop-driven `executions: AgentExecution[]` approach with the `useAgentThoughts` hook:

```tsx
'use client';

import React, { useRef, useEffect } from 'react';
import { Box, Typography, useTheme, Fade } from '@mui/material';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { useAgentThoughts } from '../../hooks/useAgentThoughts';
import type { ThoughtStep } from '../../types/agent';

// Maps agent_name to display label + color
const agentMeta: Record<string, { label: string; color: string }> = {
  root_agent:      { label: 'Orchestrator',    color: '#007AFF' },
  research_agent:  { label: 'Research Agent',  color: '#5856D6' },
  analysis_agent:  { label: 'Analysis Agent',  color: '#FF9500' },
  summary_agent:   { label: 'Summary Agent',   color: '#34C759' },
};

function ThoughtItem({ step }: { step: ThoughtStep }) {
  const theme = useTheme();
  const meta = agentMeta[step.agent_name] || { label: step.agent_name, color: '#9E9E9E' };

  return (
    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', py: 1 }}>
      {/* Status icon */}
      <Box sx={{ pt: 0.25 }}>
        {step.status === 'running' && (
          <AutorenewIcon sx={{ fontSize: 18, color: meta.color,
            animation: 'spin 1s linear infinite',
            '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } }
          }} />
        )}
        {step.status === 'completed' && (
          <CheckCircleOutlineIcon sx={{ fontSize: 18, color: '#34C759' }} />
        )}
        {step.status === 'error' && (
          <ErrorOutlineIcon sx={{ fontSize: 18, color: '#FF3B30' }} />
        )}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 12, color: meta.color }}>
          {meta.label}
        </Typography>
        <Typography variant="body2" sx={{ fontSize: 13, color: theme.palette.text.secondary, lineHeight: 1.4 }}>
          {step.message}
        </Typography>
      </Box>
    </Box>
  );
}

export default function ThoughtsPanel() {
  const theme = useTheme();
  const { thoughtStream, hasThoughts } = useAgentThoughts();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new thoughts
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thoughtStream.length]);

  return (
    <Fade in>
      <Box sx={{
        width: { xs: '100%', md: 420 },
        maxWidth: { md: '40vw' },
        borderLeft: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', alignItems: 'center', gap: 1 }}>
          <PsychologyOutlinedIcon sx={{ color: theme.palette.primary.main, fontSize: 22 }} />
          <Typography variant="h3" sx={{ fontWeight: 600, fontSize: 16 }}>Agent Thoughts</Typography>
        </Box>

        {/* Content */}
        <Box ref={scrollRef} sx={{ flex: 1, overflowY: 'auto', px: 2, py: 2 }}>
          {!hasThoughts ? (
            <Box sx={{ textAlign: 'center', py: 6, color: theme.palette.text.secondary }}>
              <PsychologyOutlinedIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1.5 }} />
              <Typography variant="body2" sx={{ opacity: 0.6 }}>
                Agent reasoning steps will stream here in real-time when you send a message.
              </Typography>
            </Box>
          ) : (
            thoughtStream.map((step) => <ThoughtItem key={step.id} step={step} />)
          )}
        </Box>
      </Box>
    </Fade>
  );
}
```

### 2.4 Update `ChatView.tsx`

Remove the fake `buildExecutionsFromMessages()` function and the `agentExecutions` useMemo. Change `ThoughtsPanel` to no longer receive props (it uses the hook internally now):

```diff
- import type { AgentExecution, SubAgentExecution } from '../../types/agent';
  ...
- function buildExecutionsFromMessages(...) { ... }  // DELETE ~100 lines
  ...
  export default function ChatView(...) {
-   const agentExecutions = useMemo(
-     () => buildExecutionsFromMessages(visibleMessages, isLoading),
-     [visibleMessages, isLoading],
-   );
    ...
    {thoughtsEnabled && (
-     <ThoughtsPanel executions={agentExecutions} />
+     <ThoughtsPanel />
    )}
  }
```

### 2.5 (Optional) Add in-chat progress with `useCoAgentStateRender`

**File:** `app/components/Chat/ChatView.tsx` (add inside component)

```typescript
import { useCoAgentStateRender } from '@copilotkit/react-core';
import type { CoAgentState } from '../../types/agent';

// Inside ChatView component:
useCoAgentStateRender<CoAgentState>({
  name: 'my_agent',
  render: ({ state, status }) => {
    const running = (state.thought_stream ?? []).filter(t => t.status === 'running');
    if (!running.length) return null;
    return (
      <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'action.hover', my: 1 }}>
        {running.map(t => (
          <Typography key={t.id} variant="body2" sx={{ fontSize: 12, color: 'text.secondary' }}>
            ⏳ {t.message}
          </Typography>
        ))}
      </Box>
    );
  },
});
```

This shows a small progress indicator directly inside the chat bubbles while the agent is working (separate from the sidebar).

---

## Phase 3: Cleanup & Polish

### 3.1 Files to delete or simplify

| File | Action |
|------|--------|
| `AgentTimeline.tsx` | **Keep** but optional — can be repurposed to show a timeline view of `thought_stream` |
| `MainAgentReasoning.tsx` | **Remove** — replaced by real streamed data |
| `SubAgentCard.tsx` | **Remove** — replaced by `ThoughtItem` in new ThoughtsPanel |

### 3.2 Remove unused types

In `app/types/agent.ts`, the following types become unused and can be removed:
- `ProcessingStep`
- `AgentMetrics`
- `SubAgentExecution`
- `AgentExecution`

Keep `AgentStatus` as it's still useful.

### 3.3 Theme integration

The existing `app/theme/agentColors.ts` likely has color definitions. Wire the `agentMeta` colors in `ThoughtsPanel` to use theme colors for consistency.

---

## File Change Summary

| # | File | Action | Description |
|---|------|--------|-------------|
| 1 | `adk_web_agent/tools/thought_tools.py` | **Create** | `emit_thought` tool function |
| 2 | `adk_web_agent/tools/__init__.py` | **Edit** | Export `emit_thought` |
| 3 | `adk_web_agent/tools/research_tools.py` | **Edit** | Add `tool_context` param, emit thoughts |
| 4 | `adk_web_agent/tools/analysis_tools.py` | **Edit** | Add `tool_context` param, emit thoughts |
| 5 | `adk_web_agent/tools/summary_tools.py` | **Edit** | Add `tool_context` param, emit thoughts |
| 6 | `adk_web_agent/agent.py` | **Edit** | Add `emit_thought` to root_agent tools, update instructions |
| 7 | `app/types/agent.ts` | **Edit** | Add `ThoughtStep`, `CoAgentState` types |
| 8 | `app/hooks/useAgentThoughts.ts` | **Create** | Hook wrapping `useCoAgent` |
| 9 | `app/components/AgentThoughts/ThoughtsPanel.tsx` | **Rewrite** | Use `useAgentThoughts` hook, render real stream |
| 10 | `app/components/Chat/ChatView.tsx` | **Edit** | Remove fake `buildExecutionsFromMessages`, simplify |
| 11 | `app/components/AgentThoughts/MainAgentReasoning.tsx` | **Delete** | No longer needed |
| 12 | `app/components/AgentThoughts/SubAgentCard.tsx` | **Delete** | No longer needed |

---

## Execution Order

1. **Backend first** — changes 1–6 (Python/ADK side)
2. **Frontend types & hooks** — changes 7–8
3. **Frontend components** — changes 9–10
4. **Cleanup** — changes 11–12
5. **Test end-to-end** — restart both servers, send a message, verify thoughts stream in sidebar

---

## Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| Use `ToolContext.state` (not `copilotkit_emit_state`) | ADK uses `ag_ui_adk` which manages state via `ToolContext`, not LangGraph's `RunnableConfig`. State written to `tool_context.state` automatically flows through the AG-UI protocol to the frontend. |
| Use `useCoAgent` (not `useCoAgentStateRender` alone) | `useCoAgent` gives us reactive access to `state.thought_stream` anywhere in the component tree (sidebar). `useCoAgentStateRender` is optionally used for in-chat progress only. |
| Emit thoughts inside each tool function | Most reliable approach — each tool knows when it starts/finishes. The alternative (node-level instrumentation) isn't available in ADK's `LlmAgent` architecture. |
| `ThoughtsPanel` uses hook internally | Cleaner API — the panel manages its own data subscription instead of receiving props from a parent that had to fabricate data. |

---

## Risk & Mitigation

| Risk | Mitigation |
|------|------------|
| `ToolContext.state` changes may not propagate in real-time via `ag_ui_adk` | Verify with `ag_ui_adk >= 0.4.2`. If not supported, fall back to adding a custom SSE endpoint that emits thought events separately. |
| `useCoAgent` may not receive updates if agent name doesn't match | Ensure `name: "my_agent"` in `useCoAgent` matches the agent key `"my_agent"` in `CopilotRuntime` config in `route.ts`. |
| Thought stream grows unbounded during long sessions | Add a max-length cap (e.g., keep last 100 thoughts) in the `emit_thought` tool. |
