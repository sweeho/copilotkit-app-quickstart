# Product Requirements Document (PRD)
## Agentic Web-Based Chatbot with Multi-Agent Orchestration

---

## 1. Product Overview

### 1.1 Product Vision
Build a professional, enterprise-grade agentic chatbot web application that combines Google ADK's backend agent capabilities with CopilotKit's React frontend framework, featuring an Apple-inspired design language, comprehensive session management, and **transparent visualization of multi-agent orchestration including sub-agent execution details**.

### 1.2 Target Users
- Enterprise users requiring AI-powered assistance
- Teams needing conversational AI with visible reasoning processes
- Developers and power users who want to understand agent orchestration
- Organizations requiring session-based interaction history with audit trails

### 1.3 Success Metrics
- User engagement rate (messages per session)
- Session creation and reuse patterns
- Agent thought visibility toggle usage
- Sub-agent visualization engagement
- Authentication adoption rate (future phase)

---

## 2. Technical Stack

### 2.1 Frontend
- **Framework**: React
- **UI Library**: CopilotKit (chatbot interface)
- **Design System**: Material UI (MUI) with custom Apple-inspired theme
- **State Management**: React Context/Redux (for complex agent state)
- **Routing**: React Router
- **Visualization**: React Flow or D3.js (for agent execution graphs)

### 2.2 Backend
- **Agent Framework**: Google ADK (Agentic Development Kit)
- **API Layer**: REST/WebSocket (for real-time agent responses)
- **Agent Architecture**: Main agent orchestrating multiple sub-agents

### 2.3 Authentication (Future Phase)
- Identity Server integration (placeholder for Phase 2)

---

## 3. Core Features

### 3.1 User Interface Design

**Design Language**
- Apple Design Language principles: clean, minimal, intuitive
- Professional and modern aesthetic
- Smooth animations and transitions
- Ample whitespace and typography hierarchy

**Material UI Theme Configuration**
```
- Custom theme extending MUI
- Apple-inspired color palette
- SF Pro or Inter font family
- Rounded corners (8px standard)
- Subtle shadows and depth
- Smooth 200-300ms transitions
```

**Responsive Design**
- Desktop-first approach
- Tablet and mobile breakpoints
- Collapsible sidebar on mobile
- Touch-friendly controls

### 3.2 Chat Interface (CopilotKit Integration)

**Layout**
- Full-height chat window
- Message history with auto-scroll
- Input area with send button
- Typing indicators during agent processing
- Message timestamps
- User/Agent message differentiation

**Message Types**
- Text messages
- Code blocks with syntax highlighting
- Rich media support (images, links)
- Error/warning states
- Loading states
- **Agent execution summaries**

**Input Features**
- Multi-line text input
- Send on Enter (Shift+Enter for new line)
- Character count (optional)
- File attachment support (future enhancement)

### 3.3 Agent Thoughts Toggle & Multi-Agent Visualization

**Toggle Functionality**
- Prominent toggle button (top bar or sidebar)
- Shows/hides complete agent orchestration
- Persistent state per session
- Visual indicator when thoughts are visible
- Performance consideration: lazy load details when expanded

**Agent Thoughts Display Architecture**

**Three-Tier Information Hierarchy:**

1. **Main Agent Level** (Always visible when toggle ON)
   - Main agent's reasoning and decision-making
   - Which sub-agents to invoke and why
   - Overall orchestration strategy

2. **Sub-Agent Execution Level** (Expandable sections)
   - Individual sub-agent cards/panels
   - Execution timeline
   - Status indicators (pending, running, completed, failed)

3. **Sub-Agent Detail Level** (Nested expansion)
   - Detailed input/output for each sub-agent
   - Internal reasoning of each sub-agent
   - Execution metrics

**Visual Components for Agent Thoughts**

#### Main Agent Orchestration Panel
```
┌─────────────────────────────────────────┐
│ 🧠 Main Agent Reasoning                 │
├─────────────────────────────────────────┤
│ Goal: Answer user's question about...  │
│ Strategy: Will use 3 sub-agents:       │
│   1. Research Agent - gather data       │
│   2. Analysis Agent - process data      │
│   3. Summary Agent - format response    │
│                                         │
│ Confidence: High                        │
│ Estimated time: 2-3 seconds            │
└─────────────────────────────────────────┘
```

#### Sub-Agent Execution Cards
Each sub-agent displayed as an expandable card:

```
┌─────────────────────────────────────────┐
│ ▶ Research Agent                    [✓] │  ← Expandable, Status Icon
├─────────────────────────────────────────┤
│ Status: Completed (1.2s)                │
│ Click to view details →                 │
└─────────────────────────────────────────┘

When expanded:
┌─────────────────────────────────────────┐
│ ▼ Research Agent                    [✓] │
├─────────────────────────────────────────┤
│ Status: Completed (1.2s)                │
│                                         │
│ 📥 INPUT                                │
│ ┌─────────────────────────────────────┐ │
│ │ Query: "Latest market trends"       │ │
│ │ Parameters: {                       │ │
│ │   sources: ["internal_db", "api"]  │ │
│ │   timeframe: "last_30_days"        │ │
│ │ }                                   │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 🔄 PROCESSING                           │
│ ┌─────────────────────────────────────┐ │
│ │ 1. Queried internal database        │ │
│ │ 2. Called external API              │ │
│ │ 3. Aggregated 47 data points        │ │
│ │ 4. Filtered by relevance (>0.8)     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 📤 OUTPUT                               │
│ ┌─────────────────────────────────────┐ │
│ │ Found 12 relevant trends:           │ │
│ │ - AI adoption increased 34%         │ │
│ │ - Cloud spending up 28%             │ │
│ │ ... (View full output)              │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 📊 METRICS                              │
│ Execution time: 1.2s                    │
│ API calls: 3                            │
│ Tokens used: 450                        │
└─────────────────────────────────────────┘
```

#### Agent Execution Timeline/Flow
Visual representation showing:
- Sequential or parallel execution
- Dependencies between sub-agents
- Current execution stage

```
Main Agent
    ├─[✓] Research Agent (1.2s)
    │     └─→ Output: 12 trends identified
    │
    ├─[✓] Analysis Agent (2.1s)
    │     ├─ Input: 12 trends from Research
    │     └─→ Output: 3 key insights
    │
    └─[⟳] Summary Agent (in progress...)
          └─ Input: 3 insights from Analysis
```

**Agent Thought Display Modes**

1. **Compact Mode** (Default when toggle ON)
   - Shows agent names and status only
   - Execution timeline
   - Quick summary of each step

2. **Detailed Mode** (User expands specific agents)
   - Full input/output data
   - Internal reasoning
   - Execution metrics
   - Tool usage details

3. **Graph View** (Optional advanced feature)
   - Node-based visualization
   - Shows agent dependencies
   - Interactive exploration

**Component Structure for Agent Thoughts**

```jsx
<AgentThoughtsPanel>
  <MainAgentReasoning>
    {/* Main agent's plan and strategy */}
  </MainAgentReasoning>
  
  <SubAgentExecutionList>
    {subAgents.map(agent => (
      <SubAgentCard
        key={agent.id}
        agent={agent}
        isExpanded={expandedAgents.includes(agent.id)}
        onToggle={() => toggleAgent(agent.id)}
      >
        <AgentHeader 
          name={agent.name}
          status={agent.status}
          duration={agent.duration}
        />
        
        {isExpanded && (
          <>
            <AgentInput data={agent.input} />
            <AgentProcessing steps={agent.processingSteps} />
            <AgentOutput data={agent.output} />
            <AgentMetrics metrics={agent.metrics} />
          </>
        )}
      </SubAgentCard>
    ))}
  </SubAgentExecutionList>
  
  <AgentExecutionGraph 
    agents={allAgents}
    showGraph={showGraphView}
  />
</AgentThoughtsPanel>
```

**Data Structure for Agent Execution**

```typescript
interface AgentExecution {
  id: string;
  name: string;
  type: 'main' | 'sub';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  
  // Main agent specific
  reasoning?: string;
  strategy?: string;
  subAgentsToInvoke?: string[];
  
  // Sub-agent specific
  input?: {
    raw: any;
    formatted: string;
    source?: string; // which agent/user provided this
  };
  
  processing?: {
    steps: ProcessingStep[];
    toolsUsed: string[];
    apiCalls: number;
  };
  
  output?: {
    raw: any;
    formatted: string;
    summary: string;
    destination?: string; // where this output goes
  };
  
  metrics?: {
    executionTime: number;
    tokensUsed: number;
    apiCalls: number;
    confidence?: number;
  };
  
  error?: {
    message: string;
    code: string;
    recoverable: boolean;
  };
  
  // Relationships
  parentAgent?: string;
  childAgents?: string[];
  dependsOn?: string[];
}

interface ProcessingStep {
  id: string;
  description: string;
  timestamp: Date;
  status: 'completed' | 'failed' | 'skipped';
  details?: any;
}
```

**Visual Design Elements**

**Status Indicators:**
- 🔵 Pending (gray, pulsing)
- 🟡 Running (yellow, animated spinner)
- 🟢 Completed (green, checkmark)
- 🔴 Failed (red, error icon)

**Color Coding:**
- Input sections: Light blue background
- Processing sections: Light purple background
- Output sections: Light green background
- Metrics: Light gray background

**Interactive Elements:**
- Expand/collapse arrows
- Copy buttons for input/output
- "View Raw" buttons for JSON data
- Links to jump between related agents
- Hover states showing quick previews

**Layout Options:**

1. **Sidebar Layout**
   - Thoughts panel as right sidebar (30-40% width)
   - Main chat on left
   - Can be collapsed/expanded

2. **Inline Layout**
   - Thoughts appear inline with messages
   - Expandable sections within chat
   - More integrated feel

3. **Modal/Overlay Layout**
   - Click "Show Thoughts" opens detailed overlay
   - Full-screen detailed view
   - Better for complex orchestrations

### 3.4 Session Management

**Session Selection Screen**
- Displayed after login
- List of recent sessions with metadata:
  - Session name/title
  - Last activity timestamp
  - Message count
  - Preview of last message
  - **Number of agents invoked** (new)
- Search/filter functionality
- Sort options (recent, alphabetical, most active)

**Session Creation**
- "New Session" button (primary action)
- Auto-create new session option (default behavior)
- Session naming (auto-generated or user-defined)
- Session description (optional)

**Session Persistence**
- Server-side session storage
- **Full agent execution history** (new)
- Session history accessible across devices
- Export session transcript with agent details (future feature)

**Default Behavior**
- Create new session on login (default)
- User preference to resume last session
- Session timeout settings (configurable)

### 3.5 Login Screen

**Phase 1 (Current Scope)**
- Simple username input (no password)
- "Continue" button
- Branding/logo area
- Tagline or description
- Clean, centered layout

**Phase 2 (Future)**
- Integration with Identity Server
- OAuth/SSO support
- Multi-factor authentication
- Password recovery flow

**Login Flow**
1. User enters credentials (Phase 1: username only)
2. System validates (Phase 1: mock validation)
3. Redirect to session selection/creation
4. Load chat interface

### 3.6 Theme System

**Theme Options**
1. **Light Mode**
   - White/light gray backgrounds
   - Dark text
   - Subtle shadows
   - Apple-inspired light palette
   - Distinct colors for agent components

2. **Dark Mode**
   - Dark gray/black backgrounds
   - Light text
   - Elevated surfaces
   - Reduced eye strain colors
   - High contrast for agent components

3. **Follow System**
   - Detects OS preference
   - Auto-switches with system changes
   - Respects prefers-color-scheme media query

**Theme Persistence**
- Store preference in localStorage
- Sync across sessions
- Smooth transition animations (200ms)

**Theme Toggle**
- Accessible from header/settings
- Icon-based toggle (sun/moon/auto)
- Visual feedback on change

---

## 4. Additional Key Features for Agentic Chatbot

### 4.1 Agent Capabilities Visibility
- Display available agent tools/skills
- **Show available sub-agents and their capabilities**
- Show active tools during interaction
- Tool execution status indicators
- **Sub-agent registry/catalog**

### 4.2 Context Management
- Conversation context display
- Context window utilization indicator
- **Context passed between sub-agents**
- Option to clear/reset context

### 4.3 Response Controls
- Stop generation button (stops all agents)
- Regenerate response option
- Copy response to clipboard
- **Copy agent execution details**
- Thumbs up/down feedback
- **Feedback on specific sub-agent performance**

### 4.4 Settings Panel
- Agent configuration options
- Model selection (if multiple available)
- Response length preferences
- Temperature/creativity controls
- **Thought verbosity settings**
- **Sub-agent execution detail level**
- **Enable/disable specific sub-agents**

### 4.5 History and Search
- Search within current session
- Search across all sessions
- **Search by sub-agent used**
- **Filter by agent execution patterns**
- Filter by date range
- Bookmark important messages

### 4.6 Keyboard Shortcuts
- Cmd/Ctrl + K: Focus input
- Cmd/Ctrl + N: New session
- Cmd/Ctrl + /: Toggle agent thoughts
- Cmd/Ctrl + E: Expand all sub-agents
- Cmd/Ctrl + R: Collapse all sub-agents
- Esc: Cancel current generation

### 4.7 Notifications
- Desktop notifications for responses (optional)
- In-app notifications for errors
- **Sub-agent failure alerts**
- Session expiry warnings

### 4.8 Error Handling
- Graceful error messages
- **Sub-agent specific error handling**
- **Retry mechanisms for failed sub-agents**
- **Fallback strategies when sub-agents fail**
- Connection status indicator
- Offline mode support

### 4.9 Agent Execution Analytics (New)
- **Average execution time per sub-agent**
- **Success/failure rates**
- **Most frequently used sub-agents**
- **Execution pattern visualization**
- **Performance bottleneck identification**

---

## 5. User Flows

### 5.1 First-Time User Flow
1. Land on login screen
2. Enter username (Phase 1)
3. Arrive at empty session list
4. Click "Create New Session" or auto-create
5. See onboarding tips/welcome message
6. **See agent capabilities overview**
7. Start chatting with agent

### 5.2 Returning User Flow
1. Login with credentials
2. View session selection screen
3. Choose existing session or create new
4. Resume conversation or start fresh

### 5.3 Chat Interaction Flow with Multi-Agent Orchestration
1. User types message and sends
2. Message appears in chat
3. **Main agent begins orchestration**
4. Agent processing indicator shows
5. **If thoughts toggle ON:**
   - Main agent reasoning appears
   - Sub-agent execution cards appear
   - Real-time status updates for each sub-agent
   - Execution timeline updates
6. **User can interact during execution:**
   - Expand specific sub-agent cards
   - View input/output in real-time
   - See processing steps as they occur
7. Final response streams in
8. **Agent execution summary shows:**
   - Total agents used
   - Total execution time
   - Quick stats
9. User can interact with response

### 5.4 Agent Thought Exploration Flow
1. User receives response with agent execution
2. Clicks "Show Agent Thoughts" toggle
3. Sees main agent reasoning panel
4. Sees list of sub-agents used (collapsed)
5. Clicks on specific sub-agent card
6. Card expands showing:
   - Input section
   - Processing steps
   - Output section
   - Metrics
7. User can:
   - Copy input/output
   - View raw JSON
   - Navigate to related agents
   - Collapse and view other agents
8. User toggles off thoughts to return to clean view

---

## 6. Technical Requirements

### 6.1 Frontend Architecture
```
/src
  /components
    /Chat
      ChatWindow.tsx
      MessageList.tsx
      MessageInput.tsx
      Message.tsx
      AgentExecutionSummary.tsx        # NEW
    /AgentThoughts
      ThoughtsPanel.tsx
      MainAgentReasoning.tsx           # NEW
      SubAgentExecutionList.tsx        # NEW
      SubAgentCard.tsx                 # NEW
      AgentInput.tsx                   # NEW
      AgentProcessing.tsx              # NEW
      AgentOutput.tsx                  # NEW
      AgentMetrics.tsx                 # NEW
      AgentExecutionGraph.tsx          # NEW
      AgentTimeline.tsx                # NEW
    /Session
      SessionList.tsx
      SessionCard.tsx
      NewSessionButton.tsx
    /Auth
      LoginScreen.tsx
    /Layout
      Header.tsx
      Sidebar.tsx
      ThemeToggle.tsx
      ThoughtsToggle.tsx               # NEW
    /Visualization
      ExecutionFlow.tsx                # NEW
      AgentDependencyGraph.tsx         # NEW
  /theme
    muiTheme.ts
    appleColors.ts
    agentColors.ts                     # NEW - Colors for different agents
  /hooks
    useTheme.ts
    useSession.ts
    useAgent.ts
    useAgentExecution.ts               # NEW
    useSubAgentExpansion.ts            # NEW
  /services
    api.ts
    auth.ts
    session.ts
    agentExecution.ts                  # NEW
  /contexts
    AuthContext.tsx
    ThemeContext.tsx
    SessionContext.tsx
    AgentExecutionContext.tsx          # NEW
  /types
    agent.ts                           # NEW - Agent execution types
    subAgent.ts                        # NEW - Sub-agent types
  /utils
    agentFormatters.ts                 # NEW - Format agent data for display
    executionAnalyzer.ts               # NEW - Analyze execution patterns
```

### 6.2 Backend Integration

**Real-time Agent Execution Streaming**
- WebSocket connection for streaming agent execution
- Server-sent events for real-time updates
- Progressive disclosure of agent execution

**Agent Execution Data Structure**
```typescript
// WebSocket message types
type AgentMessage = 
  | { type: 'agent_start', data: AgentExecution }
  | { type: 'agent_reasoning', data: { agentId: string, reasoning: string } }
  | { type: 'subagent_start', data: SubAgentExecution }
  | { type: 'subagent_input', data: { agentId: string, input: any } }
  | { type: 'subagent_processing', data: { agentId: string, step: ProcessingStep } }
  | { type: 'subagent_output', data: { agentId: string, output: any } }
  | { type: 'subagent_complete', data: { agentId: string, metrics: AgentMetrics } }
  | { type: 'subagent_error', data: { agentId: string, error: AgentError } }
  | { type: 'agent_complete', data: { agentId: string, summary: ExecutionSummary } }
  | { type: 'final_response', data: string };
```

**Google ADK Integration Requirements**
- Hook into ADK's agent orchestration lifecycle
- Capture sub-agent invocations
- Stream execution data to frontend
- Preserve full execution history

### 6.3 Performance Requirements
- Initial load: < 2 seconds
- Message send to response start: < 500ms
- Agent thought rendering: < 100ms per sub-agent
- Smooth 60fps animations
- Optimistic UI updates
- Message virtualization for long histories
- **Lazy loading of agent execution details**
- **Pagination for large agent execution graphs**

### 6.4 Browser Support
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

---

## 7. Design Specifications

### 7.1 Apple-Inspired Theme
```javascript
const appleTheme = {
  light: {
    primary: '#007AFF',
    background: '#FFFFFF',
    surface: '#F5F5F7',
    text: '#1D1D1F',
    textSecondary: '#86868B',
    border: '#D2D2D7',
    // Agent-specific colors
    agentInput: '#E3F2FD',      // Light blue
    agentProcessing: '#F3E5F5',  // Light purple
    agentOutput: '#E8F5E9',      // Light green
    agentMetrics: '#FAFAFA',     // Light gray
    agentError: '#FFEBEE',       // Light red
  },
  dark: {
    primary: '#0A84FF',
    background: '#000000',
    surface: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#98989D',
    border: '#38383A',
    // Agent-specific colors (dark mode)
    agentInput: '#1A237E',
    agentProcessing: '#4A148C',
    agentOutput: '#1B5E20',
    agentMetrics: '#212121',
    agentError: '#B71C1C',
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontSize: 28, fontWeight: 600 },
    h2: { fontSize: 22, fontWeight: 600 },  // Agent names
    h3: { fontSize: 18, fontWeight: 500 },  // Section headers
    body1: { fontSize: 15, lineHeight: 1.5 },
    body2: { fontSize: 13, lineHeight: 1.4 },  // Metrics, timestamps
    code: { fontFamily: 'Monaco, Consolas, monospace', fontSize: 13 },
  },
  shape: {
    borderRadius: 8,
  },
  transitions: {
    duration: 200,
  }
}
```

### 7.2 Layout Specifications
- Max content width: 1200px
- Chat area: 50-60% of viewport (when thoughts visible)
- Thoughts panel: 40-50% of viewport (when expanded)
- Sidebar (when visible): 280-320px
- Header height: 64px
- Message padding: 16px
- Input area height: 60-80px (auto-expand)
- **Sub-agent card padding: 12px**
- **Sub-agent card margin: 8px**
- **Nested indentation: 16px per level**

### 7.3 Agent Visualization Specifications

**Sub-Agent Card Dimensions**
- Collapsed: 60px height
- Expanded: Auto (min 200px, max 600px)
- Width: 100% of thoughts panel
- Border radius: 8px
- Shadow: subtle elevation

**Status Icon Sizes**
- 20px for main indicators
- 16px for inline status
- Animated spinner: 18px

**Execution Timeline**
- Line thickness: 2px
- Node size: 24px
- Vertical spacing: 16px between nodes
- Indentation for child agents: 32px

**Code/Data Display**
- Syntax highlighting for JSON
- Max height: 300px with scroll
- Monospace font: 13px
- Background: slightly darker/lighter than surface

---

## 8. API Specifications

### 8.1 Authentication (Phase 1 - Mock)
```
POST /api/auth/login
Request: { username: string }
Response: { token: string, userId: string, username: string }
```

### 8.2 Session Management
```
GET /api/sessions
Response: { sessions: Session[] }

POST /api/sessions
Request: { name?: string, description?: string }
Response: { session: Session }

GET /api/sessions/:id
Response: { 
  session: Session, 
  messages: Message[],
  agentExecutions: AgentExecution[]  // NEW
}

DELETE /api/sessions/:id
Response: { success: boolean }
```

### 8.3 Chat & Agent Execution
```
POST /api/chat/message
Request: { sessionId: string, message: string }
Response: Stream of AgentMessage types

WebSocket /ws/chat/:sessionId
Events: 
  - message
  - agent_start
  - agent_reasoning
  - subagent_start
  - subagent_input
  - subagent_processing
  - subagent_output
  - subagent_complete
  - subagent_error
  - agent_complete
  - final_response
  - error

GET /api/agent-execution/:executionId
Response: { execution: DetailedAgentExecution }

GET /api/sessions/:sessionId/agent-analytics
Response: {
  totalAgents: number,
  avgExecutionTime: number,
  subAgentUsage: { [agentName: string]: number },
  successRate: number
}
```

---

## 9. Development Phases

### Phase 1: MVP (Current Scope)
- ✅ CopilotKit + Google ADK integration
- ✅ Apple-inspired MUI theme
- ✅ Basic chat interface
- ✅ **Multi-agent orchestration visualization**
- ✅ **Sub-agent input/output display**
- ✅ **Agent execution timeline**
- ✅ Agent thoughts toggle with expandable sub-agents
- ✅ Session management
- ✅ Mock authentication
- ✅ Theme system (light/dark/system)

### Phase 2: Enhanced Features
- Identity Server integration
- Advanced session features (sharing, export with agent details)
- **Agent execution graph visualization**
- **Advanced filtering and search in agent executions**
- Rich media support
- Advanced agent controls
- **Agent performance analytics dashboard**

### Phase 3: Enterprise Features
- Team collaboration
- Admin panel
- **Agent execution audit logs**
- Usage analytics
- Custom agent configurations
- **Sub-agent marketplace/registry**
- SSO integration
- **Agent execution replay/debugging**

---

## 10. Success Criteria

### 10.1 Technical Success
- All core features implemented
- < 100ms response time for UI interactions
- **Real-time agent execution updates with < 50ms latency**
- **Smooth expansion/collapse of sub-agent cards**
- Zero critical bugs at launch
- 95%+ uptime
- **Handle up to 20 concurrent sub-agent executions**

### 10.2 User Success
- Intuitive first-use experience
- < 5 minutes to first successful interaction
- **Users can understand agent orchestration within 2 minutes**
- **>70% of power users enable agent thoughts toggle**
- Positive feedback on design and usability
- High session reuse rate
- **Clear understanding of when/why sub-agents are used**

---

## 11. Out of Scope (Phase 1)

- Real authentication system
- Multi-user collaboration
- Mobile native apps
- Voice input/output
- Advanced analytics dashboard
- Custom agent training
- API access for external integrations
- **Agent execution replay/debugging tools**
- **Custom sub-agent development UI**
- **Agent performance optimization suggestions**

---

## 12. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Google ADK API changes | High | Version pinning, abstraction layer |
| **Complex agent execution data overwhelming UI** | High | **Progressive disclosure, lazy loading, clear visual hierarchy** |
| **Performance with many sub-agents** | High | **Virtualization, pagination, collapse by default** |
| CopilotKit limitations | Medium | Evaluate alternatives early, custom components |
| **Real-time streaming reliability** | Medium | **WebSocket reconnection, fallback to polling** |
| Performance with long sessions | Medium | Message virtualization, pagination |
| Theme consistency | Low | Comprehensive design system, regular reviews |
| **Inconsistent agent execution data format** | Medium | **Strict typing, validation layer, data normalization** |

---

## 13. Wireframe Concepts

### 13.1 Agent Thoughts Panel - Sidebar Layout

```
┌────────────────────────────────────────────────────────────┐
│  Logo    New Session    [🌙]  [@User]  [Show Thoughts: ON] │
├─────────────────────────┬──────────────────────────────────┤
│                         │  🧠 Agent Thoughts               │
│  Chat Messages          │  ─────────────────────────────   │
│  ───────────────        │                                  │
│                         │  Main Agent Orchestration        │
│  User: How do I...      │  ┌────────────────────────────┐  │
│                         │  │ Analyzing your question... │  │
│  Agent: I'll help...    │  │ Will invoke 3 sub-agents:  │  │
│  [Agent used 3 tools]   │  │ • Research Agent           │  │
│  ↓ View execution       │  │ • Analysis Agent           │  │
│                         │  │ • Summary Agent            │  │
│                         │  └────────────────────────────┘  │
│                         │                                  │
│                         │  Sub-Agent Executions            │
│                         │  ─────────────────────────────   │
│                         │                                  │
│                         │  ▼ Research Agent          [✓]   │
│                         │  ┌────────────────────────────┐  │
│                         │  │ 📥 INPUT                   │  │
│                         │  │ Query: "market trends"     │  │
│                         │  │                            │  │
│                         │  │ 🔄 PROCESSING              │  │
│                         │  │ • Queried database         │  │
│                         │  │ • Called API               │  │
│                         │  │                            │  │
│                         │  │ 📤 OUTPUT                  │  │
│                         │  │ Found 12 trends...         │  │
│                         │  │                            │  │
│                         │  │ ⏱ Execution: 1.2s         │  │
│                         │  └────────────────────────────┘  │
│                         │                                  │
│                         │  ▶ Analysis Agent          [✓]   │
│                         │  Status: Completed (2.1s)        │
│                         │                                  │
│                         │  ▶ Summary Agent           [⟳]   │
│                         │  Status: Running...              │
│                         │                                  │
│                         │                                  │
├─────────────────────────┴──────────────────────────────────┤
│  Type your message...                              [Send]  │
└────────────────────────────────────────────────────────────┘
```

---

## 14. Appendix

### 14.1 Glossary
- **Agent Thoughts**: Internal reasoning steps the AI agent takes
- **Main Agent**: Primary orchestrator that decides which sub-agents to invoke
- **Sub-Agent**: Specialized agent invoked by main agent for specific tasks
- **Agent Execution**: Complete lifecycle of an agent from start to completion
- **Processing Steps**: Individual operations performed within an agent
- **Session**: A conversation thread with persistent history
- **CopilotKit**: React framework for building AI-powered interfaces
- **Google ADK**: Agentic Development Kit for building AI agents

### 14.2 References
- [CopilotKit Documentation](https://docs.copilotkit.ai)
- [Material UI Documentation](https://mui.com)
- [Apple Human Interface Guidelines](https://developer.apple.com/design)
- Google ADK Documentation
- [React Flow Documentation](https://reactflow.dev) (for graph visualization)

### 14.3 Example Agent Execution JSON
```json
{
  "id": "exec_123",
  "sessionId": "session_456",
  "messageId": "msg_789",
  "mainAgent": {
    "id": "agent_main",
    "name": "Main Orchestrator",
    "reasoning": "User asked about market trends. Will use Research Agent to gather data, Analysis Agent to process it, and Summary Agent to format response.",
    "strategy": "sequential",
    "startTime": "2026-02-09T10:00:00Z",
    "endTime": "2026-02-09T10:00:05Z"
  },
  "subAgents": [
    {
      "id": "agent_sub_1",
      "name": "Research Agent",
      "status": "completed",
      "startTime": "2026-02-09T10:00:00Z",
      "endTime": "2026-02-09T10:00:01.2Z",
      "duration": 1200,
      "input": {
        "query": "market trends",
        "timeframe": "last_30_days",
        "sources": ["internal_db", "external_api"]
      },
      "processing": [
        {
          "id": "step_1",
          "description": "Querying internal database",
          "timestamp": "2026-02-09T10:00:00.1Z",
          "status": "completed"
        },
        {
          "id": "step_2",
          "description": "Calling external API",
          "timestamp": "2026-02-09T10:00:00.5Z",
          "status": "completed"
        }
      ],
      "output": {
        "trends": ["AI adoption +34%", "Cloud spending +28%"],
        "count": 12,
        "confidence": 0.92
      },
      "metrics": {
        "executionTime": 1200,
        "apiCalls": 2,
        "tokensUsed": 450
      }
    }
  ]
}
```

---

**Document Version**: 2.0  
**Last Updated**: February 9, 2026  
**Status**: Updated with Multi-Agent Visualization Requirements