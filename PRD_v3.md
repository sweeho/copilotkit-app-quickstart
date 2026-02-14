# Product Requirements Document (PRD)
## Agentic Web-Based Chatbot with Multi-Agent Orchestration

---

## 1. Product Overview

### 1.1 Product Vision
Build a professional, enterprise-grade agentic chatbot web application that combines Google ADK's backend agent capabilities with CopilotKit's React frontend framework, featuring an Apple-inspired design language, left sidebar session navigation, user-based session isolation, and transparent visualization of multi-agent orchestration including sub-agent execution details.

### 1.2 Target Users
- Enterprise users requiring AI-powered assistance with isolated sessions
- Teams needing conversational AI with visible reasoning processes
- Developers and power users who want to understand agent orchestration
- Administrators managing user accounts and access
- Organizations requiring session-based interaction history with audit trails

### 1.3 Success Metrics
- User engagement rate (messages per session)
- Session creation and reuse patterns per user
- Agent thought visibility toggle usage
- Sub-agent visualization engagement
- User authentication success rate
- Session isolation compliance (zero cross-user session access)

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
- **Session Management**: Google ADK Session Object with DatabaseSessionService
- **Database**: SQLite (local file-based)
- **API Layer**: REST/WebSocket (for real-time agent responses)
- **Agent Architecture**: Main agent orchestrating multiple sub-agents

### 2.3 Database Schema (SQLite)
```sql
-- Users table
CREATE TABLE users (
    user_id TEXT PRIMARY KEY,          -- Email address
    password_hash TEXT NOT NULL,       -- Hashed password
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE
);

-- Sessions table (integrates with Google ADK Session Object)
CREATE TABLE sessions (
    session_id TEXT PRIMARY KEY,       -- Google ADK session ID
    user_id TEXT NOT NULL,             -- Owner of this session
    session_name TEXT,                 -- User-defined or auto-generated name
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    message_count INTEGER DEFAULT 0,
    last_message_preview TEXT,
    agent_count INTEGER DEFAULT 0,     -- Number of agents invoked
    session_data TEXT,                 -- JSON: Google ADK session metadata
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Index for fast user session lookups
CREATE INDEX idx_sessions_user_id ON sessions(user_id, updated_at DESC);

-- Messages table
CREATE TABLE messages (
    message_id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL,                -- 'user' or 'assistant'
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    agent_execution_id TEXT,           -- Link to agent execution
    FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_messages_session ON messages(session_id, timestamp);

-- Agent executions table
CREATE TABLE agent_executions (
    execution_id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    message_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    main_agent_data TEXT,              -- JSON: main agent execution details
    sub_agents_data TEXT,              -- JSON: array of sub-agent executions
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    duration_ms INTEGER,
    status TEXT,                       -- 'pending', 'running', 'completed', 'failed'
    FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY (message_id) REFERENCES messages(message_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_executions_session ON agent_executions(session_id);
```

### 2.4 Authentication (Phase 1)
- **Local Authentication**: SQLite-based user management
- **Admin Panel**: User creation and password management
- **Password Security**: bcrypt hashing
- **Session Tokens**: JWT or session-based authentication

---

## 3. Core Features

### 3.1 User Interface Design

**Design Language**
- Apple Design Language principles: clean, minimal, intuitive
- Professional and modern aesthetic
- Smooth animations and transitions
- Ample whitespace and typography hierarchy

**Layout Structure**
```
┌─────────────────────────────────────────────────────────────┐
│  Logo         Chat Title             [🌙] [@User] [Logout]  │
├──────────┬──────────────────────────┬────────────────────────┤
│          │                          │                        │
│ Left     │   Main Chat Area         │  Agent Thoughts Panel  │
│ Sidebar  │                          │  (Toggle ON/OFF)       │
│          │                          │                        │
│ [+New    │   Messages display here  │  Sub-agent details     │
│  Chat]   │                          │                        │
│          │                          │                        │
│ Recents  │                          │                        │
│ ────────│                          │                        │
│ Session 1│                          │                        │
│ Session 2│                          │                        │
│ Session 3│                          │                        │
│ ...      │                          │                        │
│          │                          │                        │
│          │                          │                        │
│          ├──────────────────────────┤                        │
│          │ Type message...   [Send] │                        │
└──────────┴──────────────────────────┴────────────────────────┘
```

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
- Tablet: collapsible left sidebar
- Mobile: hamburger menu for sidebar
- Touch-friendly controls

### 3.2 Left Sidebar Navigation

**Structure**
```
┌──────────────────┐
│                  │
│  [+ New Chat]    │  ← Primary action button
│                  │
│  ───────────     │
│                  │
│  Recents         │  ← Section title
│  ───────────     │
│                  │
│  ○ Session 1     │  ← Active session (highlighted)
│    2 min ago     │
│                  │
│  □ Session 2     │  ← Inactive session
│    1 hour ago    │
│                  │
│  □ Session 3     │
│    Yesterday     │
│                  │
│  □ Session 4     │
│    2 days ago    │
│                  │
│  [Load more...]  │
│                  │
│  ───────────     │
│                  │
│  [Settings]      │  ← Bottom section
│  [Admin Panel]   │  ← Only for admin users
│                  │
└──────────────────┘
```

**New Chat Button**
- **Location**: Top of left sidebar, above "Recents" section
- **Label**: "+ New Chat" or "+ New chat"
- **Styling**: 
  - Primary action button
  - Full width of sidebar (with padding)
  - Apple-style rounded corners (8px)
  - Hover state with subtle elevation
  - Icon: "+" or "✏️" symbol
- **Behavior**: 
  - Creates new session via Google ADK
  - Stores session in SQLite with user_id
  - Immediately navigates to new session
  - Clears chat area, ready for first message
  - Auto-generates session name (e.g., "New Chat - Feb 9")

**Recents Section**
- **Title**: "Recents" (subtle, uppercase or title case)
- **Display**: List of user's sessions ordered by `updated_at DESC`
- **Session Card Elements**:
  - Session name/title (truncated if long)
  - Relative timestamp ("2 min ago", "Yesterday", "Feb 9")
  - Last message preview (optional, truncated to 1 line)
  - Message count indicator (small badge)
  - Active state indicator (background highlight)
  - Hover state (subtle background change)
  - Optional: Agent usage indicator (icon + count)

**Session Item Interactions**
- **Click**: Load session and display messages
- **Hover**: Show full session name tooltip
- **Right-click/Long-press**: Context menu
  - Rename session
  - Delete session
  - Pin/Unpin session (future)
  - Export session (future)

**Session Filtering/Grouping**
- **Search**: Search box at top of Recents (optional)
- **Grouping**: Group by time periods
  - Today
  - Yesterday
  - Last 7 days
  - Last 30 days
  - Older
- **Sorting**: Default by most recent, option to sort by name

**Sidebar Behavior**
- **Width**: 280px on desktop
- **Collapsible**: Can be collapsed to icon-only mode
- **Persist state**: Remember collapsed/expanded preference
- **Mobile**: Overlay drawer that slides in from left
- **Scroll**: Independently scrollable session list

**Empty State**
- When user has no sessions:
  ```
  ┌──────────────────┐
  │  [+ New Chat]    │
  │                  │
  │  Recents         │
  │  ───────────     │
  │                  │
  │  No conversations│
  │  yet. Start a    │
  │  new chat!       │
  │                  │
  └──────────────────┘
  ```

### 3.3 Session Management with Google ADK Integration

**Google ADK Session Object Integration**
- **Session Tracking**: Use Google ADK's built-in session management
  - Reference: https://google.github.io/adk-docs/sessions/session/
  - Tracks individual conversations
  - Maintains context across messages
  - Stores conversation history

**DatabaseSessionService Configuration**
```python
from adk.sessions import DatabaseSessionService

# Initialize session service with SQLite
session_service = DatabaseSessionService(
    connection_string="sqlite:///chatbot_sessions.db",
    table_name="adk_sessions"  # Google ADK internal table
)

# Create user-specific session
session = session_service.create_session(
    session_id=generate_session_id(),
    metadata={
        "user_id": user_id,
        "session_name": "New Chat",
        "created_at": datetime.now().isoformat()
    }
)
```

**Session Lifecycle**

1. **Session Creation**
   - User clicks "[+ New Chat]"
   - Frontend calls: `POST /api/sessions/create`
   - Backend:
     - Validates user authentication
     - Creates Google ADK session: `session_service.create_session()`
     - Inserts record in `sessions` table with `user_id`
     - Returns session object to frontend
   - Frontend:
     - Adds new session to sidebar
     - Navigates to new session view
     - Focuses message input

2. **Session Loading**
   - User clicks on session in sidebar
   - Frontend calls: `GET /api/sessions/{session_id}`
   - Backend:
     - Validates session belongs to authenticated user
     - Loads Google ADK session: `session_service.get_session(session_id)`
     - Retrieves messages from database
     - Returns session data
   - Frontend:
     - Displays message history
     - Highlights active session in sidebar

3. **Session Updating**
   - New message sent in session
   - Backend:
     - Updates Google ADK session context
     - Updates `sessions.updated_at`
     - Increments `sessions.message_count`
     - Updates `sessions.last_message_preview`
   - Frontend:
     - Moves session to top of Recents
     - Updates preview text

4. **Session Deletion**
   - User deletes session from context menu
   - Frontend calls: `DELETE /api/sessions/{session_id}`
   - Backend:
     - Validates ownership
     - Deletes Google ADK session
     - Cascades delete in database (messages, executions)
   - Frontend:
     - Removes from sidebar
     - If active, navigate to another session or empty state

**User Session Isolation**
- **Critical Security Rule**: Sessions MUST be tied to `user_id`
- **Database Constraints**: Foreign key relationships enforce user ownership
- **API Layer**: All session endpoints MUST validate:
  ```python
  def get_user_sessions(user_id: str):
      # ALWAYS filter by user_id
      return db.query(Session).filter(Session.user_id == user_id).all()
  
  def get_session(session_id: str, user_id: str):
      session = db.query(Session).filter(
          Session.session_id == session_id,
          Session.user_id == user_id  # CRITICAL: prevent cross-user access
      ).first()
      if not session:
          raise HTTPException(status_code=404, detail="Session not found")
      return session
  ```

**Google ADK Session Metadata**
- Store user_id in session metadata for double verification:
  ```python
  session_metadata = {
      "user_id": user_id,
      "session_name": "Market Research Chat",
      "created_at": "2026-02-09T10:00:00Z",
      "tags": ["research", "finance"]
  }
  ```

### 3.4 Chat Interface (CopilotKit Integration)

**Layout**
- Full-height chat window (center area)
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
- Disabled when not in active session

### 3.5 Agent Thoughts Toggle & Multi-Agent Visualization

**Toggle Functionality**
- Prominent toggle button (top bar or right of chat area)
- Shows/hides complete agent orchestration
- Persistent state per user preference
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

**Data Structure for Agent Execution**

```typescript
interface AgentExecution {
  id: string;
  sessionId: string;
  userId: string;  // NEW: Always track user
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
    source?: string;
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
    destination?: string;
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
```

### 3.6 Authentication System

**Login Screen**

**Phase 1 Implementation**
```
┌────────────────────────────────────┐
│                                    │
│          [App Logo]                │
│                                    │
│   Agentic Chatbot Platform         │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ Email                        │  │
│  │ user@example.com             │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ Password                     │  │
│  │ ••••••••                     │  │
│  └──────────────────────────────┘  │
│                                    │
│  [ ] Remember me                   │
│                                    │
│  ┌──────────────────────────────┐  │
│  │      Sign In                 │  │
│  └──────────────────────────────┘  │
│                                    │
│  Contact admin for access          │
│                                    │
└────────────────────────────────────┘
```

**Login Flow**
1. User enters email (user_id) and password
2. Frontend calls: `POST /api/auth/login`
3. Backend:
   - Queries `users` table by `user_id`
   - Verifies password using bcrypt
   - Checks `is_active` flag
   - Generates JWT token or session token
   - Updates `last_login` timestamp
4. Frontend:
   - Stores auth token (localStorage/sessionStorage)
   - Redirects to main chat interface
   - Loads user's sessions from `/api/sessions`

**Authentication API**
```python
# Login endpoint
POST /api/auth/login
Request: {
    "user_id": "user@example.com",
    "password": "password123"
}
Response: {
    "token": "jwt_token_here",
    "user": {
        "user_id": "user@example.com",
        "is_admin": false,
        "last_login": "2026-02-09T10:00:00Z"
    }
}

# Token validation
GET /api/auth/validate
Headers: { "Authorization": "Bearer jwt_token" }
Response: {
    "valid": true,
    "user_id": "user@example.com"
}

# Logout
POST /api/auth/logout
Response: { "success": true }
```

**Session Token Management**
- JWT tokens with 24-hour expiration
- Refresh token mechanism (optional)
- Token includes: user_id, is_admin, issued_at, expires_at
- All API calls require valid token in Authorization header

### 3.7 Admin Panel

**Purpose**: Allow administrators to manage user accounts

**Access Control**
- Only users with `is_admin = TRUE` can access
- Admin panel link in left sidebar (bottom section)
- Hidden for non-admin users

**Admin Panel Features**

```
┌─────────────────────────────────────────────────────────────┐
│  Admin Panel                                        [Back]   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  User Management                                             │
│  ─────────────────────────────────────────────────────      │
│                                                               │
│  [+ Add New User]                                            │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Search users...                                  🔍 │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Email              Status    Admin   Last Login   Actions││
│  ├─────────────────────────────────────────────────────────┤│
│  │ user1@example.com  Active    No      2 mins ago   [Edit]││
│  │                                                    [Reset]││
│  │                                                   [Delete]││
│  ├─────────────────────────────────────────────────────────┤│
│  │ user2@example.com  Active    Yes     1 hour ago   [Edit]││
│  │                                                    [Reset]││
│  ├─────────────────────────────────────────────────────────┤│
│  │ user3@example.com  Inactive  No      Yesterday    [Edit]││
│  │                                                   [Delete]││
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Add New User Modal**
```
┌──────────────────────────────┐
│  Add New User                │
├──────────────────────────────┤
│                              │
│  Email (User ID) *           │
│  ┌──────────────────────┐    │
│  │ user@example.com     │    │
│  └──────────────────────┘    │
│                              │
│  Temporary Password *        │
│  ┌──────────────────────┐    │
│  │ ••••••••             │    │
│  └──────────────────────┘    │
│  [Generate Password]         │
│                              │
│  □ Admin privileges          │
│  □ Active                    │
│                              │
│  [Cancel]  [Create User]     │
└──────────────────────────────┘
```

**Edit User Modal**
```
┌──────────────────────────────┐
│  Edit User                   │
├──────────────────────────────┤
│                              │
│  Email: user1@example.com    │
│  (cannot be changed)         │
│                              │
│  □ Admin privileges          │
│  ☑ Active                    │
│                              │
│  Created: Feb 1, 2026        │
│  Last Login: 2 mins ago      │
│  Sessions: 15                │
│                              │
│  [Cancel]  [Save Changes]    │
└──────────────────────────────┘
```

**Reset Password Modal**
```
┌──────────────────────────────┐
│  Reset Password              │
├──────────────────────────────┤
│                              │
│  User: user1@example.com     │
│                              │
│  New Password *              │
│  ┌──────────────────────┐    │
│  │ ••••••••             │    │
│  └──────────────────────┘    │
│  [Generate Password]         │
│                              │
│  □ Require password change   │
│    on next login             │
│                              │
│  [Cancel]  [Reset Password]  │
└──────────────────────────────┘
```

**Admin Panel API Endpoints**
```python
# Get all users (admin only)
GET /api/admin/users
Response: { "users": User[] }

# Create user (admin only)
POST /api/admin/users
Request: {
    "user_id": "user@example.com",
    "password": "temp_password",
    "is_admin": false,
    "is_active": true
}
Response: { "user": User }

# Update user (admin only)
PUT /api/admin/users/{user_id}
Request: {
    "is_admin": true,
    "is_active": false
}
Response: { "user": User }

# Reset password (admin only)
POST /api/admin/users/{user_id}/reset-password
Request: {
    "new_password": "new_temp_password",
    "require_change": true
}
Response: { "success": true }

# Delete user (admin only)
DELETE /api/admin/users/{user_id}
Response: { "success": true }
```

**Admin Security Considerations**
- All admin endpoints validate `is_admin` flag
- Audit log for admin actions (future enhancement)
- Cannot delete own admin account
- Minimum one admin must exist in system
- Password complexity requirements enforced

### 3.8 Theme System

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
- Store preference in user profile (database)
- Synced across devices for same user
- Smooth transition animations (200ms)

**Theme Toggle**
- Accessible from header
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
- Conversation context display (Google ADK session context)
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
- Theme preferences
- Account settings (change password)

### 4.5 History and Search
- Search within current session
- Search across user's sessions (not other users)
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
- Cmd/Ctrl + B: Toggle sidebar
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
- Session recovery on reconnection

### 4.9 Agent Execution Analytics (Per User)
- **Average execution time per sub-agent**
- **Success/failure rates**
- **Most frequently used sub-agents**
- **Execution pattern visualization**
- **Performance bottleneck identification**
- Statistics filtered by user_id

---

## 5. User Flows

### 5.1 First-Time User Flow
1. Admin creates user account in admin panel
2. User receives email/credentials (manual communication)
3. User navigates to login screen
4. Enter email and temporary password
5. System authenticates and generates token
6. Redirect to main interface with empty sidebar
7. See empty state: "No conversations yet"
8. Click "[+ New Chat]" to create first session
9. Google ADK creates session tied to user_id
10. See onboarding tips/welcome message
11. Start chatting with agent

### 5.2 Returning User Flow
1. User navigates to login screen
2. Enter credentials (or auto-login if remembered)
3. System validates and loads user profile
4. Redirect to main interface
5. Left sidebar loads user's sessions (filtered by user_id)
6. User can:
   - Click existing session to resume
   - Click "[+ New Chat]" to start fresh
7. Begin interaction

### 5.3 Session Management Flow
1. User logs in, sees session list in left sidebar
2. Sessions displayed under "Recents" heading
3. User clicks "[+ New Chat]" button
4. System:
   - Creates Google ADK session
   - Stores in SQLite with user_id
   - Navigates to new empty chat
5. User sends first message
6. Session appears at top of "Recents"
7. User can switch between sessions by clicking in sidebar
8. Each session maintains its own:
   - Message history
   - Agent execution history
   - Context (via Google ADK)

### 5.4 Chat Interaction Flow with Multi-Agent Orchestration
1. User selects or creates session
2. User types message and sends
3. Message appears in chat
4. **Main agent begins orchestration**
5. Agent processing indicator shows
6. **If thoughts toggle ON:**
   - Main agent reasoning appears in right panel
   - Sub-agent execution cards appear
   - Real-time status updates for each sub-agent
   - Execution timeline updates
7. **User can interact during execution:**
   - Expand specific sub-agent cards
   - View input/output in real-time
   - See processing steps as they occur
8. Final response streams in
9. **Agent execution summary shows:**
   - Total agents used
   - Total execution time
   - Quick stats
10. Session metadata updates:
    - `updated_at` timestamp
    - `message_count` increment
    - `last_message_preview` updated
11. Session moves to top of "Recents" sidebar

### 5.5 Admin User Management Flow
1. Admin logs in with admin credentials
2. Sees "Admin Panel" link in left sidebar
3. Clicks to access admin panel
4. Views list of all users
5. To add user:
   - Click "[+ Add New User]"
   - Enter email and password
   - Set admin/active flags
   - Click "Create User"
   - System hashes password and stores in database
6. To manage existing user:
   - Click [Edit] to modify permissions
   - Click [Reset] to change password
   - Click [Delete] to remove user (cascades to sessions)
7. Admin actions logged (future: audit trail)

### 5.6 Session Isolation Verification Flow
1. User A logs in (user_id: userA@example.com)
2. Creates sessions: Session-A1, Session-A2
3. User A logs out
4. User B logs in (user_id: userB@example.com)
5. User B sees ONLY their own sessions in sidebar
6. User B creates Session-B1
7. System ensures:
   - API calls filter by user_id
   - Database queries include user_id in WHERE clause
   - No cross-user session access possible
8. Any attempt to access Session-A1 with User B's token returns 404

---

## 6. Technical Requirements

### 6.1 Frontend Architecture
```
/src
  /components
    /Layout
      AppLayout.tsx                     # Main layout with sidebar
      Header.tsx
      LeftSidebar.tsx                   # NEW: Session navigation
      ThemeToggle.tsx
      ThoughtsToggle.tsx
      UserMenu.tsx                      # NEW: User dropdown
    /Sidebar
      NewChatButton.tsx                 # NEW: + New Chat button
      RecentsSection.tsx                # NEW: Recents heading + list
      SessionList.tsx                   # NEW: Session items
      SessionItem.tsx                   # NEW: Individual session card
      SessionContextMenu.tsx            # NEW: Right-click menu
      SidebarSearch.tsx                 # Optional search
    /Chat
      ChatWindow.tsx
      MessageList.tsx
      MessageInput.tsx
      Message.tsx
      AgentExecutionSummary.tsx
    /AgentThoughts
      ThoughtsPanel.tsx
      MainAgentReasoning.tsx
      SubAgentExecutionList.tsx
      SubAgentCard.tsx
      AgentInput.tsx
      AgentProcessing.tsx
      AgentOutput.tsx
      AgentMetrics.tsx
      AgentExecutionGraph.tsx
      AgentTimeline.tsx
    /Auth
      LoginScreen.tsx                   # Updated with email/password
      PrivateRoute.tsx                  # Protected route wrapper
    /Admin
      AdminPanel.tsx                    # NEW: Admin interface
      UserList.tsx                      # NEW: User table
      AddUserModal.tsx                  # NEW: Create user
      EditUserModal.tsx                 # NEW: Edit user
      ResetPasswordModal.tsx            # NEW: Password reset
    /Settings
      SettingsPanel.tsx
      AccountSettings.tsx               # NEW: Change password, etc.
  /theme
    muiTheme.ts
    appleColors.ts
    agentColors.ts
  /hooks
    useTheme.ts
    useSession.ts
    useAgent.ts
    useAgentExecution.ts
    useSubAgentExpansion.ts
    useAuth.ts                          # NEW: Authentication hook
    useSessions.ts                      # NEW: Session management
  /services
    api.ts
    auth.ts                             # NEW: Auth API calls
    session.ts                          # Updated with user filtering
    agentExecution.ts
    admin.ts                            # NEW: Admin API calls
  /contexts
    AuthContext.tsx                     # NEW: User authentication state
    ThemeContext.tsx
    SessionContext.tsx                  # Updated with user sessions
    AgentExecutionContext.tsx
  /types
    agent.ts
    subAgent.ts
    user.ts                             # NEW: User types
    session.ts                          # Updated with user_id
  /utils
    agentFormatters.ts
    executionAnalyzer.ts
    auth.ts                             # NEW: Token management
    validation.ts                       # NEW: Input validation
```

### 6.2 Backend Architecture
```
/backend
  /api
    /routes
      auth.py                           # NEW: Login, logout, validate
      sessions.py                       # Updated with user filtering
      chat.py
      agent_execution.py
      admin.py                          # NEW: User management
    /middleware
      auth_middleware.py                # NEW: JWT validation
      user_validation.py                # NEW: Ensure user_id match
  /services
    auth_service.py                     # NEW: Password hashing, tokens
    session_service.py                  # Google ADK integration
    agent_service.py
    admin_service.py                    # NEW: User CRUD
  /models
    user.py                             # NEW: User model
    session.py                          # Updated with user_id
    message.py
    agent_execution.py
  /database
    sqlite_db.py                        # NEW: SQLite connection
    migrations/                         # NEW: Database migrations
      001_initial_schema.sql
      002_add_users.sql
  /config
    config.py                           # Database, JWT, ADK config
  /utils
    password.py                         # NEW: bcrypt hashing
    jwt_helper.py                       # NEW: Token generation
```

### 6.3 Google ADK Session Integration

**Configuration**
```python
# backend/services/session_service.py

from adk.sessions import DatabaseSessionService, Session
import sqlite3

class ChatSessionService:
    def __init__(self, db_path: str):
        # Initialize Google ADK session service
        self.adk_session_service = DatabaseSessionService(
            connection_string=f"sqlite:///{db_path}",
            table_name="adk_sessions"
        )
        
        # Local database connection for custom tables
        self.db = sqlite3.connect(db_path)
        self.cursor = self.db.cursor()
    
    def create_session(self, user_id: str, session_name: str = None) -> dict:
        """Create new session for user"""
        session_id = self.generate_session_id()
        
        # Create Google ADK session
        adk_session = self.adk_session_service.create_session(
            session_id=session_id,
            metadata={
                "user_id": user_id,
                "session_name": session_name or f"New Chat - {datetime.now().strftime('%b %d')}",
                "created_at": datetime.now().isoformat()
            }
        )
        
        # Store in our sessions table
        self.cursor.execute("""
            INSERT INTO sessions (session_id, user_id, session_name, session_data)
            VALUES (?, ?, ?, ?)
        """, (session_id, user_id, session_name, json.dumps(adk_session.to_dict())))
        self.db.commit()
        
        return {
            "session_id": session_id,
            "user_id": user_id,
            "session_name": session_name,
            "created_at": datetime.now().isoformat()
        }
    
    def get_user_sessions(self, user_id: str) -> list:
        """Get all sessions for a specific user"""
        self.cursor.execute("""
            SELECT session_id, session_name, created_at, updated_at, 
                   message_count, last_message_preview, agent_count
            FROM sessions
            WHERE user_id = ?
            ORDER BY updated_at DESC
        """, (user_id,))
        
        return [dict(row) for row in self.cursor.fetchall()]
    
    def get_session(self, session_id: str, user_id: str) -> Session:
        """Get session and verify ownership"""
        # Verify ownership
        self.cursor.execute("""
            SELECT user_id FROM sessions WHERE session_id = ?
        """, (session_id,))
        
        result = self.cursor.fetchone()
        if not result or result[0] != user_id:
            raise PermissionError("Session not found or access denied")
        
        # Load Google ADK session
        return self.adk_session_service.get_session(session_id)
    
    def update_session(self, session_id: str, user_id: str, **kwargs):
        """Update session metadata"""
        # Verify ownership first
        self.get_session(session_id, user_id)
        
        # Update our table
        update_fields = []
        params = []
        
        if "message_count" in kwargs:
            update_fields.append("message_count = message_count + 1")
        if "last_message_preview" in kwargs:
            update_fields.append("last_message_preview = ?")
            params.append(kwargs["last_message_preview"])
        if "agent_count" in kwargs:
            update_fields.append("agent_count = ?")
            params.append(kwargs["agent_count"])
        
        update_fields.append("updated_at = CURRENT_TIMESTAMP")
        params.extend([session_id, user_id])
        
        self.cursor.execute(f"""
            UPDATE sessions
            SET {', '.join(update_fields)}
            WHERE session_id = ? AND user_id = ?
        """, params)
        self.db.commit()
    
    def delete_session(self, session_id: str, user_id: str):
        """Delete session and verify ownership"""
        # Verify ownership
        self.get_session(session_id, user_id)
        
        # Delete from Google ADK
        self.adk_session_service.delete_session(session_id)
        
        # Delete from our table (cascade handles messages, executions)
        self.cursor.execute("""
            DELETE FROM sessions WHERE session_id = ? AND user_id = ?
        """, (session_id, user_id))
        self.db.commit()
```

### 6.4 Authentication Implementation

**Password Hashing**
```python
# backend/utils/password.py

import bcrypt

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
```

**JWT Token Generation**
```python
# backend/utils/jwt_helper.py

import jwt
from datetime import datetime, timedelta

SECRET_KEY = "your-secret-key-here"  # Load from config
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24

def create_access_token(user_id: str, is_admin: bool) -> str:
    """Generate JWT token"""
    payload = {
        "user_id": user_id,
        "is_admin": is_admin,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> dict:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise Exception("Token has expired")
    except jwt.InvalidTokenError:
        raise Exception("Invalid token")
```

**Authentication Middleware**
```python
# backend/api/middleware/auth_middleware.py

from fastapi import HTTPException, Header
from utils.jwt_helper import verify_token

async def get_current_user(authorization: str = Header(None)):
    """Extract and validate user from JWT token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        payload = verify_token(token)
        return {
            "user_id": payload["user_id"],
            "is_admin": payload["is_admin"]
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
```

### 6.5 Performance Requirements
- Initial load: < 2 seconds
- Message send to response start: < 500ms
- Session list load: < 300ms
- Session switch: < 200ms
- Agent thought rendering: < 100ms per sub-agent
- Smooth 60fps animations
- Optimistic UI updates
- Message virtualization for long histories
- **Lazy loading of agent execution details**
- **Pagination for session list (load 20 at a time)**
- **SQLite query optimization with proper indexes**

### 6.6 Security Requirements
- **CRITICAL**: All session operations MUST validate user_id
- Password hashing with bcrypt (cost factor 12)
- JWT tokens with expiration
- HTTPS only in production
- SQL injection prevention (parameterized queries)
- XSS protection
- CSRF protection
- Rate limiting on login attempts
- Secure password reset flow (future)
- Audit logging for admin actions (future)

### 6.7 Browser Support
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
    hover: '#F0F0F2',
    active: '#E8E8ED',
    // Sidebar specific
    sidebarBackground: '#F5F5F7',
    sidebarBorder: '#D2D2D7',
    sessionActive: '#E8E8ED',
    sessionHover: '#F0F0F2',
    // Agent-specific colors
    agentInput: '#E3F2FD',
    agentProcessing: '#F3E5F5',
    agentOutput: '#E8F5E9',
    agentMetrics: '#FAFAFA',
    agentError: '#FFEBEE',
  },
  dark: {
    primary: '#0A84FF',
    background: '#000000',
    surface: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#98989D',
    border: '#38383A',
    hover: '#2C2C2E',
    active: '#3A3A3C',
    // Sidebar specific
    sidebarBackground: '#1C1C1E',
    sidebarBorder: '#38383A',
    sessionActive: '#3A3A3C',
    sessionHover: '#2C2C2E',
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
    h2: { fontSize: 22, fontWeight: 600 },
    h3: { fontSize: 18, fontWeight: 500 },
    body1: { fontSize: 15, lineHeight: 1.5 },
    body2: { fontSize: 13, lineHeight: 1.4 },
    caption: { fontSize: 11, lineHeight: 1.3 },  // Session timestamps
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

**Desktop Layout**
- Left sidebar: 280px fixed width
- Chat area: flexible (50-60% when thoughts visible)
- Thoughts panel: 40-50% when expanded, 0px when collapsed
- Header height: 64px
- Sidebar padding: 16px
- Content max-width: 1400px

**Sidebar Specifications**
- Width: 280px
- Padding: 16px
- Background: theme.sidebarBackground
- Border-right: 1px solid theme.sidebarBorder
- Overflow-y: auto
- Overflow-x: hidden

**New Chat Button**
- Height: 44px
- Width: calc(100% - 32px) // Full width minus padding
- Margin: 0 0 16px 0
- Border-radius: 8px
- Font-size: 15px
- Font-weight: 500
- Icon size: 18px

**Session Item**
- Height: auto (min 64px)
- Padding: 12px
- Margin: 4px 0
- Border-radius: 8px
- Hover: background change
- Active: background + border accent

**Message padding**: 16px
**Input area height**: 60-80px (auto-expand)
**Sub-agent card padding**: 12px
**Sub-agent card margin**: 8px
**Nested indentation**: 16px per level

### 7.3 Component Specifications

**Session Item Component**
```jsx
<SessionItem active={isActive}>
  <SessionTitle>{sessionName}</SessionTitle>
  <SessionMeta>
    <Timestamp>2 mins ago</Timestamp>
    {messageCount > 0 && <MessageCount>{messageCount}</MessageCount>}
    {agentCount > 0 && <AgentBadge>{agentCount} agents</AgentBadge>}
  </SessionMeta>
  {lastMessagePreview && (
    <MessagePreview>{lastMessagePreview}</MessagePreview>
  )}
</SessionItem>
```

**New Chat Button Component**
```jsx
<NewChatButton onClick={createNewSession}>
  <PlusIcon />
  <ButtonText>New Chat</ButtonText>
</NewChatButton>
```

**User Menu Component** (Header right side)
```jsx
<UserMenu>
  <UserAvatar>{userInitials}</UserAvatar>
  <Dropdown>
    <MenuItem>Settings</MenuItem>
    {isAdmin && <MenuItem>Admin Panel</MenuItem>}
    <Divider />
    <MenuItem>Logout</MenuItem>
  </Dropdown>
</UserMenu>
```

---

## 8. API Specifications

### 8.1 Authentication Endpoints
```
POST /api/auth/login
Request: {
    "user_id": "user@example.com",
    "password": "password123"
}
Response: {
    "token": "jwt_token_here",
    "user": {
        "user_id": "user@example.com",
        "is_admin": false,
        "last_login": "2026-02-09T10:00:00Z"
    }
}

GET /api/auth/validate
Headers: { "Authorization": "Bearer jwt_token" }
Response: {
    "valid": true,
    "user_id": "user@example.com",
    "is_admin": false
}

POST /api/auth/logout
Headers: { "Authorization": "Bearer jwt_token" }
Response: { "success": true }
```

### 8.2 Session Management Endpoints
```
GET /api/sessions
Headers: { "Authorization": "Bearer jwt_token" }
Response: {
    "sessions": [
        {
            "session_id": "sess_123",
            "session_name": "Market Research",
            "created_at": "2026-02-09T10:00:00Z",
            "updated_at": "2026-02-09T10:30:00Z",
            "message_count": 15,
            "last_message_preview": "Based on the data...",
            "agent_count": 3
        }
    ]
}

POST /api/sessions
Headers: { "Authorization": "Bearer jwt_token" }
Request: {
    "session_name": "New Research Session"  // Optional
}
Response: {
    "session": {
        "session_id": "sess_456",
        "user_id": "user@example.com",
        "session_name": "New Research Session",
        "created_at": "2026-02-09T11:00:00Z"
    }
}

GET /api/sessions/{session_id}
Headers: { "Authorization": "Bearer jwt_token" }
Response: {
    "session": Session,
    "messages": Message[],
    "agent_executions": AgentExecution[]
}

PUT /api/sessions/{session_id}
Headers: { "Authorization": "Bearer jwt_token" }
Request: {
    "session_name": "Updated Name"
}
Response: {
    "session": Session
}

DELETE /api/sessions/{session_id}
Headers: { "Authorization": "Bearer jwt_token" }
Response: { "success": true }
```

### 8.3 Chat & Agent Execution Endpoints
```
POST /api/chat/message
Headers: { "Authorization": "Bearer jwt_token" }
Request: {
    "session_id": "sess_123",
    "message": "What are the latest trends?"
}
Response: Stream of AgentMessage types

WebSocket /ws/chat/{session_id}
Headers: { "Authorization": "Bearer jwt_token" }
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

GET /api/agent-execution/{execution_id}
Headers: { "Authorization": "Bearer jwt_token" }
Response: { "execution": DetailedAgentExecution }
```

### 8.4 Admin Endpoints
```
GET /api/admin/users
Headers: { "Authorization": "Bearer jwt_token" }
Requires: is_admin = true
Response: {
    "users": [
        {
            "user_id": "user1@example.com",
            "is_active": true,
            "is_admin": false,
            "created_at": "2026-02-01T10:00:00Z",
            "last_login": "2026-02-09T10:00:00Z"
        }
    ]
}

POST /api/admin/users
Headers: { "Authorization": "Bearer jwt_token" }
Requires: is_admin = true
Request: {
    "user_id": "newuser@example.com",
    "password": "temp_password",
    "is_admin": false,
    "is_active": true
}
Response: {
    "user": User
}

PUT /api/admin/users/{user_id}
Headers: { "Authorization": "Bearer jwt_token" }
Requires: is_admin = true
Request: {
    "is_admin": true,
    "is_active": false
}
Response: {
    "user": User
}

POST /api/admin/users/{user_id}/reset-password
Headers: { "Authorization": "Bearer jwt_token" }
Requires: is_admin = true
Request: {
    "new_password": "new_temp_password"
}
Response: { "success": true }

DELETE /api/admin/users/{user_id}
Headers: { "Authorization": "Bearer jwt_token" }
Requires: is_admin = true
Response: { "success": true }
```

---

## 9. Development Phases

### Phase 1: MVP (Current Scope)

**Week 1-2: Foundation**
- ✅ SQLite database setup with schema
- ✅ User authentication system (login, JWT)
- ✅ Admin panel for user management
- ✅ Basic React app structure
- ✅ Apple-inspired MUI theme
- ✅ Header and layout components

**Week 3-4: Core Features**
- ✅ Left sidebar with session list
- ✅ "Recents" section with session items
- ✅ "[+ New Chat]" button functionality
- ✅ Google ADK session integration
- ✅ DatabaseSessionService with SQLite
- ✅ Session CRUD operations with user_id filtering
- ✅ Basic chat interface (CopilotKit)

**Week 5-6: Agent Features**
- ✅ Multi-agent orchestration visualization
- ✅ Sub-agent input/output display
- ✅ Agent execution timeline
- ✅ Agent thoughts toggle with expandable sub-agents
- ✅ Real-time agent execution streaming

**Week 7-8: Polish & Testing**
- ✅ Theme system (light/dark/system)
- ✅ Session switching and persistence
- ✅ Error handling and validation
- ✅ Security testing (session isolation)
- ✅ Performance optimization
- ✅ User acceptance testing

### Phase 2: Enhanced Features (Future)
- Identity Server integration (replace local auth)
- Advanced session features (sharing, export with agent details)
- Agent execution graph visualization
- Advanced filtering and search in agent executions
- Rich media support
- Advanced agent controls
- Agent performance analytics dashboard
- Password reset flow
- Email notifications

### Phase 3: Enterprise Features (Future)
- Team collaboration
- Role-based access control (RBAC)
- Agent execution audit logs
- Usage analytics and reporting
- Custom agent configurations
- Sub-agent marketplace/registry
- SSO integration (OAuth, SAML)
- Agent execution replay/debugging
- Multi-tenancy support

---

## 10. Success Criteria

### 10.1 Technical Success
- All core features implemented
- < 100ms response time for UI interactions
- Session list loads in < 300ms
- Real-time agent execution updates with < 50ms latency
- Smooth expansion/collapse of sub-agent cards
- Zero critical bugs at launch
- 95%+ uptime
- Handle up to 20 concurrent sub-agent executions
- **100% session isolation (zero cross-user access)**
- **Successful authentication flow**

### 10.2 User Success
- Intuitive first-use experience
- < 2 minutes from login to first message
- Users can understand agent orchestration within 2 minutes
- >70% of power users enable agent thoughts toggle
- Positive feedback on design and usability
- High session reuse rate
- Clear understanding of when/why sub-agents are used
- **Easy session navigation and creation**
- **Zero user complaints about seeing others' sessions**

### 10.3 Security Success
- **Zero session leakage between users**
- All admin actions properly authorized
- Password security best practices followed
- JWT tokens properly validated
- SQL injection prevention verified
- No XSS vulnerabilities

---

## 11. Out of Scope (Phase 1)

- Real Identity Server integration
- Multi-user collaboration features
- Mobile native apps
- Voice input/output
- Advanced analytics dashboard
- Custom agent training
- API access for external integrations
- Agent execution replay/debugging tools
- Custom sub-agent development UI
- Agent performance optimization suggestions
- Email notifications
- Password reset flow
- OAuth/SSO integration
- Session sharing between users
- Export to external formats

---

## 12. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Session isolation breach | **CRITICAL** | **Comprehensive testing, code review, security audit** |
| Google ADK API changes | High | Version pinning, abstraction layer |
| Complex agent execution data overwhelming UI | High | Progressive disclosure, lazy loading, clear visual hierarchy |
| Performance with many sub-agents | High | Virtualization, pagination, collapse by default |
| SQLite concurrent access issues | High | Proper locking, connection pooling, WAL mode |
| Authentication vulnerabilities | High | bcrypt hashing, JWT best practices, rate limiting |
| CopilotKit limitations | Medium | Evaluate alternatives early, custom components |
| Real-time streaming reliability | Medium | WebSocket reconnection, fallback to polling |
| Performance with long sessions | Medium | Message virtualization, pagination |
| Password management complexity | Medium | Admin panel for resets, clear documentation |
| Theme consistency | Low | Comprehensive design system, regular reviews |
| Inconsistent agent execution data format | Medium | Strict typing, validation layer, data normalization |

---

## 13. Database Schema Details

### 13.1 Complete Schema
```sql
-- Users table
CREATE TABLE users (
    user_id TEXT PRIMARY KEY,          -- Email address
    password_hash TEXT NOT NULL,       -- bcrypt hashed password
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE
);

-- Sessions table (integrates with Google ADK Session Object)
CREATE TABLE sessions (
    session_id TEXT PRIMARY KEY,       -- Google ADK session ID
    user_id TEXT NOT NULL,             -- Owner of this session (CRITICAL)
    session_name TEXT,                 -- User-defined or auto-generated name
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    message_count INTEGER DEFAULT 0,
    last_message_preview TEXT,
    agent_count INTEGER DEFAULT 0,     -- Number of agents invoked
    session_data TEXT,                 -- JSON: Google ADK session metadata
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Critical index for session isolation
CREATE INDEX idx_sessions_user_id ON sessions(user_id, updated_at DESC);

-- Messages table
CREATE TABLE messages (
    message_id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id TEXT NOT NULL,             -- Denormalized for fast filtering
    role TEXT NOT NULL,                -- 'user' or 'assistant'
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    agent_execution_id TEXT,           -- Link to agent execution
    FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_messages_session ON messages(session_id, timestamp);
CREATE INDEX idx_messages_user ON messages(user_id, timestamp DESC);

-- Agent executions table
CREATE TABLE agent_executions (
    execution_id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    message_id TEXT NOT NULL,
    user_id TEXT NOT NULL,             -- Denormalized for fast filtering
    main_agent_data TEXT,              -- JSON: main agent execution details
    sub_agents_data TEXT,              -- JSON: array of sub-agent executions
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    duration_ms INTEGER,
    status TEXT,                       -- 'pending', 'running', 'completed', 'failed'
    FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY (message_id) REFERENCES messages(message_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_executions_session ON agent_executions(session_id);
CREATE INDEX idx_executions_user ON agent_executions(user_id);

-- Google ADK internal table (managed by DatabaseSessionService)
-- This table is created and managed by Google ADK
-- We reference it but don't directly modify it
-- CREATE TABLE adk_sessions (...);  -- Managed by ADK
```

### 13.2 Initial Data Seeding
```sql
-- Create default admin user
INSERT INTO users (user_id, password_hash, is_admin, is_active)
VALUES ('admin@example.com', '$2b$12$...', TRUE, TRUE);

-- Note: Password should be hashed using bcrypt
-- Example Python code:
-- import bcrypt
-- password = "admin123"
-- hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
```

---

## 14. Wireframes

### 14.1 Login Screen
```
┌────────────────────────────────────┐
│                                    │
│          [App Logo]                │
│                                    │
│   Agentic Chatbot Platform         │
│   Powered by Google ADK            │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ Email                        │  │
│  │ user@example.com             │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ Password                     │  │
│  │ ••••••••                     │  │
│  └──────────────────────────────┘  │
│                                    │
│  [ ] Remember me                   │
│                                    │
│  ┌──────────────────────────────┐  │
│  │      Sign In                 │  │
│  └──────────────────────────────┘  │
│                                    │
│  Contact admin for access          │
│                                    │
└────────────────────────────────────┘
```

### 14.2 Main Interface with Left Sidebar
```
┌─────────────────────────────────────────────────────────────────────────┐
│  [Logo]    Current Session Name          [🌙] [Settings] [@User ▼]     │
├──────────┬────────────────────────────────┬──────────────────────────────┤
│          │                                │                              │
│[+New     │   Main Chat Area               │  Agent Thoughts Panel        │
│  Chat]   │   ──────────────────           │  ─────────────────────       │
│          │                                │  (Toggleable ON/OFF)         │
│ Recents  │   User: What are the latest... │                              │
│ ────────│   10:30 AM                     │  🧠 Main Agent               │
│          │                                │  Planning strategy...        │
│ ● Market │   Assistant: Based on the...  │                              │
│   Resear │   10:31 AM                     │  Sub-Agents:                 │
│   2m ago │   [3 agents used] ↓ Details    │  ▼ Research Agent      [✓]  │
│          │                                │     Status: Complete         │
│ □ Q4     │   User: Can you analyze...     │     Input: {...}             │
│   Report │   10:32 AM                     │     Output: {...}            │
│   1h ago │                                │                              │
│          │   Assistant: [Thinking...]     │  ▶ Analysis Agent      [⟳]  │
│ □ Budget │   10:33 AM (processing)        │     Status: Running...       │
│   Review │                                │                              │
│   Yest.  │                                │  □ Summary Agent       [ ]  │
│          │                                │     Status: Pending          │
│ □ Team   │                                │                              │
│   Notes  │                                │                              │
│   Feb 8  │                                │                              │
│          │                                │                              │
│ [Load    │                                │                              │
│  more]   │                                │                              │
│          │                                │                              │
│          ├────────────────────────────────┤                              │
│ Settings │ Type your message...    [Send] │                              │
│ [Admin]  │                                │                              │
└──────────┴────────────────────────────────┴──────────────────────────────┘
```

### 14.3 Empty State (No Sessions)
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]    Agentic Chatbot          [🌙] [@User ▼]          │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│[+New     │                                                  │
│  Chat]   │              Welcome back!                       │
│          │                                                  │
│ Recents  │         No conversations yet.                    │
│ ────────│         Start a new chat to begin.              │
│          │                                                  │
│  (empty) │          [+ Create New Chat]                     │
│          │                                                  │
│          │                                                  │
│          │        Or explore these topics:                  │
│          │        • Market Analysis                         │
│          │        • Financial Reports                       │
│          │        • Team Collaboration                      │
│          │                                                  │
│          │                                                  │
│          │                                                  │
│ Settings │                                                  │
│          │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

---

## 15. Appendix

### 15.1 Glossary
- **Agent Thoughts**: Internal reasoning steps the AI agent takes
- **Main Agent**: Primary orchestrator that decides which sub-agents to invoke
- **Sub-Agent**: Specialized agent invoked by main agent for specific tasks
- **Agent Execution**: Complete lifecycle of an agent from start to completion
- **Processing Steps**: Individual operations performed within an agent
- **Session**: A conversation thread with persistent history tied to a user
- **Session Isolation**: Security principle ensuring users only see their own sessions
- **User ID**: Email address used as unique identifier
- **Google ADK**: Agentic Development Kit for building AI agents
- **DatabaseSessionService**: Google ADK's SQLite-based session persistence
- **CopilotKit**: React framework for building AI-powered interfaces
- **JWT**: JSON Web Token for authentication
- **bcrypt**: Password hashing algorithm

### 15.2 References
- [CopilotKit Documentation](https://docs.copilotkit.ai)
- [Material UI Documentation](https://mui.com)
- [Apple Human Interface Guidelines](https://developer.apple.com/design)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
- [Google ADK Sessions](https://google.github.io/adk-docs/sessions/session/)
- [React Flow Documentation](https://reactflow.dev)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [JWT Best Practices](https://jwt.io/introduction)
- [bcrypt Documentation](https://github.com/pyca/bcrypt/)

### 15.3 Security Checklist
- [ ] All session queries filter by user_id
- [ ] JWT tokens validated on every protected endpoint
- [ ] Passwords hashed with bcrypt (cost 12+)
- [ ] SQL queries use parameterized statements
- [ ] Admin actions check is_admin flag
- [ ] HTTPS enforced in production
- [ ] Rate limiting on login endpoint
- [ ] Session tokens expire after 24 hours
- [ ] Cross-user session access returns 404 (not 403)
- [ ] Database indexes optimized for user_id queries
- [ ] WebSocket connections authenticated
- [ ] File uploads validated (future feature)

### 15.4 Testing Checklist

**Session Isolation Testing**
- [ ] User A cannot see User B's sessions
- [ ] User A cannot access User B's session by ID
- [ ] API returns 404 for non-existent/unauthorized sessions
- [ ] Database queries always include user_id filter
- [ ] WebSocket connections validate session ownership
- [ ] Session deletion only works for owner

**Authentication Testing**
- [ ] Valid credentials allow login
- [ ] Invalid credentials rejected
- [ ] Expired tokens rejected
- [ ] Logout invalidates token
- [ ] Admin panel only accessible to admins
- [ ] Password hashing works correctly

**Functional Testing**
- [ ] New chat button creates session
- [ ] Session list displays user's sessions only
- [ ] Session switching works smoothly
- [ ] Messages persist across sessions
- [ ] Agent thoughts display correctly
- [ ] Theme switching works
- [ ] Mobile responsive layout works

---

**Document Version**: 3.0  
**Last Updated**: February 11, 2026  
**Status**: Updated with Left Sidebar Navigation, User Authentication, and Session Isolation