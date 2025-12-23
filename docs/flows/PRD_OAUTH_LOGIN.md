# PRD: OAuth Login Flow

## Overview

The OAuth Login flow is the entry point for all users. Users authenticate via Google or Microsoft (Azure AD) OAuth providers. Upon successful authentication, users are either directed to create their avatar (new users) or to the main app (returning users).

---

## Current State Analysis

### What Exists

| Component          | Location                                    | Status         |
| ------------------ | ------------------------------------------- | -------------- |
| NextAuth Route     | `src/app/api/auth/[...nextauth]/route.ts`   | ✅ Implemented |
| Login Page         | `src/app/(auth)/login/page.tsx`             | ✅ Implemented |
| useAuth Hook       | `src/lib/hooks/useAuth.ts`                  | ✅ Implemented |
| SessionProvider    | `src/components/layout/SessionProvider.tsx` | ✅ Implemented |
| Environment Config | `.env.example`                              | ✅ Configured  |

### What's Missing

| Component            | Issue                                         |
| -------------------- | --------------------------------------------- |
| Database Integration | User not saved to DB on sign-in               |
| Drizzle Adapter      | NextAuth not connected to Drizzle             |
| Route Protection     | No middleware to protect authenticated routes |
| Unit Tests           | No tests for auth utilities                   |
| Integration Tests    | No tests for OAuth flow                       |

---

## Requirements

### Functional Requirements

1. **FR-1: OAuth Providers**
   - Support Google OAuth sign-in
   - Support Microsoft (Azure AD) OAuth sign-in
   - Handle OAuth errors gracefully

2. **FR-2: User Creation**
   - Create user record in database on first sign-in
   - Use email as unique identifier
   - Store OAuth provider info

3. **FR-3: Session Management**
   - Use JWT-based sessions
   - Include user ID and email in session
   - Include `hasCreatedAvatar` status in session

4. **FR-4: Route Protection**
   - Protect all routes except: `/`, `/login`, `/api/auth/*`
   - Redirect unauthenticated users to login
   - Redirect authenticated users from login to appropriate page

5. **FR-5: Post-Login Redirect**
   - New users (no avatar) → `/avatar` (Create Avatar page)
   - Returning users (has avatar) → `/welcome` (Main app)

### Non-Functional Requirements

1. **NFR-1: Security**
   - OAuth only (no password storage)
   - CSRF protection via NextAuth
   - Secure HTTP-only cookies

2. **NFR-2: Performance**
   - Session check < 100ms
   - OAuth redirect < 2s

---

## Technical Design

### Database Schema

Uses existing `User` table from Drizzle schema:

```typescript
// src/db/schema.ts - Already exists
export const users = pgTable('User', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  hasCreatedAvatar: boolean('hasCreatedAvatar').default(false).notNull(),
  // ... other fields
})
```

### API Endpoints

| Endpoint                      | Method | Description             |
| ----------------------------- | ------ | ----------------------- |
| `/api/auth/signin`            | GET    | NextAuth sign-in page   |
| `/api/auth/callback/google`   | GET    | Google OAuth callback   |
| `/api/auth/callback/azure-ad` | GET    | Azure AD OAuth callback |
| `/api/auth/session`           | GET    | Get current session     |
| `/api/auth/signout`           | POST   | Sign out                |

### Components to Create/Update

1. **`src/lib/auth/drizzle-adapter.ts`** (NEW)
   - Custom Drizzle adapter for NextAuth
   - Handles user creation/lookup

2. **`src/app/api/auth/[...nextauth]/route.ts`** (UPDATE)
   - Add Drizzle adapter
   - Update callbacks for database integration

3. **`src/middleware.ts`** (NEW)
   - Route protection middleware
   - Redirect logic

4. **`src/lib/auth/index.ts`** (NEW)
   - Auth utilities and helpers
   - Type definitions

---

## User Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  /login     │────▶│ OAuth        │────▶│ Callback        │
│  (Login UI) │     │ Provider     │     │ /api/auth/cb/*  │
└─────────────┘     └──────────────┘     └────────┬────────┘
                                                  │
                                                  ▼
                                         ┌────────────────┐
                                         │ Check/Create   │
                                         │ User in DB     │
                                         └────────┬───────┘
                                                  │
                    ┌─────────────────────────────┴──────────────────────────┐
                    │                                                        │
                    ▼                                                        ▼
           ┌────────────────┐                                      ┌─────────────────┐
           │ hasCreatedAvatar│                                      │ hasCreatedAvatar │
           │ = false        │                                      │ = true          │
           └───────┬────────┘                                      └────────┬────────┘
                   │                                                        │
                   ▼                                                        ▼
           ┌────────────────┐                                      ┌─────────────────┐
           │ /avatar        │                                      │ /welcome        │
           │ (Create Avatar)│                                      │ (Main App)      │
           └────────────────┘                                      └─────────────────┘
```

---

## Implementation Plan

### Step 2: Routes/API Implementation

1. Create Drizzle adapter for NextAuth
2. Update NextAuth route with database integration
3. Create middleware for route protection
4. Create auth utility functions

### Step 3: Unit Tests

1. Test auth utility functions
2. Test session handling
3. Test user creation logic
4. Mock OAuth providers

### Step 4: Integration Tests

1. Test complete OAuth flow with PGLite
2. Test user creation in database
3. Test session persistence
4. Test redirect logic

### Step 5: UI Updates

1. Update login page error handling
2. Add loading states
3. Add sign-out functionality
4. Test OAuth buttons

---

## Files to Create/Modify

### New Files

- `src/lib/auth/drizzle-adapter.ts` - Drizzle adapter for NextAuth
- `src/lib/auth/index.ts` - Auth utilities
- `src/middleware.ts` - Route protection
- `src/__tests__/auth/auth.test.ts` - Unit tests
- `src/__tests__/auth/oauth-flow.test.ts` - Integration tests

### Modified Files

- `src/app/api/auth/[...nextauth]/route.ts` - Add Drizzle adapter
- `src/lib/hooks/useAuth.ts` - Add more session data
- `src/app/(auth)/login/page.tsx` - Improve error handling

---

## Acceptance Criteria

- [ ] User can sign in with Google
- [ ] User can sign in with Microsoft
- [ ] New user is created in database on first sign-in
- [ ] Returning user is recognized from database
- [ ] Session includes user ID and hasCreatedAvatar status
- [ ] Unauthenticated users redirected to /login
- [ ] New users redirected to /avatar after login
- [ ] Returning users redirected to /welcome after login
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] OAuth errors display user-friendly messages

---

## Environment Variables Required

```bash
# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Azure AD OAuth
AZURE_AD_CLIENT_ID="your-azure-client-id"
AZURE_AD_CLIENT_SECRET="your-azure-client-secret"
AZURE_AD_TENANT_ID="your-azure-tenant-id"

# Database
DATABASE_URL="postgresql://..."
```
