import { drizzle as drizzlePg, NodePgDatabase } from 'drizzle-orm/node-postgres'
import { PgliteDatabase } from 'drizzle-orm/pglite'
import { Pool } from 'pg'
import * as schema from './schema'

// Type for the database instance - supports both NodePg and PGLite
export type Database = NodePgDatabase<typeof schema> | PgliteDatabase<typeof schema>

// Singleton instance
let db: Database | null = null

/**
 * Get database connection for production/development
 * Uses PostgreSQL via node-postgres
 */
export function getDb(): Database {
  if (db) return db

  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  const pool = new Pool({
    connectionString,
    max: 10, // Maximum connections in pool
  })

  db = drizzlePg(pool, { schema })

  return db
}

/**
 * Close database connection (for cleanup)
 */
export async function closeDb(): Promise<void> {
  // Pool cleanup is handled automatically by node-postgres
  db = null
}

// Re-export schema for convenience
export * from './schema'

// Export the db getter as default
export { getDb as db }
