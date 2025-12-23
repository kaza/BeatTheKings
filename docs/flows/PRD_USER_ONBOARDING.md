# PRD: User Onboarding Flow

## Overview

After OAuth login, new users must complete their profile before accessing the app. This flow collects essential user information and stores it in the database.

## Current State

- `/register` page exists with client-side form
- Uses AppContext and localStorage (temporary/mock)
- Does NOT persist to database
- Does NOT integrate with authenticated user

## Target State

- Integrate with authenticated user from OAuth session
- Persist profile data to PostgreSQL via Drizzle
- Redirect new users automatically after OAuth
- Calculate and store age group from date of birth

---

## User Flow

```
OAuth Login → Callback → Check Profile → /register → Submit → /avatar
                                ↓
                         (hasCreatedAvatar=false,
                          name=null → needs onboarding)
```

### Flow Logic

1. After OAuth callback, check if user has `name` field populated
2. If `name` is null → redirect to `/register`
3. User completes form → API saves to database
4. Redirect to `/avatar` for avatar creation

---

## Data Model

Uses existing `users` table fields:

```typescript
{
  name: string // User's display name
  dateOfBirth: Date // For age group calculation
  ageGroup: string // "Under-18", "18-30", "31+"
  gender: string // "Male", "Female", "Other"
  cityId: uuid // Reference to City table
}
```

---

## API Endpoints

### PUT /api/users/profile

Updates authenticated user's profile.

**Request:**

```json
{
  "name": "John Doe",
  "dateOfBirth": "1995-06-15",
  "gender": "Male",
  "cityId": "uuid-of-city"
}
```

**Response (200):**

```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "dateOfBirth": "1995-06-15",
    "ageGroup": "18-30",
    "gender": "Male",
    "cityId": "city-uuid"
  }
}
```

**Response (400):**

```json
{
  "error": "Validation failed",
  "details": {
    "name": "Name is required",
    "dateOfBirth": "Must be at least 5 years old"
  }
}
```

**Response (401):**

```json
{
  "error": "Unauthorized"
}
```

### GET /api/users/profile

Returns authenticated user's profile.

**Response (200):**

```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "dateOfBirth": "1995-06-15",
  "ageGroup": "18-30",
  "gender": "Male",
  "cityId": "city-uuid",
  "city": {
    "id": "city-uuid",
    "name": "Vienna"
  },
  "hasCreatedAvatar": false
}
```

---

## Validation Rules

| Field       | Rules                                             |
| ----------- | ------------------------------------------------- |
| name        | Required, 2-100 characters, no special characters |
| dateOfBirth | Required, must be valid date, age 5-120 years     |
| gender      | Required, enum: "Male", "Female", "Other"         |
| cityId      | Required, must exist in database                  |

---

## UI Components

### /register Page Updates

1. **Authentication Check**: Redirect to /login if not authenticated
2. **Already Onboarded Check**: Redirect to /welcome if name exists
3. **Form Fields**:
   - Name (text input)
   - Date of Birth (date picker)
   - Gender (select dropdown)
   - Country → City (cascading dropdowns)
4. **Submit**: Calls PUT /api/users/profile
5. **Success**: Redirect to /avatar

### Form States

- **Loading**: Show skeleton while checking auth
- **Submitting**: Disable form, show spinner
- **Error**: Display validation errors below fields
- **Success**: Redirect to /avatar

---

## Middleware Updates

Current middleware redirects users without avatar to /avatar. Update to also handle onboarding:

```typescript
// Route protection logic
if (!session.user.name) {
  // User needs onboarding
  if (!isRegisterPage) redirect('/register')
} else if (!session.user.hasCreatedAvatar) {
  // User needs avatar
  if (!isAvatarPage) redirect('/avatar')
}
```

---

## Test Cases

### Unit Tests

1. **Profile Update Function**
   - Should update user profile with valid data
   - Should calculate correct age group
   - Should reject invalid name
   - Should reject invalid date of birth
   - Should reject invalid gender
   - Should reject non-existent city

2. **Age Group Calculation**
   - Under 18 → "Under-18"
   - 18-30 → "18-30"
   - 31+ → "31+"

3. **Validation Functions**
   - Name validation
   - Date of birth validation
   - Gender validation

### Integration Tests

1. **PUT /api/users/profile**
   - Returns 401 when not authenticated
   - Returns 400 for invalid data
   - Returns 200 and updates user on valid data
   - Calculates age group correctly

2. **GET /api/users/profile**
   - Returns 401 when not authenticated
   - Returns user profile when authenticated

---

## Implementation Steps

1. Create database functions for user profile operations
2. Create PUT /api/users/profile endpoint
3. Create GET /api/users/profile endpoint
4. Write unit tests for profile functions
5. Write integration tests for API endpoints
6. Update /register page to use API
7. Update middleware for onboarding redirect

---

## Success Criteria

- [ ] New users are redirected to /register after OAuth
- [ ] Profile form validates all fields
- [ ] Profile data persists to database
- [ ] Age group calculated correctly
- [ ] After completion, user redirected to /avatar
- [ ] All tests pass
