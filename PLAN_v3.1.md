# PLAN v3.1: Session Management & User Login Implementation

## Scope

This plan covers **session management** and **user login/management** features from PRD_v3.md. It transforms the app from a single-user prototype (mock auth, localStorage sessions) into a multi-user application with backend-persisted sessions, JWT authentication, and admin user management.

**Out of scope for this plan:** Agent thoughts visualization, chat UI redesign, theme enhancements (these are already partially working or covered separately).

---

## Current State Assessment

| Area | Current State | Target State |
|------|--------------|-------------|
| Auth | Mock — username-only, localStorage, fake token | Real — email+password, bcrypt, JWT, backend-validated |
| Sessions | 100% localStorage, not user-scoped | Backend-persisted SQLite, user-isolated |
| Backend endpoints | Single ADK endpoint at `/` | Auth, sessions, admin REST APIs alongside ADK |
| Session service | In-memory (`use_in_memory_services=True`), hardcoded `user_id="demo_user"` | `DatabaseSessionService` with dynamic user_id from JWT |
| Database | None | SQLite (`app_data.db` for users/sessions, ADK manages its own) |
| User management | None | Admin panel with CRUD, password reset |
| Layout | 3-state (login → sessions list → chat) | 2-state (login → main with persistent left sidebar) |

---

## Architecture Decisions

1. **Separate databases**: ADK manages its own session DB via `DatabaseSessionService`. Our custom tables (users, sessions metadata) live in `app_data.db` via `aiosqlite`.

2. **Same FastAPI app**: New REST routes (`/api/auth/*`, `/api/sessions/*`, `/api/admin/*`) are added as `APIRouter`s to the existing ADK FastAPI app.

3. **Frontend API proxy**: `app/api/backend/[...path]/route.ts` forwards to `http://localhost:8000/api/*`, avoiding CORS and keeping same-origin.

4. **JWT flow**: Login → backend returns JWT → frontend stores in localStorage → all API calls include `Authorization: Bearer <token>` → backend middleware extracts `user_id` → queries filter by `user_id`.

5. **Layout restructure**: Replace 3-view pattern with 2 states: `login` | `main`. The `main` state always shows left sidebar + content area simultaneously.

---

## Phase 1: Backend — Database & Auth Infrastructure

**Goal:** Stand up the database, password hashing, JWT, and auth middleware so subsequent routes can use them.

### Step 1.1: Add backend dependencies

| Action | File | Details |
|--------|------|---------|
| Modify | `pyproject.toml` | Add `aiosqlite>=0.20.0`, `bcrypt>=4.2.0`, `PyJWT>=2.9.0` |

### Step 1.2: Database layer

| Action | File | Details |
|--------|------|---------|
| Create | `adk_web_agent/database/__init__.py` | Package init |
| Create | `adk_web_agent/database/schema.sql` | Full schema: `users`, `sessions`, `messages`, `agent_executions` tables + indexes (from PRD §2.3/§13.1) |
| Create | `adk_web_agent/database/db.py` | Async SQLite connection manager using `aiosqlite`. Functions: `get_db()` → returns connection, `init_db()` → creates tables from schema.sql + seeds admin user (`admin@example.com` / `admin123`). WAL mode enabled for concurrency. |

**Key behaviors:**
- `init_db()` is idempotent (`CREATE TABLE IF NOT EXISTS`)
- DB file location: `./app_data.db` (relative to working directory, configurable via env var `APP_DB_PATH`)
- Admin seed only runs if `users` table is empty

### Step 1.3: Auth utilities

| Action | File | Details |
|--------|------|---------|
| Create | `adk_web_agent/auth/__init__.py` | Package init |
| Create | `adk_web_agent/auth/password.py` | `hash_password(password: str) -> str` and `verify_password(password: str, hashed: str) -> bool` using bcrypt with cost factor 12 |
| Create | `adk_web_agent/auth/jwt_helper.py` | `create_access_token(user_id: str, is_admin: bool) -> str` and `verify_token(token: str) -> dict`. HS256, 24h expiry. Secret from `JWT_SECRET` env var (default fallback for dev). |
| Create | `adk_web_agent/auth/middleware.py` | FastAPI dependencies: `get_current_user(authorization: str = Header(...))` → returns `{"user_id": str, "is_admin": bool}`. `require_admin(user=Depends(get_current_user))` → raises 403 if not admin. |

### Step 1.4: Verification checkpoint

```bash
# After Steps 1.1–1.3:
cd /Users/frankielim/git/adk-agent-quickstart
uv sync                          # Install new deps
python -c "from adk_web_agent.database.db import init_db; import asyncio; asyncio.run(init_db())"
# Verify: app_data.db exists, tables created, admin user seeded
python -c "from adk_web_agent.auth.password import hash_password, verify_password; h=hash_password('test'); assert verify_password('test', h)"
python -c "from adk_web_agent.auth.jwt_helper import create_access_token, verify_token; t=create_access_token('admin@example.com', True); p=verify_token(t); assert p['user_id']=='admin@example.com'"
```

---

## Phase 2: Backend — REST API Routes

**Goal:** Auth, session, and admin endpoints that the frontend will consume.

### Step 2.1: Auth routes

| Action | File | Details |
|--------|------|---------|
| Create | `adk_web_agent/routes/__init__.py` | Package init |
| Create | `adk_web_agent/routes/auth.py` | `APIRouter(prefix="/api/auth")` |

**Endpoints:**

| Method | Path | Auth | Request Body | Response | Logic |
|--------|------|------|-------------|----------|-------|
| POST | `/api/auth/login` | None | `{ "user_id": str, "password": str }` | `{ "token": str, "user": { user_id, is_admin, last_login } }` | Query users table, verify bcrypt hash, check `is_active`, generate JWT, update `last_login` |
| GET | `/api/auth/validate` | Bearer JWT | — | `{ "valid": true, "user_id": str, "is_admin": bool }` | Decode JWT, verify not expired |
| POST | `/api/auth/logout` | Bearer JWT | — | `{ "success": true }` | No-op (stateless JWT), placeholder for future token blocklist |

### Step 2.2: Session routes

| Action | File | Details |
|--------|------|---------|
| Create | `adk_web_agent/routes/sessions.py` | `APIRouter(prefix="/api/sessions")` |

**Endpoints:**

| Method | Path | Auth | Request Body | Response | Logic |
|--------|------|------|-------------|----------|-------|
| GET | `/api/sessions` | Bearer JWT | — | `{ "sessions": Session[] }` | Query `sessions` table filtered by `user_id`, ordered by `updated_at DESC` |
| POST | `/api/sessions` | Bearer JWT | `{ "session_name"?: str }` | `{ "session": Session }` | Generate UUID, insert into `sessions` table with `user_id`, auto-name if not provided (`"New Chat - Feb 11"`) |
| GET | `/api/sessions/{session_id}` | Bearer JWT | — | `{ "session": Session }` | Query with `WHERE session_id=? AND user_id=?` — returns 404 if not found or wrong user |
| PUT | `/api/sessions/{session_id}` | Bearer JWT | `{ "session_name"?: str }` | `{ "session": Session }` | Update name, set `updated_at=NOW()`, verify ownership |
| DELETE | `/api/sessions/{session_id}` | Bearer JWT | — | `{ "success": true }` | Verify ownership, delete (cascade to messages/executions) |

**Critical security:** Every query includes `AND user_id = ?`. Non-existent or wrong-user sessions return 404 (not 403, to avoid enumeration).

### Step 2.3: Admin routes

| Action | File | Details |
|--------|------|---------|
| Create | `adk_web_agent/routes/admin.py` | `APIRouter(prefix="/api/admin")` |

**Endpoints (all require `require_admin` dependency):**

| Method | Path | Request Body | Response | Logic |
|--------|------|-------------|----------|-------|
| GET | `/api/admin/users` | — | `{ "users": User[] }` | List all users (exclude `password_hash` from response) |
| POST | `/api/admin/users` | `{ "user_id": str, "password": str, "is_admin"?: bool, "is_active"?: bool }` | `{ "user": User }` | Hash password, insert into users table. Return 409 if email exists. |
| PUT | `/api/admin/users/{user_id}` | `{ "is_admin"?: bool, "is_active"?: bool }` | `{ "user": User }` | Update flags. Cannot remove own admin. |
| POST | `/api/admin/users/{user_id}/reset-password` | `{ "new_password": str }` | `{ "success": true }` | Hash new password, update in DB |
| DELETE | `/api/admin/users/{user_id}` | — | `{ "success": true }` | Cannot delete self. Cascade deletes sessions. Check at least one admin remains. |

### Step 2.4: Wire routes into agent.py

| Action | File | Details |
|--------|------|---------|
| Modify | `adk_web_agent/agent.py` | 1. Import and include all three routers. 2. Add FastAPI `lifespan` to run `init_db()` on startup. 3. Keep ADK endpoint at `/` as-is. 4. Extract `user_id` from `x-username` header (sent by CopilotKit proxy) for dynamic session creation instead of hardcoded `"demo_user"`. |

### Step 2.5: Verification checkpoint

```bash
cd /Users/frankielim/git/adk-agent-quickstart
uv run python -m adk_web_agent.agent &  # Start server

# Test auth
curl -s -X POST http://localhost:8000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"user_id":"admin@example.com","password":"admin123"}'
# Expect: {"token":"eyJ...","user":{...}}

# Test sessions (use token from above)
TOKEN="<paste token>"
curl -s http://localhost:8000/api/sessions -H "Authorization: Bearer $TOKEN"
# Expect: {"sessions":[]}

curl -s -X POST http://localhost:8000/api/sessions \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"session_name":"Test Chat"}'
# Expect: {"session":{"session_id":"...","session_name":"Test Chat",...}}

# Test admin
curl -s http://localhost:8000/api/admin/users -H "Authorization: Bearer $TOKEN"
# Expect: {"users":[{"user_id":"admin@example.com",...}]}
```

---

## Phase 3: Frontend — API Layer & Auth Overhaul

**Goal:** Replace mock auth with real JWT-based auth, create API service layer to talk to backend.

### Step 3.1: API proxy route

| Action | File | Details |
|--------|------|---------|
| Create | `app/api/backend/[...path]/route.ts` | Next.js catch-all route handler. Proxies GET/POST/PUT/DELETE to `http://localhost:8000/api/*`. Forwards `Authorization` and `Content-Type` headers. Returns backend response as-is. |

### Step 3.2: API service layer

| Action | File | Details |
|--------|------|---------|
| Create | `app/services/api.ts` | Base fetch wrapper: `apiCall(method, path, body?)`. Auto-injects `Authorization: Bearer <token>` from localStorage. On 401 response → clears token + redirects to login. |
| Create | `app/services/authService.ts` | `login(userId, password) → {token, user}`, `validate() → {valid, user_id, is_admin}`, `logout()`. Calls `/api/backend/auth/*`. |
| Create | `app/services/sessionService.ts` | `listSessions()`, `createSession(name?)`, `getSession(id)`, `updateSession(id, data)`, `deleteSession(id)`. Calls `/api/backend/sessions/*`. |
| Create | `app/services/adminService.ts` | `listUsers()`, `createUser(data)`, `updateUser(userId, data)`, `resetPassword(userId, newPassword)`, `deleteUser(userId)`. Calls `/api/backend/admin/*`. |

### Step 3.3: Update auth types

| Action | File | Details |
|--------|------|---------|
| Modify | `app/types/auth.ts` | Expand `User` to `{ id: string, email: string, isAdmin: boolean, lastLogin?: string, token: string }`. Add `LoginRequest`, `LoginResponse`, `ValidateResponse` types. |

### Step 3.4: Replace mock AuthContext

| Action | File | Details |
|--------|------|---------|
| Modify | `app/contexts/AuthContext.tsx` | Complete rewrite. `login(email, password)` → calls `authService.login()`, stores JWT + user in state + localStorage. On mount → `authService.validate()` to verify stored token. Add `isLoading`, `error` states. `logout()` → calls `authService.logout()`, clears localStorage. Expose `isAdmin` from context. |

### Step 3.5: Update LoginScreen

| Action | File | Details |
|--------|------|---------|
| Modify | `app/components/Auth/LoginScreen.tsx` | Add password field, update `onLogin(email, password)` signature. Add error display (MUI Alert). Add loading spinner during login. Change username label to "Email". Add "Contact admin for access" footer text. |

### Step 3.6: Update CopilotKit route to forward JWT

| Action | File | Details |
|--------|------|---------|
| Modify | `app/api/copilotkit/route.ts` | Extract JWT from request `Authorization` header. Decode it (or pass through) to get `user_id`. Pass `user_id` as `x-username` header to the ADK backend. This enables user-scoped session creation in the ADK. |

### Step 3.7: Verification checkpoint

```
1. Start backend, start frontend (npm run dev)
2. Navigate to localhost:3000 → see login screen with email + password
3. Login with admin@example.com / admin123 → authenticated, token stored
4. Refresh page → auto-validates token, stays logged in
5. Click logout → returns to login screen
6. Login with wrong password → see error message
```

---

## Phase 4: Frontend — Session Context Refactor

**Goal:** Replace localStorage-based session management with backend API calls.

### Step 4.1: Update session types

| Action | File | Details |
|--------|------|---------|
| Modify | `app/types/session.ts` | Add `userId: string` to `Session` interface. Keep `ChatMessage` as-is (CopilotKit manages messages internally anyway). |

### Step 4.2: Rewrite SessionContext

| Action | File | Details |
|--------|------|---------|
| Modify | `app/contexts/SessionContext.tsx` | Complete rewrite. Remove ALL localStorage logic. All operations become async API calls via `sessionService`. Key changes: |

**New context interface:**

```typescript
interface SessionContextType {
  sessions: Session[];
  activeSession: Session | null;
  isLoading: boolean;
  error: string | null;
  loadSessions: () => Promise<void>;
  createSession: (name?: string) => Promise<Session>;
  selectSession: (sessionId: string) => Promise<void>;
  renameSession: (sessionId: string, newName: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  clearActiveSession: () => void;
}
```

**Behaviors:**
- `loadSessions()` called on mount and whenever auth state changes (user logs in)
- `createSession()` → POST to backend → adds to local state → sets as active
- `selectSession()` → GET from backend → sets as active
- `deleteSession()` → DELETE on backend → removes from local state → if active, clear
- `renameSession()` → PUT on backend → updates local state
- Sessions are kept in React state (not localStorage) as a cache of the backend

### Step 4.3: Verification checkpoint

```
1. Login → sessions load from backend (empty initially)
2. Create a session (via existing UI or console) → appears in list
3. Select it → becomes active
4. Delete it → disappears
5. Refresh page → sessions reload from backend (persist!)
6. Login as different user → see different (empty) session list
```

---

## Phase 5: Frontend — Left Sidebar & Layout Restructure

**Goal:** Replace the 3-state view pattern with a persistent left sidebar + content area. This is the most impactful UI change.

### Step 5.1: Sidebar components

| Action | File | Details |
|--------|------|---------|
| Create | `app/components/Sidebar/LeftSidebar.tsx` | 280px fixed-width sidebar. Contains: NewChatButton, RecentsSection, bottom settings/admin links. Scrollable session list. Collapsible (tracked via state + localStorage). |
| Create | `app/components/Sidebar/NewChatButton.tsx` | Full-width "+ New Chat" button. Apple-styled rounded corners, hover elevation. Calls `sessionContext.createSession()`. |
| Create | `app/components/Sidebar/SessionItem.tsx` | Individual session row: name (truncated), relative time (reuse `formatRelativeTime`), message count badge, active highlight, click → `selectSession()`. |
| Create | `app/components/Sidebar/SessionContextMenu.tsx` | MUI `Menu` triggered by right-click on SessionItem. Options: Rename (opens inline edit), Delete (with confirmation). |
| Create | `app/components/Sidebar/RecentsSection.tsx` | "Recents" header label + mapped SessionItem list + empty state ("No conversations yet"). |
| Create | `app/components/Layout/EmptyState.tsx` | Welcome screen shown in content area when no session is active. "Start a new chat" prompt with button. |

### Step 5.2: Layout restructure in page.tsx

| Action | File | Details |
|--------|------|---------|
| Modify | `app/page.tsx` | Two states only: `login` and `main`. `main` state renders: Header (full width) + flex row (LeftSidebar + content area). Content area = `ChatView` if `activeSession`, else `EmptyState`. `CopilotKit` wraps only when `activeSession` exists (with `key={activeSession.id}` for remount). Remove: `sessions` view state entirely. |

### Step 5.3: Update Header

| Action | File | Details |
|--------|------|---------|
| Modify | `app/components/Layout/Header.tsx` | Show active session name in center. Add sidebar toggle button (hamburger icon). Remove the standalone "New Session" button (now in sidebar). Remove conditional `showSessionControls` prop — header is always visible in main state. Add user menu dropdown (avatar → Settings, Admin Panel if admin, Logout). |

### Step 5.4: Update ChatView

| Action | File | Details |
|--------|------|---------|
| Modify | `app/components/Chat/ChatView.tsx` | Remove back-to-sessions button and `onBackToSessions` prop (no longer needed — sidebar is always visible). Keep the CopilotChat + ThoughtsPanel split layout. |

### Step 5.5: Clean up legacy components

| Action | File | Details |
|--------|------|---------|
| Delete | `app/components/Session/SessionList.tsx` | Replaced by `Sidebar/RecentsSection` |
| Delete | `app/components/Session/SessionCard.tsx` | Replaced by `Sidebar/SessionItem` |
| Delete | `app/components/SessionSwitcher.tsx` | Legacy, unused |
| Delete | `app/components/CopilotKitWrapper.tsx` | Legacy, unused |
| Delete | `app/components/Login.tsx` | Legacy (root-level), replaced by `Auth/LoginScreen.tsx` |

### Step 5.6: Verification checkpoint

```
1. Login → see left sidebar (280px) + empty state content area
2. Sidebar shows "+ New Chat" button + "Recents" heading + empty message
3. Click "+ New Chat" → session created, appears in sidebar, chat view loads
4. Send a message → agent responds (CopilotKit works as before)
5. Click "+ New Chat" again → second session, sidebar now has 2 items
6. Click first session → switches, CopilotKit remounts
7. Right-click session → context menu with Rename / Delete
8. Rename → inline edit, saves to backend
9. Delete → removed from sidebar, empty state if it was active
10. Sidebar scrolls independently when there are many sessions
11. Header shows current session name, sidebar toggle works
```

---

## Phase 6: Frontend — Admin Panel

**Goal:** Admin users can manage other users from within the app.

### Step 6.1: Admin components

| Action | File | Details |
|--------|------|---------|
| Create | `app/components/Admin/AdminPanel.tsx` | Full content-area view. "User Management" header + back button. Contains UserList + action modals. Uses `adminService` for API calls. |
| Create | `app/components/Admin/UserList.tsx` | MUI `Table` with columns: Email, Status (Active/Inactive chip), Admin (badge), Last Login (relative time), Actions (Edit, Reset Password, Delete icon buttons). "+ Add User" button above table. |
| Create | `app/components/Admin/AddUserModal.tsx` | MUI `Dialog`: email field, password field (with "Generate" button for random password), admin checkbox, active checkbox (default true). Validation: email format, password min 6 chars. |
| Create | `app/components/Admin/EditUserModal.tsx` | MUI `Dialog`: email (read-only), admin toggle, active toggle, metadata display (created at, last login, session count). |
| Create | `app/components/Admin/ResetPasswordModal.tsx` | MUI `Dialog`: user email (read-only), new password field with "Generate" button. |

### Step 6.2: Wire admin into layout

| Action | File | Details |
|--------|------|---------|
| Modify | `app/page.tsx` | Add `showAdmin` boolean state. When true, render `AdminPanel` in content area instead of ChatView/EmptyState. |
| Modify | `app/components/Sidebar/LeftSidebar.tsx` | Show "Admin Panel" link at bottom of sidebar, only if `user.isAdmin`. Clicking sets `showAdmin=true`. |

### Step 6.3: Verification checkpoint

```
1. Login as admin@example.com → see "Admin Panel" link in sidebar bottom
2. Click → content area shows user management table with admin user listed
3. Click "+ Add User" → fill form → user created in backend
4. See new user in table with Active status
5. Click Edit → toggle admin flag → save → updated
6. Click Reset Password → enter new password → save
7. Login as new user in incognito → works with new password
8. Login as non-admin user → no "Admin Panel" link in sidebar
```

---

## Phase 7: Integration & Polish

**Goal:** Wire everything together, handle edge cases, ensure robust UX.

### Step 7.1: CopilotKit ↔ session integration

| Task | Details |
|------|---------|
| Pass JWT token in CopilotKit `headers` prop | Ensure all CopilotKit requests include `Authorization` header so the proxy can forward auth to the backend |
| Update session metadata after messages | After CopilotKit interaction completes, update `message_count`, `last_message_preview`, `updated_at` in the sidebar by re-fetching or optimistically updating |
| Dynamic `user_id` in ADK | Backend reads `x-username` from the CopilotKit proxy request and uses it as `user_id` for ADK session creation |

### Step 7.2: Error handling & UX

| Task | Details |
|------|---------|
| 401 handling | If any API call returns 401 → auto-logout, redirect to login with "Session expired" message |
| Loading states | Show skeleton/spinner in sidebar while sessions load, in content area during session switch |
| Toast notifications | MUI Snackbar for: session created, session deleted, user created, password reset, errors |
| Error boundaries | Wrap main content in React error boundary to prevent white screen |

### Step 7.3: Responsive sidebar

| Task | Details |
|------|---------|
| Desktop | 280px fixed sidebar, always visible |
| Tablet (<1024px) | Sidebar collapses to icon-only (48px) or hidden, toggle to expand as overlay |
| Mobile (<768px) | Sidebar becomes MUI Drawer (slides from left), hamburger icon in header |
| Persist sidebar state | Remember collapsed/expanded in localStorage |

### Step 7.4: Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+N` | New session |
| `Cmd+B` | Toggle sidebar |

### Step 7.5: Cleanup

| Task | Details |
|------|---------|
| Remove dead code | Remove unused imports, dead `Header.tsx` in `components/` root (vs `Layout/Header.tsx`) |
| Remove localStorage session keys | Remove any remaining references to `'agent-studio-sessions'` and `'agent-studio-messages-*'` |
| Update `README.md` | Document new setup steps: backend DB initialization, default admin credentials, environment variables |

---

## File Change Summary

### Backend (`adk-agent-quickstart`)

| Type | Count | Files |
|------|-------|-------|
| New | 10 | `database/__init__.py`, `database/schema.sql`, `database/db.py`, `auth/__init__.py`, `auth/password.py`, `auth/jwt_helper.py`, `auth/middleware.py`, `routes/__init__.py`, `routes/auth.py`, `routes/sessions.py`, `routes/admin.py` |
| Modified | 2 | `pyproject.toml`, `agent.py` |
| **Total** | **12** | |

### Frontend (`copilotkit-app-quickstart`)

| Type | Count | Files |
|------|-------|-------|
| New | 14 | `api/backend/[...path]/route.ts`, `services/api.ts`, `services/authService.ts`, `services/sessionService.ts`, `services/adminService.ts`, `components/Sidebar/LeftSidebar.tsx`, `components/Sidebar/NewChatButton.tsx`, `components/Sidebar/SessionItem.tsx`, `components/Sidebar/SessionContextMenu.tsx`, `components/Sidebar/RecentsSection.tsx`, `components/Layout/EmptyState.tsx`, `components/Admin/AdminPanel.tsx`, `components/Admin/UserList.tsx`, `components/Admin/AddUserModal.tsx`, `components/Admin/EditUserModal.tsx`, `components/Admin/ResetPasswordModal.tsx` |
| Modified | 7 | `types/auth.ts`, `types/session.ts`, `contexts/AuthContext.tsx`, `contexts/SessionContext.tsx`, `components/Auth/LoginScreen.tsx`, `components/Chat/ChatView.tsx`, `components/Layout/Header.tsx`, `page.tsx`, `api/copilotkit/route.ts` |
| Deleted | 5 | `components/Session/SessionList.tsx`, `components/Session/SessionCard.tsx`, `components/SessionSwitcher.tsx`, `components/CopilotKitWrapper.tsx`, `components/Login.tsx` |
| **Total** | **26** | |

---

## Implementation Order & Dependencies

```
Phase 1 (Backend infra)          ← No dependencies, start here
  └─► Phase 2 (Backend routes)  ← Depends on Phase 1
        └─► Phase 3 (Frontend API + auth)  ← Depends on Phase 2
              ├─► Phase 4 (Session context refactor)  ← Depends on Phase 3
              │     └─► Phase 5 (Left sidebar + layout)  ← Depends on Phase 4
              │           └─► Phase 7 (Integration + polish)  ← Depends on Phase 5
              └─► Phase 6 (Admin panel)  ← Depends on Phase 3, parallel to 4/5
```

**Phase 6 can run in parallel** with Phases 4–5 since it only depends on the API layer (Phase 3).

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| CopilotKit doesn't forward custom headers | The `app/api/copilotkit/route.ts` proxy reads headers from the incoming Next.js request, so we control header forwarding. Verified this is already partially implemented. |
| SQLite concurrent access (FastAPI is async) | Use `aiosqlite` with WAL mode. Each request gets its own connection. No long-held transactions. |
| ADK session ID vs our session ID mismatch | Our `sessions` table tracks metadata only. The ADK manages its own session state. We use the same `session_id` value in both, generated by our backend. |
| Breaking existing chat functionality | CopilotKit chat widget is self-contained. We only change the wrapping layout and how session IDs are passed — the chat internals remain untouched. |
| Session data loss during migration | Current sessions are in localStorage and in-memory on the ADK side. Users will start fresh after migration. Communicate this clearly. |

---

## Estimated Effort

| Phase | Estimated Time | Complexity |
|-------|---------------|------------|
| Phase 1: Backend infra | 2–3 hours | Low |
| Phase 2: Backend routes | 3–4 hours | Medium |
| Phase 3: Frontend API + auth | 3–4 hours | Medium |
| Phase 4: Session context refactor | 2–3 hours | Medium |
| Phase 5: Left sidebar + layout | 4–6 hours | High (most UI change) |
| Phase 6: Admin panel | 3–4 hours | Medium |
| Phase 7: Integration + polish | 2–3 hours | Low–Medium |
| **Total** | **~19–27 hours** | |

---

## Environment Variables

### Backend (new)

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | `dev-secret-change-in-production` | Secret key for JWT signing |
| `APP_DB_PATH` | `./app_data.db` | Path to application SQLite database |
| `ADMIN_EMAIL` | `admin@example.com` | Default admin email (seed) |
| `ADMIN_PASSWORD` | `admin123` | Default admin password (seed) |

### Frontend (existing, no changes needed)

The frontend already reads `NEXT_PUBLIC_BACKEND_URL` or defaults to `http://localhost:8000`.
