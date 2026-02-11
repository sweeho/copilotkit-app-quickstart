# Implementation Plan v5: Inline Thought Bubbles (Refactor from Right Sidebar)

**Based on**: PRD_v5.md  
**Date**: February 12, 2026  
**Goal**: Refactor the "Thoughts" feature from a right sidebar panel to **inline thought bubbles** displayed between user queries and agent responses in the chat flow.

---

## Current State (v4 Implementation)

The following components exist from the v4 implementation:

| File | Purpose | Status in v5 |
|------|---------|--------------|
| `components/AgentThoughts/ThoughtsPanel.tsx` | Right sidebar panel showing thoughts | **REMOVE** |
| `components/AgentThoughts/AgentTimeline.tsx` | Timeline component in sidebar | **REMOVE** |
| `components/Chat/ThoughtSummaryBlock.tsx` | Collapsible thought summary block | **KEEP & MODIFY** (merge delegation badge inside) |
| `components/Chat/AgentDelegationBadge.tsx` | Standalone delegation breadcrumb | **KEEP** (moved inside thought bubble) |
| `components/Chat/ChatView.tsx` | Chat view with sidebar flex layout | **MODIFY** (remove sidebar, full-width) |
| `hooks/useAgentThoughts.ts` | Hook for thought/delegation state | **KEEP** (no changes) |
| `types/agent.ts` | CoAgentState, ThoughtStep types | **KEEP** (no changes) |
| `theme/agentColors.ts` | Purple/teal thought colors | **KEEP** (no changes) |
| `page.tsx` | Main page with header + sidebar + chat | **MODIFY** (remove `thoughtsEnabled` prop threading to sidebar panel) |

---

## Implementation Phases

### Phase 1: Remove ThoughtsPanel Sidebar from ChatView
**Files**: `components/Chat/ChatView.tsx`

**What changes**:
1. Remove the `import ThoughtsPanel` statement
2. Remove the `{thoughtsEnabled && <ThoughtsPanel />}` JSX at the bottom of ChatView
3. The chat area `<Box>` should take `flex: 1` with no sibling panel — it already does, just remove the sibling
4. Remove the overall `flexDirection: 'row'` wrapper that divided chat vs. sidebar (simplify to just the chat column)

**Result**: ChatView becomes a full-width chat-only component. The `thoughtsEnabled` prop is still needed for controlling inline bubbles via `useCoAgentStateRender`.

---

### Phase 2: Merge Delegation Badge into ThoughtSummaryBlock
**Files**: `components/Chat/ThoughtSummaryBlock.tsx`

**What changes**:
1. Add `delegationChain?: string[]` and `delegatedAgent?: string | null` as optional props
2. Inside the `<Collapse>` content area, **below** the thought summary text, render the `<AgentDelegationBadge>` when `delegationChain` has items
3. This creates a unified "thought bubble" that shows:
   - 💭 Model Thinking header (collapsible)
   - Thought summary text (italic)
   - 🔀 Delegation breadcrumb (Root Agent → Research Agent → ...)

**No new components needed** — ThoughtSummaryBlock already exists and AgentDelegationBadge already exists. We're composing them.

---

### Phase 3: Update ChatView's `useCoAgentStateRender` to Render Unified Bubble
**Files**: `components/Chat/ChatView.tsx`

**What changes**:
1. In the `useCoAgentStateRender` callback, instead of rendering ThoughtSummaryBlock and AgentDelegationBadge as **separate** blocks, render a single ThoughtSummaryBlock with delegation props passed in
2. Remove the standalone `<AgentDelegationBadge>` render — it's now inside ThoughtSummaryBlock
3. Keep the running thought indicator (spinner) as a separate element below the bubble

**Updated render logic**:
```tsx
useCoAgentStateRender<CoAgentState>({
  name: 'my_agent',
  render: ({ state }) => {
    const running = (state.thought_stream ?? []).filter(t => t.status === 'running');
    const thoughtSummary = state.thought_summary ?? null;
    const delegationChain = state.delegation_chain ?? [];
    const delegatedAgent = state.delegated_agent ?? null;

    const hasContent = running.length > 0 || (thoughtsEnabled && (thoughtSummary || delegationChain.length > 0));
    if (!hasContent) return null;

    return (
      <Box sx={{ my: 1 }}>
        {/* Unified inline thought bubble */}
        {thoughtsEnabled && thoughtSummary && (
          <ThoughtSummaryBlock
            summary={thoughtSummary}
            agentName={state.thought_summary_agent ?? undefined}
            delegationChain={delegationChain}
            delegatedAgent={delegatedAgent}
            defaultExpanded
          />
        )}

        {/* Running indicator */}
        {running.length > 0 && (
          <Box sx={{ /* existing spinner styles */ }}>
            ...
          </Box>
        )}
      </Box>
    );
  },
});
```

---

### Phase 4: Delete Unused Sidebar Components
**Files to delete**:
- `components/AgentThoughts/ThoughtsPanel.tsx`
- `components/AgentThoughts/AgentTimeline.tsx`

**What changes**:
1. Delete both files — they are no longer referenced anywhere after Phase 1
2. The `AgentThoughts/` directory becomes empty and can be removed

**Note**: `useAgentThoughts.ts` hook remains in `hooks/` — it may still be used elsewhere or useful for future features. However, if it is only consumed by ThoughtsPanel, we can note it for future cleanup.

---

### Phase 5: Verify & Test
**Files**: All modified files

**Checks**:
1. Run `npx tsc --noEmit` — zero TypeScript errors
2. Run `get_errors` — zero workspace errors
3. Verify the layout:
   - No right sidebar when thoughts toggle is ON
   - Inline thought bubble appears in chat flow (via `useCoAgentStateRender`)
   - Delegation badge appears within the thought bubble
   - Toggle OFF hides the inline bubble
4. Verify the chat area is full-width (no shrinking for a sidebar)
5. Confirm `ThoughtsPanel` and `AgentTimeline` files are deleted and no dangling imports exist

---

## Summary of Changes

| Phase | Action | Files |
|-------|--------|-------|
| 1 | Remove ThoughtsPanel sidebar from ChatView | `ChatView.tsx` |
| 2 | Add delegation props to ThoughtSummaryBlock, render badge inside | `ThoughtSummaryBlock.tsx` |
| 3 | Simplify `useCoAgentStateRender` to unified bubble | `ChatView.tsx` |
| 4 | Delete ThoughtsPanel.tsx and AgentTimeline.tsx | Delete 2 files |
| 5 | TypeScript check, error check, layout verification | All |

**Files modified**: 2 (`ChatView.tsx`, `ThoughtSummaryBlock.tsx`)  
**Files deleted**: 2 (`ThoughtsPanel.tsx`, `AgentTimeline.tsx`)  
**Files unchanged**: `AgentDelegationBadge.tsx`, `useAgentThoughts.ts`, `agent.ts`, `agentColors.ts`, `page.tsx`  
**New files**: 0

**Estimated effort**: Small — this is a focused UI refactor with no backend changes. The existing inline components (ThoughtSummaryBlock, AgentDelegationBadge) are already built; we're removing the sidebar and composing them differently.
