# Implementation Plan v4 — Gemini Thinking, Thought Summaries & Agent Delegation

> Based on [PRD_v4.md](PRD_v4.md) | Status: **Draft — Pending Review**

---

## Current State Summary

### What exists today

**Backend (adk-agent-quickstart)**
- 4 agents (`root_agent`, `research_agent`, `analysis_agent`, `summary_agent`) using **`gemini-2.5-flash`**
- Thinking config: `include_thoughts=True`, `thinking_budget=1024` — set but **thought parts from LLM responses are never captured or forwarded**
- Custom tool-based thought emission system (`emit_thought` + `_emit_tool_thought`) writing to `state["thought_stream"]`
- `ADKAgent` uses `use_in_memory_services=True`, hardcoded `user_id="demo_user"`
- Database schema exists (`messages`, `agent_executions`) but **lacks `thought_summary`, `delegated_agent`, `delegation_chain` columns**

**Frontend (copilotkit-app-quickstart)**
- `ThoughtsPanel` renders a flat timeline of tool-emitted `ThoughtStep` items from `useCoAgent` state
- `AgentTimeline` component exists but is **not wired up** anywhere
- `ChatView` uses CopilotKit's `<CopilotChat>` with default message rendering — **no thought summary blocks or delegation badges on messages**
- `CoAgentState` type only has `thought_stream: ThoughtStep[]` — no `thought_summary`, `delegated_agent`, `delegation_chain`
- `agentColors.ts` has no colors for thought summaries or delegation badges
- `x-show-thoughts` header is read in `route.ts` but **never sent** from the frontend

### What needs to change

| # | Gap | Impact |
|---|-----|--------|
| 1 | Model `gemini-2.5-flash` → `gemini-3-flash-preview` | All 4 agents |
| 2 | `thinking_budget=1024` → `thinking_level="low"` | All 4 agents |
| 3 | Gemini thought summaries are not captured from LLM response parts | Backend doesn't extract `part.thought` |
| 4 | No mechanism to forward thought summaries to the frontend in real-time | AG-UI / CoAgent state doesn't carry thought summaries |
| 5 | No delegation tracking — we don't know which sub-agent produced the response | Need ADK event inspection or state tracking |
| 6 | DB schema missing `thought_summary`, `delegated_agent`, `delegation_chain`, `thinking_tokens` columns | Migration needed |
| 7 | Frontend `CoAgentState` only has `thought_stream` | Needs `thought_summary`, `delegated_agent`, `delegation_chain` |
| 8 | `ThoughtsPanel` is a flat timeline — needs four-tier hierarchy | Major UI refactor |
| 9 | No thought summary block displayed before assistant messages | New component + CopilotKit custom rendering |
| 10 | No delegation badge on messages | New component |
| 11 | `agentColors.ts` missing thought summary and delegation badge colors | Theme update |
| 12 | Thought toggle state not forwarded as header to backend | Wire up in `page.tsx` |

---

## Implementation Phases

### Phase 1 — Backend: Model Upgrade & Thinking Config
**Scope**: Update model name and thinking configuration across all agents  
**Risk**: Low (config-only changes, but model availability must be verified)

#### 1.1 Update model name in all agents
**File**: `adk_web_agent/agent.py`

Change all 4 agents from:
```python
model="gemini-2.5-flash"
```
to:
```python
model="gemini-3-flash-preview"
```

#### 1.2 Switch from `thinking_budget` to `thinking_level`
**File**: `adk_web_agent/agent.py`

Change all 4 agents' `GenerateContentConfig` from:
```python
thinking_config=types.ThinkingConfig(
    include_thoughts=True,
    thinking_budget=1024,
)
```
to:
```python
thinking_config=types.ThinkingConfig(
    include_thoughts=True,
    thinking_level="low",
)
```

#### 1.3 Verify SDK compatibility
- Check that `google-adk>=1.24.1` and the underlying `google-genai` SDK support `thinking_level` parameter
- If `thinking_level` is not yet available in the current SDK version, keep `thinking_budget=1024` as fallback and pin the minimum SDK version in `pyproject.toml` once it's available
- Test with a simple prompt to confirm the model name resolves and returns responses

**Files modified**: `agent.py`  
**Estimated effort**: Small

---

### Phase 2 — Backend: Capture & Forward Thought Summaries + Delegation
**Scope**: Intercept Gemini thought summaries from LLM responses and track agent delegation, forwarding both via ADK agent state  
**Risk**: Medium — depends on how AG-UI/ADK surfaces Gemini response parts

#### 2.1 Investigate how ADK surfaces thought parts
Before writing code, determine:
1. Does `google-adk` expose `part.thought` fields via the AG-UI protocol automatically?
2. Does `useCoAgent` state receive thought summary parts from `include_thoughts=True`?
3. Or do we need a custom callback/middleware to intercept the LLM response and extract thought parts?

**Action**: Write a minimal test — send a prompt with `include_thoughts=True`, inspect the raw AG-UI SSE stream for `thought` fields. If ADK already surfaces them, skip 2.2 and go directly to state injection.

#### 2.2 Create thought summary extraction middleware (if needed)
If ADK does NOT automatically surface thought summaries, we need to intercept them.

**Option A — ADK `before_model_callback` / `after_model_callback`**:
Use ADK agent callbacks to intercept the `LlmResponse` and extract `part.thought` fields, injecting them into `tool_context.state`.

**Option B — Custom wrapper around the agent's generate call**:
Wrap the agent execution to post-process the response and extract thought summary parts.

**New file**: `adk_web_agent/tools/thinking_middleware.py`
```python
def after_model_callback(callback_context, llm_response):
    """Extract thought summary from Gemini response parts."""
    thought_summary = None
    for part in llm_response.content.parts:
        if hasattr(part, 'thought') and part.thought and part.text:
            thought_summary = part.text
            break
    
    if thought_summary:
        # Inject into agent state for AG-UI forwarding
        callback_context.state["thought_summary"] = thought_summary
        # Also append to thought_stream for timeline display
        callback_context.state.setdefault("thought_stream", []).append({
            "id": generate_id(),
            "agent_name": callback_context.agent_name,
            "message": thought_summary,
            "status": "completed",
            "timestamp": now_iso(),
            "is_thought_summary": True,  # Flag to distinguish from tool-emitted thoughts
        })
    
    return llm_response  # Pass through unchanged (preserve thought signatures!)
```

#### 2.3 Track agent delegation via state
Add delegation tracking so the frontend knows which agent is currently handling work.

**Approach**: Use ADK's `before_agent_callback` / `after_agent_callback` to update `state["delegated_agent"]` and `state["delegation_chain"]` as execution flows through the agent tree.

**File**: `adk_web_agent/tools/thinking_middleware.py` (extend)
```python
def before_agent_callback(callback_context):
    """Track which agent is currently handling the work."""
    chain = callback_context.state.get("delegation_chain", [])
    chain.append(callback_context.agent_name)
    callback_context.state["delegation_chain"] = chain
    callback_context.state["delegated_agent"] = callback_context.agent_name

def after_agent_callback(callback_context):
    """Pop agent from delegation chain when done."""
    chain = callback_context.state.get("delegation_chain", [])
    if chain and chain[-1] == callback_context.agent_name:
        chain.pop()
    callback_context.state["delegation_chain"] = chain
    callback_context.state["delegated_agent"] = chain[-1] if chain else "root_agent"
```

#### 2.4 Wire callbacks into all agents
**File**: `adk_web_agent/agent.py`

Add the callbacks to all agent definitions:
```python
from adk_web_agent.tools.thinking_middleware import (
    after_model_callback,
    before_agent_callback,
    after_agent_callback,
)

root_agent = LlmAgent(
    ...
    before_agent_callback=before_agent_callback,
    after_agent_callback=after_agent_callback,
    after_model_callback=after_model_callback,
    ...
)
# Same for research_agent, analysis_agent, summary_agent
```

#### 2.5 Ensure thought signatures are preserved
**Critical rule**: The `after_model_callback` must **return the response unchanged**. We only _read_ the thought parts — never strip, modify, or merge them. The SDK handles thought signature circulation automatically.

**Files modified**: `agent.py`, new `tools/thinking_middleware.py`  
**Files created**: `tools/thinking_middleware.py`  
**Estimated effort**: Medium — requires ADK callback API investigation

---

### Phase 3 — Database Schema Migration
**Scope**: Add columns for thought summaries and delegation tracking  
**Risk**: Low (additive schema changes)

#### 3.1 Add new columns to `messages` table
```sql
ALTER TABLE messages ADD COLUMN thought_summary TEXT;
ALTER TABLE messages ADD COLUMN delegated_agent TEXT;
ALTER TABLE messages ADD COLUMN delegation_chain TEXT;  -- JSON array
```

#### 3.2 Add new columns to `agent_executions` table
```sql
ALTER TABLE agent_executions ADD COLUMN thought_summary TEXT;
ALTER TABLE agent_executions ADD COLUMN delegated_agent TEXT;
ALTER TABLE agent_executions ADD COLUMN delegation_chain TEXT;  -- JSON array
ALTER TABLE agent_executions ADD COLUMN thinking_tokens INTEGER;
```

#### 3.3 Update schema.sql with new columns
Update `adk_web_agent/database/schema.sql` to include the new columns in the CREATE TABLE statements so new databases are created correctly.

#### 3.4 Add migration logic to `db.py`
Update `init_db()` to detect existing databases and run ALTER TABLE statements if columns don't exist yet.

**Files modified**: `database/schema.sql`, `database/db.py`  
**Estimated effort**: Small

---

### Phase 4 — Frontend: Types & State Expansion
**Scope**: Extend TypeScript types and CoAgent state to carry thought summaries and delegation data  
**Risk**: Low

#### 4.1 Update `CoAgentState` type
**File**: `app/types/agent.ts`

```typescript
export interface CoAgentState {
  thought_stream: ThoughtStep[];
  thought_summary?: string;           // Latest Gemini thought summary
  delegated_agent?: string;           // Currently active agent name
  delegation_chain?: string[];        // Full delegation path
}
```

#### 4.2 Update `ThoughtStep` type
**File**: `app/types/agent.ts`

Add flag to distinguish Gemini thought summaries from tool-emitted thoughts:
```typescript
export interface ThoughtStep {
  id: string;
  agent_name: string;
  message: string;
  status: 'running' | 'completed' | 'error';
  timestamp: string;
  duration_ms?: number;
  is_thought_summary?: boolean;   // True if this is a Gemini thought summary
}
```

#### 4.3 Update `AgentExecution` and `SubAgentExecution` types
Add `thoughtSummary`, `delegatedAgent`, `delegationChain`, and `thinkingTokens` fields per PRD_v4 spec.

#### 4.4 Update `useAgentThoughts` hook
**File**: `app/hooks/useAgentThoughts.ts`

Expand the hook to expose thought summaries and delegation info:
```typescript
export function useAgentThoughts() {
  const { state } = useCoAgent<CoAgentState>({ ... });
  
  return {
    thoughtStream,
    thoughtSummary: state.thought_summary ?? null,
    delegatedAgent: state.delegated_agent ?? null,
    delegationChain: state.delegation_chain ?? [],
    hasThoughts: thoughtStream.length > 0,
    // ... existing filters
  };
}
```

**Files modified**: `types/agent.ts`, `hooks/useAgentThoughts.ts`  
**Estimated effort**: Small

---

### Phase 5 — Frontend: Theme & Color Updates
**Scope**: Add thought summary and delegation badge colors to the theme  
**Risk**: Low

#### 5.1 Add thought summary colors
**File**: `app/theme/agentColors.ts`

```typescript
// Light mode
thoughtSummary: '#F3E8FF',
thoughtSummaryBorder: '#D1B3FF',
thoughtSummaryText: '#4A148C',

// Dark mode
thoughtSummary: '#2D1B4E',
thoughtSummaryBorder: '#7C4DFF',
thoughtSummaryText: '#CE93D8',
```

#### 5.2 Add delegation badge colors
```typescript
// Light mode
delegationBadge: '#E0F2F1',
delegationBadgeBorder: '#80CBC4',
delegationBadgeText: '#004D40',

// Dark mode
delegationBadge: '#1A3A36',
delegationBadgeBorder: '#4DB6AC',
delegationBadgeText: '#80CBC4',
```

**Files modified**: `theme/agentColors.ts`  
**Estimated effort**: Small

---

### Phase 6 — Frontend: New UI Components
**Scope**: Build the two new display components for thought summaries and delegation badges  
**Risk**: Medium — must integrate with CopilotKit's message rendering

#### 6.1 Create `ThoughtSummaryBlock` component
**File**: `app/components/Chat/ThoughtSummaryBlock.tsx`

A collapsible block displayed **before** each assistant message (when thoughts toggle is ON) showing the Gemini thought summary.

```
┌─────────────────────────────────────────────┐
│ 💭 Model Thinking                      [▼]  │
├─────────────────────────────────────────────┤
│ "I need to analyze the user's question...   │
│  I'll delegate to Research Agent first..."  │
└─────────────────────────────────────────────┘
```

Design:
- Light purple/blue background (`thoughtSummary` color)
- Left border accent (3px `thoughtSummaryBorder`)
- Brain icon (💭)
- Collapsible — default expanded for latest message, collapsed for older
- Italic text, 13px
- Graceful empty state when no thought summary available

#### 6.2 Create `AgentDelegationBadge` component
**File**: `app/components/Chat/AgentDelegationBadge.tsx`

A pill-shaped badge showing the delegation chain as a breadcrumb.

```
🔀 Root Agent → Research Agent → Summary Agent
```

Design:
- Teal background (`delegationBadge` color)
- Pill shape (border-radius: 12px)
- Arrow separators between agent names
- Last agent in chain is bold/highlighted (active)
- 12px font, compact

#### 6.3 Integrate into CopilotKit message rendering
**File**: `app/components/Chat/ChatView.tsx`

CopilotKit's `<CopilotChat>` uses its own message rendering. We need to inject our components.

**Approach**: Use CopilotKit's `makeAssistantMessage` / message rendering customization:
- Option A: Use `<CopilotChat instructions={...} makeAssistantMessage={...}>` if available
- Option B: Use `useCoAgentStateRender` to render thought blocks alongside the in-chat progress indicator
- Option C: Switch from `<CopilotChat>` to `<CopilotSidebar>` or custom rendering with `useCopilotChat` hook for full control

**Investigation needed**: Check CopilotKit v1.51+ API for message customization options. The chosen approach affects how thought summaries appear relative to each message.

**Fallback**: If CopilotKit doesn't support per-message customization, display thought summaries in the `ThoughtsPanel` (right side) instead of inline with messages, and show a delegation badge as part of the `useCoAgentStateRender` indicator.

**Files created**: `ThoughtSummaryBlock.tsx`, `AgentDelegationBadge.tsx`  
**Files modified**: `ChatView.tsx`  
**Estimated effort**: Medium-Large

---

### Phase 7 — Frontend: ThoughtsPanel Refactor
**Scope**: Upgrade the right-side panel to a four-tier information hierarchy  
**Risk**: Medium

#### 7.1 Add Thought Summary section to panel
At the top of `ThoughtsPanel`, show the latest Gemini thought summary in a prominent card if toggle is ON.

#### 7.2 Add Agent Delegation indicator
Below the thought summary, show the current delegation chain as a tree:
```
Root Agent
  └─→ Research Agent      [Active]
        └─→ (next: Analysis Agent)
```

#### 7.3 Keep existing tool-emitted timeline
The existing `ThoughtStep` timeline continues to show tool-level execution steps below the delegation indicator.

#### 7.4 Wire up `AgentTimeline` component
The existing `AgentTimeline.tsx` is currently unused. Integrate it into the panel as an optional "Execution Graph" view, switchable from the flat timeline.

**Resulting panel structure**:
```
┌────────────────────────────────┐
│ 💭 Thought Summary        [▼] │  ← Tier 1: Gemini summary
├────────────────────────────────┤
│ 🔀 Delegation                 │  ← Tier 2: Agent delegation
│ Root → Research [Active]       │
├────────────────────────────────┤
│ Agent Execution Timeline       │  ← Tier 3: Tool-emitted steps
│ ● Research Agent: Searching... │
│ ✓ Research Agent: Found 12... │
│ ● Analysis Agent: Analyzing.. │
├────────────────────────────────┤
│ [Show Execution Graph]         │  ← Tier 4: Optional graph view
└────────────────────────────────┘
```

**Files modified**: `ThoughtsPanel.tsx`  
**Estimated effort**: Medium

---

### Phase 8 — Forward Thoughts Toggle State to Backend
**Scope**: Wire the toggle state so the backend knows whether to emit thought summaries  
**Risk**: Low

#### 8.1 Pass `thoughtsEnabled` to CopilotKit headers
**File**: `app/page.tsx`

The `copilotHeaders` object already passes JWT auth headers. Add:
```typescript
const copilotHeaders = useMemo(() => ({
  ...authHeaders,
  'x-show-thoughts': thoughtsEnabled ? 'true' : 'false',
}), [authHeaders, thoughtsEnabled]);
```

#### 8.2 Backend: Conditionally include thought summaries
**File**: `adk_web_agent/tools/thinking_middleware.py`

If `x-show-thoughts` header is `false`, still capture thoughts (for storage) but skip injecting into `state["thought_summary"]` to avoid unnecessary state updates.

> **Note**: Per PRD_v4, thought summaries should always be retrieved and stored regardless of toggle state. The toggle only controls UI visibility. So this step is optional — the frontend can simply hide the components when toggle is off.

**Decision**: Keep it simple — always retrieve thought summaries. Frontend hides them when toggle is off. No backend header check needed.

**Files modified**: `page.tsx`  
**Estimated effort**: Small

---

### Phase 9 — Testing & Validation
**Scope**: Verify all new features work end-to-end  
**Risk**: Low

#### 9.1 Backend verification
- [ ] Model `gemini-3-flash-preview` resolves and returns responses
- [ ] `thinking_level="low"` is accepted by SDK (or fallback to `thinking_budget`)
- [ ] `after_model_callback` fires and extracts thought summary from `part.thought`
- [ ] `before_agent_callback` / `after_agent_callback` correctly track delegation chain
- [ ] Thought signatures are preserved (no 400 errors on multi-turn with function calling)
- [ ] State updates (`thought_summary`, `delegated_agent`, `delegation_chain`) propagate via AG-UI

#### 9.2 Frontend verification
- [ ] `useAgentThoughts` hook returns `thoughtSummary`, `delegatedAgent`, `delegationChain`
- [ ] `ThoughtSummaryBlock` renders before assistant messages when toggle ON
- [ ] `ThoughtSummaryBlock` is hidden when toggle OFF
- [ ] `AgentDelegationBadge` shows correct chain
- [ ] `ThoughtsPanel` displays four-tier hierarchy
- [ ] Colors match light/dark theme specs
- [ ] Collapsible thought summary sections work
- [ ] No regression in existing thought stream

#### 9.3 Integration verification
- [ ] Send a multi-agent query → thought summary appears → delegation chain updates in real-time → response displays
- [ ] Toggle thoughts OFF → thought summary hidden but still stored
- [ ] Multiple messages in same session → each has its own thought summary
- [ ] Session switch → previous session's thoughts load correctly

---

## Phase Summary

| Phase | Scope | Effort | Risk | Dependencies |
|-------|-------|--------|------|-------------|
| 1 | Model upgrade + thinking config | Small | Low | None |
| 2 | Capture thought summaries + delegation (backend) | Medium | Medium | Phase 1 |
| 3 | Database schema migration | Small | Low | None (parallel with 1-2) |
| 4 | Frontend types & state expansion | Small | Low | Phase 2 (API shape) |
| 5 | Theme & color updates | Small | Low | None (parallel with 4) |
| 6 | New UI components (ThoughtSummaryBlock, DelegationBadge) | Medium-Large | Medium | Phases 4, 5 |
| 7 | ThoughtsPanel refactor | Medium | Medium | Phase 6 |
| 8 | Forward toggle state to backend | Small | Low | Phase 6 |
| 9 | Testing & validation | Medium | Low | All |

**Total estimated effort**: ~3-4 days of focused work

---

## Key Technical Decisions Needed

### Decision 1: How does ADK surface Gemini thought summary parts?
**Context**: `include_thoughts=True` is already set, but we don't know if ADK/AG-UI automatically forwards `part.thought` fields via `useCoAgent` state.  
**Options**:
- A) ADK surfaces them automatically → just read from state
- B) Need `after_model_callback` to intercept and inject into state  
**Action**: Test empirically in Phase 2.1 before writing middleware

### Decision 2: CopilotKit message customization approach
**Context**: We want thought summaries displayed inline _before_ each assistant message, but `<CopilotChat>` controls its own rendering.  
**Options**:
- A) Use CopilotKit's `AssistantMessage` customization API (if available)
- B) Use `useCoAgentStateRender` to inject a component into the chat stream
- C) Switch to `useCopilotChat` hook for full custom rendering (bigger refactor)
- D) Display thought summaries only in the right-side `ThoughtsPanel` (simpler, less disruptive)  
**Recommendation**: Start with Option D (panel-only), iterate to Option A/B if CopilotKit supports it

### Decision 3: `thinking_level` vs `thinking_budget` SDK support
**Context**: PRD_v4 specifies `thinking_level="low"` but current SDK uses `thinking_budget`. These are different APIs — `thinking_level` is for Gemini 3, `thinking_budget` is for Gemini 2.5.  
**Action**: Check `google-genai` SDK version for `thinking_level` support. If not available yet, use `thinking_budget=1024` as equivalent low-effort thinking.

---

## Files Changed Summary

### Backend (adk-agent-quickstart)

| File | Action | Phase |
|------|--------|-------|
| `adk_web_agent/agent.py` | Modify (model, thinking config, callbacks) | 1, 2 |
| `adk_web_agent/tools/thinking_middleware.py` | **Create** (thought extraction, delegation tracking) | 2 |
| `adk_web_agent/database/schema.sql` | Modify (add columns) | 3 |
| `adk_web_agent/database/db.py` | Modify (migration logic) | 3 |

### Frontend (copilotkit-app-quickstart)

| File | Action | Phase |
|------|--------|-------|
| `app/types/agent.ts` | Modify (expand types) | 4 |
| `app/hooks/useAgentThoughts.ts` | Modify (expose new state) | 4 |
| `app/theme/agentColors.ts` | Modify (add colors) | 5 |
| `app/components/Chat/ThoughtSummaryBlock.tsx` | **Create** | 6 |
| `app/components/Chat/AgentDelegationBadge.tsx` | **Create** | 6 |
| `app/components/Chat/ChatView.tsx` | Modify (integrate new components) | 6 |
| `app/components/AgentThoughts/ThoughtsPanel.tsx` | Modify (four-tier hierarchy) | 7 |
| `app/page.tsx` | Modify (forward toggle header) | 8 |

---

**Document Version**: 4.0  
**Created**: February 12, 2026  
**Status**: Draft — Pending Review
