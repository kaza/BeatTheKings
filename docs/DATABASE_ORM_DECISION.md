# PRD: Database ORM Selection for Beat the Kingz

## Executive Summary

This document evaluates ORM options for Beat the Kingz, a Next.js 16 application using PostgreSQL. The project prioritizes **TDD (Test-Driven Development)** with:

- **Local testing:** PGLite (in-memory PostgreSQL)
- **CI/CD testing:** Docker PostgreSQL container

**Decision: Migrate to Drizzle ORM**

---

## Why Drizzle is Better for This Project

| Requirement                    | Drizzle                  | Prisma                     |
| ------------------------------ | ------------------------ | -------------------------- |
| **PGLite (in-memory tests)**   | Native support           | Not supported              |
| **No code generation**         | Yes                      | Requires `prisma generate` |
| **TDD feedback speed**         | Instant                  | Slower (regenerate client) |
| **Same code for tests & prod** | Yes                      | Yes                        |
| **Docker PostgreSQL CI/CD**    | Works seamlessly         | Works seamlessly           |
| **TypeScript types**           | Inferred (no generation) | Generated                  |
| **Bundle size**                | ~7KB                     | ~2MB                       |

---

## Testing Strategy

### Local Development (PGLite)

```typescript
import { drizzle } from 'drizzle-orm/pglite'
import { PGlite } from '@electric-sql/pglite'
import * as schema from './schema'

// In-memory PostgreSQL - instant startup, no Docker needed
const client = new PGlite()
const db = drizzle(client, { schema })

// Tests run in ~5ms each
test('creates user', async () => {
  const user = await db.insert(users).values({ email: 'test@test.com' }).returning()
  expect(user[0].email).toBe('test@test.com')
})
```

### CI/CD (Docker PostgreSQL)

```typescript
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

// Same schema, different driver - works identically
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const db = drizzle(pool, { schema })
```

### GitHub Actions Example

```yaml
services:
  postgres:
    image: postgres:16
    env:
      POSTGRES_PASSWORD: test
      POSTGRES_DB: test
    ports:
      - 5432:5432

steps:
  - run: npm test
    env:
      DATABASE_URL: postgresql://postgres:test@localhost:5432/test
```

---

## Drizzle vs Prisma TDD Workflow

### Prisma TDD Cycle (Slower)

```
1. Edit schema.prisma
2. Run `prisma generate` (required!)
3. TypeScript picks up new types
4. Write/run test
5. Repeat...
```

### Drizzle TDD Cycle (Faster)

```
1. Edit schema.ts
2. TypeScript picks up new types immediately
3. Write/run test
4. Repeat...
```

**No code generation step = faster iteration**

---

## Implementation Plan

### Files to Create

- `src/db/schema.ts` - Drizzle schema (converted from Prisma)
- `src/db/index.ts` - Database client with environment switching
- `drizzle.config.ts` - Drizzle Kit configuration
- `src/db/test-utils.ts` - PGLite test helpers

### Files to Modify

- `package.json` - Add Drizzle dependencies
- API routes - Update imports from Prisma to Drizzle
- `jest.config.ts` - Configure for Drizzle tests

### Migration Steps

1. Install dependencies: `drizzle-orm`, `drizzle-kit`, `@electric-sql/pglite`, `pg`
2. Convert Prisma schema to Drizzle schema
3. Create database client with PGLite/PostgreSQL switching
4. Set up test utilities
5. Migrate API routes incrementally
6. Remove Prisma when complete

---

## Schema Conversion Example

### Prisma (Current)

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
}
```

### Drizzle (Target)

```typescript
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('User', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
})
```

---

## Sources

- [Drizzle vs Prisma Comparison](https://www.bytebase.com/blog/drizzle-vs-prisma/)
- [TDD with PGLite + Drizzle](https://nikolamilovic.com/posts/fun-sane-node-tdd-postgres-pglite-drizzle-vitest/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [PGLite Documentation](https://pglite.dev/)
