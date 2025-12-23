import { eq } from 'drizzle-orm'
import { users, cities } from '@/db/schema'
import type { Database } from '@/db'
import { calculateAge, getAgeGroup } from '@/lib/utils/date'

/**
 * Profile update input type
 */
export interface ProfileUpdateInput {
  name: string
  dateOfBirth: string // ISO date string
  gender: 'Male' | 'Female' | 'Other'
  cityId: string
}

/**
 * Find user by email
 */
export async function findUserByEmail(db: Database, email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  return user || null
}

/**
 * Find user by ID
 */
export async function findUserById(db: Database, id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  return user || null
}

/**
 * Create a new user from OAuth sign-in
 */
export async function createUserFromOAuth(
  db: Database,
  data: {
    email: string
    name?: string | null
  }
) {
  const [user] = await db
    .insert(users)
    .values({
      email: data.email,
      name: data.name || null,
      hasCreatedAvatar: false,
    })
    .returning()

  return user
}

/**
 * Get or create user from OAuth sign-in
 * Returns existing user if email exists, otherwise creates new user
 */
export async function getOrCreateUser(
  db: Database,
  data: {
    email: string
    name?: string | null
  }
) {
  // First try to find existing user
  const existingUser = await findUserByEmail(db, data.email)

  if (existingUser) {
    return { user: existingUser, isNewUser: false }
  }

  // Create new user
  const newUser = await createUserFromOAuth(db, data)
  return { user: newUser, isNewUser: true }
}

/**
 * Update user's hasCreatedAvatar status
 */
export async function updateUserAvatarStatus(
  db: Database,
  userId: string,
  hasCreatedAvatar: boolean
) {
  const [updated] = await db
    .update(users)
    .set({ hasCreatedAvatar, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning()

  return updated
}

/**
 * Validate profile update input
 */
export function validateProfileInput(
  data: unknown
): { valid: true; data: ProfileUpdateInput } | { valid: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: { _form: 'Invalid request body' } }
  }

  const input = data as Record<string, unknown>

  // Name validation
  if (!input.name || typeof input.name !== 'string') {
    errors.name = 'Name is required'
  } else if (input.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters'
  } else if (input.name.trim().length > 100) {
    errors.name = 'Name must be less than 100 characters'
  }

  // Date of birth validation
  if (!input.dateOfBirth || typeof input.dateOfBirth !== 'string') {
    errors.dateOfBirth = 'Date of birth is required'
  } else {
    const dob = new Date(input.dateOfBirth)
    if (isNaN(dob.getTime())) {
      errors.dateOfBirth = 'Invalid date format'
    } else {
      const age = calculateAge(dob)
      if (age < 5) {
        errors.dateOfBirth = 'Must be at least 5 years old'
      } else if (age > 120) {
        errors.dateOfBirth = 'Invalid date of birth'
      }
    }
  }

  // Gender validation
  const validGenders = ['Male', 'Female', 'Other']
  if (!input.gender || typeof input.gender !== 'string') {
    errors.gender = 'Gender is required'
  } else if (!validGenders.includes(input.gender)) {
    errors.gender = 'Invalid gender selection'
  }

  // City ID validation
  if (!input.cityId || typeof input.cityId !== 'string') {
    errors.cityId = 'City is required'
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors }
  }

  return {
    valid: true,
    data: {
      name: (input.name as string).trim(),
      dateOfBirth: input.dateOfBirth as string,
      gender: input.gender as 'Male' | 'Female' | 'Other',
      cityId: input.cityId as string,
    },
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(db: Database, userId: string, data: ProfileUpdateInput) {
  const dob = new Date(data.dateOfBirth)
  const ageGroup = getAgeGroup(dob)

  const [updated] = await db
    .update(users)
    .set({
      name: data.name,
      dateOfBirth: data.dateOfBirth,
      ageGroup,
      gender: data.gender,
      cityId: data.cityId,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning()

  return updated
}

/**
 * Get user profile with city info
 */
export async function getUserProfile(db: Database, userId: string) {
  const [result] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      dateOfBirth: users.dateOfBirth,
      ageGroup: users.ageGroup,
      gender: users.gender,
      cityId: users.cityId,
      hasCreatedAvatar: users.hasCreatedAvatar,
      createdAt: users.createdAt,
      city: {
        id: cities.id,
        name: cities.name,
      },
    })
    .from(users)
    .leftJoin(cities, eq(users.cityId, cities.id))
    .where(eq(users.id, userId))
    .limit(1)

  return result || null
}

/**
 * Check if a city exists
 */
export async function cityExists(db: Database, cityId: string): Promise<boolean> {
  const [city] = await db
    .select({ id: cities.id })
    .from(cities)
    .where(eq(cities.id, cityId))
    .limit(1)
  return !!city
}
