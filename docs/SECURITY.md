# Security Model

## Overview

Simple but secure approach using Next.js + NextAuth + Prisma stack.

## Authentication

- **OAuth only** (Google, Azure AD) - no password storage
- **JWT session strategy** - stateless, secure tokens
- **NextAuth handles**: CSRF protection, secure cookies, session management

## Route Protection

Implemented via `middleware.ts` at project root.

**Public (no auth):**

- `/`, `/login` - landing and auth pages
- `/api/auth/*` - NextAuth handlers
- `GET /api/rankings/*` - view rankings
- `GET /api/venues/*` - view venues/courts

**Private (auth required):**

- All other routes
- All POST/PUT/PATCH/DELETE operations
- Video uploads

## Security Layers

| Layer          | What                                             | Why                           |
| -------------- | ------------------------------------------------ | ----------------------------- |
| Authentication | NextAuth middleware check                        | Is this a valid user?         |
| Authorization  | `session.user.id === resource.ownerId` in routes | Can this user do THIS action? |
| Validation     | Zod schemas on inputs                            | Is the data safe/valid?       |

## Built-in Protections

What the stack gives us for free:

- **XSS** - React's JSX escaping
- **SQL Injection** - Prisma's parameterized queries
- **CSRF** - NextAuth handles for auth endpoints
- **Session hijacking** - HttpOnly, Secure JWT cookies

## Implementation Checklist

- [ ] `middleware.ts` protecting routes
- [ ] `getServerSession()` in API routes to get user ID
- [ ] Zod validation on all POST/PUT/PATCH
- [ ] Authorization checks: user owns the resource
- [ ] `NEXTAUTH_SECRET` is strong and in env
- [ ] Security headers in `next.config.js`
