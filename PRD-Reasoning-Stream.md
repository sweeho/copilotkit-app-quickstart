This PRD outlines the implementation of a **Real-time Agent Thought Stream** within a custom CopilotKit UI, bridging the gap between the internal logic of an ADK (Agent Development Kit) backend and a polished frontend experience.

---

# PRD: Real-time Agent Reasoning Stream (AG-UI)

## 1. Objective

To provide users with transparency into the agent’s "thought process" by streaming intermediate reasoning steps, tool-calling status, and progress logs from the LangGraph/ADK backend directly into a custom React UI.

## 2. Technical Architecture

The implementation relies on the **AG-UI Protocol**, which allows for **State Deltas** to be emitted mid-node.

* **Backend:** ADK (Python/LangGraph) using `copilotkit_emit_state`.
* **Protocol:** AG-UI (State-sharing over WebSockets/SSE).
* **Frontend:** CopilotKit React SDK (`useCoAgent` + `useCoAgentStateRender`).

---

## 3. Implementation Plan

### Phase 1: Backend State Schema (ADK)

Define a `ThoughtStep` structure in the Pydantic state to track historical and active thoughts.

**Key Requirements:**

* Modify `AgentState` to include `thought_stack` (list of completed thoughts) and `active_thought` (string).
* Implement a helper function `emit_thought(config, message)` to abstract the AG-UI emission.

### Phase 2: Node Instrumentation

Instrument heavy-lifting nodes (Research, API calls, Data Processing) to report their status.

**Workflow:**

1. **Entry:** Node emits "Starting [Task]..." to `active_thought`.
2. **Execution:** Node performs logic.
3. **Exit:** Node moves `active_thought` into `thought_stack` and clears the active slot.

### Phase 3: Custom UI Component

Build a React component that subscribes to the agent's state.

**Features:**

* **Auto-scroll:** Keep the latest thought in view.
* **Transitions:** Smoothly animate between "Active" (pulsing/loading) and "Complete" (checkmarks).
* **Collapsibility:** Allow users to hide the technical logs if they only care about the final answer.

---

## 4. Technical Specifications

### Data Model (Python)

```python
class ThoughtStep(BaseModel):
    id: str
    message: str
    status: str # "running" | "completed" | "error"

class AgentState(BaseModel):
    messages: List[BaseMessage]
    thought_stream: List[ThoughtStep] = []

```

### UI Interaction Logic

| Event | Backend Action | Frontend UI Response |
| --- | --- | --- |
| **Tool Start** | `emit_state(active_thought="Searching...")` | Show pulsing blue indicator |
| **Tool Error** | `emit_state(active_thought="API Failed")` | Show red warning icon |
| **Node Finish** | Return state update with `thought_stack` | Move item to "History" list with checkmark |

---

## 5. Success Metrics

* **Latency:** Thought updates should appear in the UI within <200ms of being emitted by the backend.
* **Clarity:** A user should be able to identify exactly which tool the agent is currently stuck on.
* **Consistency:** The `thought_stack` must persist across the entire conversation session.

---

## 6. Next Steps

1. **Backend:** Initialize the `thought_stream` list in your LangGraph state.
2. **Frontend:** Wrap your custom chat container with `<CopilotKit>` and implement the `useCoAgent` hook.

**Would you like me to generate the React Tailwind component for the "Thought Stream" sidebar based on this PRD?**