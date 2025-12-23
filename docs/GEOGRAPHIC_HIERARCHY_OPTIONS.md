# Geographic Hierarchy Design Decision

**Status:** Under Discussion
**Date:** 2025-12-18
**Decision Needed By:** TBD
**Team Lead Preference:** Option A (simplest, extend later)

---

## The Problem

We need a location system that works globally for:

1. **User home location** - Where the player is based
2. **Venue location** - Where courts/fields are located
3. **Rankings** - Venue-level, City-level, Country-level leaderboards

The challenge: **"District" means completely different things in different countries.**

---

## How Different Regions Structure Locations

| Region              | Administrative Levels                                      | "District" Equivalent                          |
| ------------------- | ---------------------------------------------------------- | ---------------------------------------------- |
| **Vienna, Austria** | Country → State (Bundesland) → City → Bezirk               | Bezirk (1-23) = small neighborhood             |
| **Austria overall** | Country → Bundesland → Bezirk → Gemeinde                   | Bezirk = large area containing multiple towns! |
| **New York, USA**   | Country → State → City → Borough → Neighborhood            | Borough (Manhattan, Brooklyn) or neighborhood  |
| **Tokyo, Japan**    | Country → Prefecture → City → Ward (ku)                    | 23 special wards = quite large                 |
| **Pakistan**        | Country → Province → Division → District → Tehsil          | District = very large (like a county)          |
| **Vietnam**         | Country → Province → District (Quận) → Ward                | District varies wildly in size                 |
| **Germany**         | Country → Bundesland → Regierungsbezirk → Kreis → Gemeinde | Multiple levels, complex                       |

**Key insight:** Even within Austria, "Bezirk" means different things:

- In Vienna: small neighborhood (e.g., "7. Bezirk" ~1.6 km²)
- In rest of Austria: large administrative area containing multiple cities

---

## Current Schema Design

```
Country → State → City → District → Venue
```

**Problems:**

1. Assumes District < City, but in many countries District > City
2. State not needed for rankings (Venue → City → Country is enough)
3. Rigid hierarchy doesn't fit all countries
4. Manual data entry burden

---

## Options

### Option A: Simplified 3-Tier with Sublocality String

**Structure:**

```
Country
  - id, name, code (ISO 3166-1)

City
  - id, name, countryId

Venue
  - id, name, cityId
  - sublocality (optional string: "7. Bezirk", "Manhattan", "Shibuya")
  - address, latitude, longitude
```

**Rankings:** Venue → City → Country (3 tiers)

| Pros               | Cons                                   |
| ------------------ | -------------------------------------- |
| Simple schema      | No district-level rankings             |
| Works everywhere   | Sublocality is unstructured            |
| Easy to understand | Can't filter venues by district easily |
| Fast queries       |                                        |

---

### Option B: Google Places Integration

**Structure:**

```
Country
  - id, name, code
  - googlePlaceId

City
  - id, name, countryId
  - googlePlaceId

Venue
  - id, name, cityId
  - googlePlaceId
  - formattedAddress (from Google)
  - sublocality (extracted from Google)
  - latitude, longitude
```

**How it works:**

1. User types address in Google Places Autocomplete
2. Google returns structured data + Place ID
3. We extract country, city, sublocality automatically
4. Store Place ID for future reference/updates

**Rankings:** Venue → City → Country (3 tiers)

| Pros                               | Cons                                    |
| ---------------------------------- | --------------------------------------- |
| Auto-populates locations           | Google API dependency                   |
| Handles all countries correctly    | API costs (though Autocomplete is free) |
| Consistent address formatting      | Need internet for location entry        |
| Can query Google for updates       |                                         |
| Users get familiar autocomplete UX |                                         |

---

### Option C: Flexible Parent-Child Hierarchy

**Structure:**

```
Location
  - id, name
  - type (country | region | city | district | neighborhood)
  - parentId (self-reference, nullable)
  - googlePlaceId (optional)
  - level (1=country, 2=region, 3=city, etc.)

Venue
  - id, name
  - locationId (FK to most specific Location)
  - latitude, longitude
```

**Rankings:** Can do any level (Venue → Neighborhood → City → Region → Country)

| Pros                            | Cons                                       |
| ------------------------------- | ------------------------------------------ |
| Maximum flexibility             | Complex queries (recursive)                |
| Supports any hierarchy          | Over-engineered for MVP                    |
| Can add district rankings later | Harder to understand                       |
|                                 | Performance concerns with deep hierarchies |

---

### Option D: Keep Current + Remove State

**Structure:**

```
Country
  - id, name, code

City
  - id, name, countryId
  - region (optional string: "Vienna", "California", "Bavaria")

District (optional)
  - id, name, cityId
  - number (optional)

Venue
  - id, name, cityId
  - districtId (optional)
  - address, latitude, longitude
```

**Rankings:** Venue → District (optional) → City → Country

| Pros                             | Cons                                    |
| -------------------------------- | --------------------------------------- |
| Keeps district rankings possible | "District" still means different things |
| Simpler than current (no State)  | Manual data entry for districts         |
|                                  | Doesn't scale globally well             |

---

## Recommendation

**For MVP: Option B (Google Places Integration)**

Reasons:

1. **User experience** - Google Autocomplete is familiar and fast
2. **Global coverage** - Works correctly in every country
3. **Less work** - No manual location data entry
4. **Accuracy** - Coordinates and addresses are always correct
5. **Future-proof** - Can add district rankings later if needed
6. **KISS principle** - Let Google handle the complexity

**Ranking tiers:** Venue → City → Country (clean 3-tier system)

**Sublocality** (district/neighborhood) stored as string for display/filtering, not as separate ranking tier.

---

## Questions for Team Discussion

1. **Do we need district-level rankings?**
   - Vienna: Rankings for "7. Bezirk" specifically?
   - Or is City-level (all of Vienna) enough?

2. **State/Province rankings?**
   - Rankings for "all of Austria" vs "Vienna only"?
   - Probably not needed for MVP

3. **Is Google dependency acceptable?**
   - Places Autocomplete is free (no API charge)
   - Requires Google Cloud project setup
   - Alternative: OpenStreetMap/Nominatim (free, less polished)

4. **Manual venue entry?**
   - Should admins be able to add venues without Google?
   - Or always require Google Places lookup?

---

## Team Input

### Almir (Team Lead) - 2025-12-18

**Preference: Option A**

Rationale:

- Start with the simplest approach (KISS principle)
- Can extend to Option B (Google Places) later if needed
- Avoids external dependencies for MVP
- Sublocality as string field is flexible enough for now

---

## Next Steps

1. ~~Team discusses and picks an option~~
2. Finalize decision after team feedback
3. Update schema design (remove State, District tables)
4. Update SCHEMA_DOCS.md with final decision
5. Implement location entry flow

---

## References

- [Google Places API](https://developers.google.com/maps/documentation/places/web-service/overview)
- [Google Address Components](https://developers.google.com/maps/documentation/javascript/geocoding#GeocodingAddressTypes)
- [ISO 3166-1 Country Codes](https://en.wikipedia.org/wiki/ISO_3166-1)
