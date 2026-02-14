# Plan: Enhanced Session Management and User Login Features

## Context

The Agent Studio app currently has **mock authentication** (username-only, localStorage) and **localStorage-based session management** with no backend persistence or user isolation. The PRD_v3 requires real authentication with JWT/bcrypt, backend-persisted sessions tied to users, a persistent left sidebar for session navigation, and an admin panel for user management. This change transforms the app from a single-user prototype to a multi-user application with proper security.

**Two repos involved:**
- Frontend: `/Users/frankielim/git/copilotkit-app-quickstart` (Next.js 16 + React 19 + CopilotKit + MUI)
- Backend: `/Users/frankielim/git/adk-agent-quickstart` (Google ADK + FastAPI, port 8000)

---

## Key Architectural Decisions

1. **New REST endpoints alongside ADK agent**: Add FastAPI `APIRouter`s for `/api/auth/*`, `/api/sessions/*`, `/api/admin/*` to the same FastAPI app. The ADK agent stays at `POST /` -- other paths are free.

2. **Frontend API proxy**: Create `app/api/backend/[...path]/route.ts` to forward requests to `http://localhost:8000/api/*`. Avoids CORS issues, keeps same-origin pattern.

3. **Separate databases**: ADK manages its own `adk_sessions.db` via `DatabaseSessionService`. Our custom tables (users, sessions, messages, agent_executions) live in `app_data.db` via `aiosqlite`.

4. **Session isolation chain**: JWT token -> frontend sends `Authorization` header -> proxy forwards to backend -> auth middleware extracts `user_id` -> all session queries filter by `user_id`.

5. **Layout restructure**: Replace the 3-view-state pattern (`login | sessions | chat`) with 2 states (`login | main`). The `main` state always shows sidebar + content area simultaneously.

---

## Phase 1: Backend Foundation (Database + Auth + Session + Admin Endpoints)

### 1A: Database Setup

| Action | File | Details |
|--------|------|---------|
| Create | `adk_web_agent/database/__init__.py` | Package init |
| Create | `adk_web_agent/database/db.py` | Async SQLite connection manager (`aiosqlite`, WAL mode) |
| Create | `adk_web_agent/database/schema.sql` | Full schema from PRD 2.3: `users`, `sessions`, `messages`, `agent_executions` tables + indexes |
| Create | `adk_web_agent/database/init_db.py` | Create tables + seed admin user (`admin@example.com` / `admin123`) |
| Modify | `pyproject.toml` | Add: `aiosqlite>=0.20.0`, `bcrypt>=4.2.0`, `PyJWT>=2.9.0` |

### 1B: Authentication System

| Action | File | Details |
|--------|------|---------|
| Create | `adk_web_agent/auth/__init__.py` | Package init |
| Create | `adk_web_agent/auth/password.py` | `hash_password()`, `verify_password()` (bcrypt, cost 12) |
| Create | `adk_web_agent/auth/jwt_helper.py` | `create_access_token()`, `verify_token()` (HS256, 24h expiry, secret from `JWT_SECRET` env var) |
| Create | `adk_web_agent/auth/middleware.py` | `get_current_user()` and `require_admin()` FastAPI dependencies |

### 1C: API Routes

| Action | File | Details |
|--------|------|---------|
| Create | `adk_web_agent/routes/__init__.py` | Package init |
| Create | `adk_web_agent/routes/auth.py` | `POST /api/auth/login`, `GET /api/auth/validate`, `POST /api/auth/logout` |
| Create | `adk_web_agent/routes/sessions.py` | `GET /api/sessions`, `POST /api/sessions`, `GET /api/sessions/{id}`, `PUT /api/sessions/{id}`, `DELETE /api/sessions/{id}` -- all with user_id filtering |
| Create | `adk_web_agent/routes/admin.py` | `GET /api/admin/users`, `POST /api/admin/users`, `PUT /api/admin/users/{id}`, `POST /api/admin/users/{id}/reset-password`, `DELETE /api/admin/users/{id}` -- all require admin |

### 1D: Wire Into agent.py

| Action | File | Details |
|--------|------|---------|
| Modify | `adk_web_agent/agent.py` | Include all routers, add lifespan event for `init_db()`, switch to `DatabaseSessionService`, change `user_id="demo_user"` to dynamic extraction from request headers |

---

## Phase 2: Frontend Auth + API Layer

### 2A: API Proxy and Service Layer

| Action | File | Details |
|--------|------|---------|
| Create | `app/api/backend/[...path]/route.ts` | Proxy GET/POST/PUT/DELETE to `http://localhost:8000/api/*`, forwards `Authorization` header |
| Create | `app/services/api.ts` | Base fetch wrapper with auto JWT injection, 401 -> logout |
| Create | `app/services/authService.ts` | `login()`, `validate()`, `logout()` |
| Create | `app/services/sessionService.ts` | `listSessions()`, `createSession()`, `getSession()`, `updateSession()`, `deleteSession()` |
| Create | `app/services/adminService.ts` | `listUsers()`, `createUser()`, `updateUser()`, `resetPassword()`, `deleteUser()` |

### 2B: Update Auth

| Action | File | Details |
|--------|------|---------|
| Modify | `app/types/auth.ts` | Expand `User` with `is_admin`, `last_login`; add `LoginRequest`, `LoginResponse` types |
| Modify | `app/contexts/AuthContext.tsx` | Replace mock with real API calls, async `login(email, password)`, token validation on mount, `isLoading`/`error` states |
| Modify | `app/components/Auth/LoginScreen.tsx` | Add email + password fields, error display, loading state, "Contact admin for access" footer |
| Modify | `app/api/copilotkit/route.ts` | Extract `user_id` from JWT in `Authorization` header, pass as `x-username` to backend |

---

## Phase 3: Frontend Session Context Refactor

| Action | File | Details |
|--------|------|---------|
| Modify | `app/types/session.ts` | Add `userId` field |
| Modify | `app/contexts/SessionContext.tsx` | Replace all localStorage with backend API calls. `createSession`/`selectSession`/`deleteSession` become async. Add `loadSessions()` triggered by auth state. Add `renameSession()`. Add `isLoading` state. |

---

## Phase 4: Left Sidebar Layout (Major UI Change)

### 4A: Sidebar Components

| Action | File | Details |
|--------|------|---------|
| Create | `app/components/Sidebar/LeftSidebar.tsx` | 280px fixed sidebar, contains NewChatButton + RecentsSection, bottom: Settings/Admin links |
| Create | `app/components/Sidebar/NewChatButton.tsx` | Full-width "+ New Chat" button, Apple-style |
| Create | `app/components/Sidebar/SessionItem.tsx` | Session name, relative time, preview, message count badge, active highlight, click to select |
| Create | `app/components/Sidebar/SessionContextMenu.tsx` | Right-click MUI Menu: Rename, Delete |
| Create | `app/components/Sidebar/RecentsSection.tsx` | "Recents" header + session list + empty state |
| Create | `app/components/Layout/EmptyState.tsx` | Welcome screen when no session active |

### 4B: Layout Restructure

| Action | File | Details |
|--------|------|---------|
| Modify | `app/page.tsx` | Two states: `login` / `main`. Main = Header + flex row (LeftSidebar + content area). Content = ChatView or EmptyState. CopilotKit wraps only the content area. |
| Modify | `app/components/Chat/ChatView.tsx` | Remove back-to-sessions button and `onBackToSessions` prop |
| Modify | `app/components/Layout/Header.tsx` | Show active session name center, add sidebar toggle, remove conditional new-session button |
| Delete | `app/components/Session/SessionList.tsx` | Replaced by Sidebar/RecentsSection |
| Delete | `app/components/Session/SessionCard.tsx` | Replaced by Sidebar/SessionItem |
| Delete | `app/components/SessionSwitcher.tsx` | Legacy, unused |
| Delete | `app/components/CopilotKitWrapper.tsx` | Legacy, unused |

---

## Phase 5: Admin Panel

| Action | File | Details |
|--------|------|---------|
| Create | `app/components/Admin/AdminPanel.tsx` | Full content-area view with "Admin Panel" header, back button |
| Create | `app/components/Admin/UserList.tsx` | MUI Table: Email, Status chip, Admin flag, Last Login, Actions (Edit/Reset/Delete) |
| Create | `app/components/Admin/AddUserModal.tsx` | Dialog: email, temp password (with generate), admin checkbox, active checkbox |
| Create | `app/components/Admin/EditUserModal.tsx` | Dialog: email (readonly), admin/active toggles, metadata display |
| Create | `app/components/Admin/ResetPasswordModal.tsx` | Dialog: new password field with generate button |
| Modify | `app/page.tsx` | Add `showAdmin` boolean state, render AdminPanel in content area when true |

---

## Phase 6: Integration and Polish

- Update session metadata (message_count, last_message_preview) after CopilotKit interactions
- Pass JWT token in CopilotKit `headers` prop
- Add keyboard shortcuts (Cmd+N new session, Cmd+B toggle sidebar)
- Error boundaries, loading spinners, toast notifications
- Responsive sidebar (collapsible on tablet, drawer on mobile)
- Clean up legacy files (Login.tsx, Header.tsx in components root)

---

## Verification Plan

1. **Auth flow**: Start backend (`uv run adk_web_agent/agent.py`), start frontend (`npm run dev`). Login with `admin@example.com` / `admin123`. Verify JWT is stored and used.
2. **Session CRUD**: Create session via sidebar "+ New Chat", verify it appears in sidebar. Switch between sessions. Rename via right-click. Delete via right-click. Verify backend persistence (restart app, sessions persist).
3. **Session isolation**: Create a second user via admin panel. Login as user A, create sessions. Login as user B, verify user A's sessions are not visible. Attempt direct API call to user A's session_id -- verify 404.
4. **Admin panel**: Login as admin, access admin panel from sidebar. Create user, edit user, reset password, delete user.
5. **Chat integration**: Select a session, send a message via CopilotKit chat, verify agent responds. Verify session metadata updates (message count, preview, timestamp).
6. **Left sidebar UX**: Verify sidebar width, scroll behavior, session ordering (most recent first), relative timestamps, active session highlighting.
7. **Theme**: Verify sidebar and all new components respect light/dark/system mode.

---

## File Count Summary

- **Backend**: 12 new files, 2 modified files
- **Frontend**: 17 new files, 9 modified files, 4 deleted files
