# Schema Changelog

Track all database schema changes and migrations.

---

## [Unreleased] - Schema V2

### Summary

Major schema redesign introducing proper location hierarchy, Sport as first-class entity, 1v1 Match system, and dual currency (XP/RP).

### Added

#### Location System

- `Country` - Country with ISO 3166-1 code
- `State` - State/province/region within country
- `City` - City within state
- `District` - Optional neighborhood/district within city

#### Game System

- `Sport` - First-class sport entity (was: string field)
- `Match` - 1v1 player matches with score tracking and mutual agreement
- `ChallengeAttempt` - Replaces ChallengeSubmission with simplified structure

#### Avatar System

- `AvatarItem` - Catalog of all available items with unlock requirements
- `UserUnlockedItem` - Tracks items unlocked per user
- `AvatarEquipment` - Sport-specific equipment loadouts

#### Currency

- `totalRp` - Lifetime reward points earned
- `availableRp` - Spendable reward points balance
- `rpReward` on Challenge - RP earned for completion
- `rpCost` on AvatarItem - Cost to purchase item

### Changed

#### User

- Removed: `emailVerified`, `verificationCode`, `verificationCodeExpiry` (OAuth replaces email verification)
- Removed: `location` string field
- Removed: `profilePictureUrl` (avatar system replaces this)
- Removed: `hasCompletedOnboarding`
- Added: `cityId` FK to City
- Added: `dateOfBirth` (replaces `age` field)
- Added: `hasCreatedAvatar` boolean
- Changed: `email` now comes from OAuth provider

#### Venue

- Removed: `venueType`, `sportType` string fields
- Removed: `city`, `country` string fields
- Removed: `activePlayerCount` (calculated from ActivePlayer)
- Removed: `currentKingId` (king system redesigned)
- Added: `cityId` FK to City
- Added: `districtId` FK to District (optional)
- Added: `imageUrl` for venue photos
- Added: `isActive` for soft disable

#### Challenge

- Added: `sportId` FK to Sport
- Added: `rpReward` for dual currency
- Removed: `parameters` JSON field (simplified)

#### PlayerStats

- Changed: `sportType` string → `sportId` FK
- Removed: `venueStatsJson` (separate venue ranking system planned)
- Added: `totalRp`, `availableRp` for RP tracking
- Added: `matchesPlayed`, `matchesWon`, `matchesLost`
- Added: Basketball-specific: `threePointMade`, `threePointAttempted`, `freeThrowMade`, `freeThrowAttempted`
- Added: `usersInvited` for referral tracking

#### ActivePlayer

- Added: `latitude`, `longitude` for precise location

### Removed

- `UserChallengeStatus` - Simplified to ChallengeAttempt only
- `ChallengeSubmission` - Replaced by `ChallengeAttempt`

### Migration Notes

This is a breaking change requiring data migration:

1. **Location data**: Existing `city`/`country` strings need mapping to new Location tables
2. **Sport data**: Create Sport records, update FKs from string values
3. **User profiles**: Migrate `age` to `dateOfBirth`, calculate `ageGroup`
4. **Challenge submissions**: Migrate to ChallengeAttempt structure
5. **Stats**: Recalculate with new fields initialized to 0

---

## [1.0.0] - 2025-11-XX - Initial MVP Schema

### Added

Core tables for MVP Phase 1:

- `User` - Authentication and profile with email verification
- `Venue` - Sport venues with geolocation
- `Challenge` - Activities at venues
- `ChallengeSubmission` - User attempts with video proof
- `PlayerStats` - XP and ranking per sport
- `UserChallengeStatus` - Challenge progress tracking

### Notes

- Used string fields for `sportType`, `city`, `country` for MVP simplicity
- Email verification flow built into User model
- Single currency system (XP only)

---

## Migration Checklist Template

When creating migrations, follow this checklist:

- [ ] Schema changes reviewed and approved
- [ ] Migration file created with timestamp
- [ ] Up migration tested on dev database
- [ ] Down migration tested (rollback works)
- [ ] Data migration script prepared (if needed)
- [ ] Indexes verified for query performance
- [ ] Foreign key constraints verified
- [ ] Default values set appropriately
- [ ] Nullable fields documented
- [ ] SCHEMA_DOCS.md updated
- [ ] Prisma schema synced with migration
- [ ] Tests updated for schema changes
