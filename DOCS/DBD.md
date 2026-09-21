# OFFBEAT — DATABASE DESIGN DOCUMENT

**Version:** 1.0
**Status:** Baseline Database Architecture
**Database:** PostgreSQL
**ORM:** Prisma
**Backend:** Node.js + Express + TypeScript

---

# 1. DATABASE PURPOSE

The OFFBEAT database is the persistent knowledge and application-data layer of the platform.

It stores:

* Users
* Travel preferences
* Destinations and geographic regions
* Places and categories
* Community discoveries
* Evidence and verification
* Confidence signals
* Crowd observations
* Time observations
* Itineraries
* TAKE HOME discoveries
* Saved places
* Recommendations
* External data references
* Memory-related information

The database must support both:

### Application Data

Information required to operate the product.

### Intelligence Data

Information that allows OFFBEAT to understand:

> **What exists, what travelers say, what evidence supports it, and how strongly that information can be trusted.**

---

# 2. DATABASE PRINCIPLES

The database follows these principles:

### 2.1 Structured over raw

External provider responses should not become the application's primary schema.

OFFBEAT stores normalized internal entities.

---

### 2.2 Evidence must be preserved

Community information should not simply become a final boolean or score.

The underlying evidence should remain available.

Example:

```text
User A → "Very crowded after 9 AM"
User B → "Quiet at 8 AM"
User C → "Weekends are crowded"
```

These observations should remain independently traceable.

---

### 2.3 Facts and interpretations are separate

The database should distinguish between:

* External facts
* Community observations
* Verification results
* Derived intelligence
* AI interpretations

---

### 2.4 Confidence is derived

Confidence should be calculated from evidence and signals rather than manually treated as absolute truth.

---

### 2.5 Historical information matters

Community knowledge can change.

Opening hours can change.

Crowd patterns can change.

Recommendations can become outdated.

Therefore, important intelligence records should retain timestamps and history wherever practical.

---

# 3. HIGH-LEVEL ENTITY MODEL

The core database can be represented as:

```text
USER
 │
 ├── PROFILE
 ├── TRAVEL TASTE
 ├── EXPERIENCE TASTE
 ├── SAVED PLACES
 ├── ITINERARIES
 └── COMMUNITY SUBMISSIONS
              │
              ▼
       COMMUNITY SUBMISSION
              │
       ┌──────┼────────┐
       ▼      ▼        ▼
    EVIDENCE SUPPORT  REPORT
       │
       ▼
   VERIFICATION
       │
       ▼
   CONFIDENCE
       │
       ▼
   PLACE KNOWLEDGE
```

Geographic structure:

```text
COUNTRY
   │
   ▼
REGION / STATE / UNION TERRITORY
   │
   ▼
DESTINATION
   │
   ▼
PLACE
   │
   ├── CATEGORY
   ├── TIME OBSERVATION
   ├── CROWD OBSERVATION
   ├── COMMUNITY DISCOVERIES
   ├── TAKE HOME
   └── EXTERNAL REFERENCES
```

---

# 4. CORE ENTITIES

The initial OFFBEAT database consists of the following major domains.

## User Domain

* User
* Profile
* TravelTaste
* ExperienceTaste
* UserTravelTaste
* UserExperienceTaste
* SavedPlace

## Geography / Place Domain

* Country
* Region
* Destination
* Place
* PlaceCategory
* PlaceCategoryRelation

## Community Domain

* CommunitySubmission
* SubmissionEvidence
* SubmissionSupport
* SubmissionReport

## Intelligence Domain

* VerificationRecord
* ConfidenceRecord
* CrowdObservation
* TimeObservation
* Recommendation

## Planning Domain

* Itinerary
* ItineraryItem

## TAKE HOME Domain

* TakeHomeItem

## External Intelligence Domain

* ExternalPlaceReference
* SearchCache

---

# 5. USER DOMAIN

## 5.1 User

Represents an authenticated OFFBEAT account.

```text
User
├── id
├── email
├── username
├── passwordHash
├── createdAt
├── updatedAt
└── status
```

### Responsibilities

* Authentication identity
* Ownership of user-created content
* Community contribution attribution
* Saved places
* Itineraries
* Preference association

---

# 6. PROFILE

Stores optional user-level profile information.

```text
Profile
├── id
├── userId
├── displayName
├── avatarUrl
├── bio
├── homeCountry
├── createdAt
└── updatedAt
```

Profile information should remain separate from authentication credentials.

---

# 7. TRAVEL TASTE

Travel Taste represents broad travel categories.

Initial categories:

```text
Historical
Beaches
Mountains
Nature
Food & Culinary
Photography
Spiritual
Culture & Art
Adventure
Local Life
Sunrise / Sunset
Nightlife
```

### TravelTaste

```text
TravelTaste
├── id
├── name
├── slug
├── description
└── status
```

---

# 8. EXPERIENCE TASTE

Experience Taste represents more specific experiences.

Examples:

```text
Sunrise
Photography
Peaceful
Adventure
Nature
Local Culture
Food
Hidden
Less Crowded
Night Experience
```

These are intentionally separate from Travel Taste.

Example:

```text
Travel Taste:
Mountains

Experience Taste:
Sunrise
Photography
Peaceful
Nature
```

---

# 9. USER PREFERENCE RELATIONSHIPS

Many-to-many relationships are required.

```text
User
 │
 ├── UserTravelTaste ── TravelTaste
 │
 └── UserExperienceTaste ── ExperienceTaste
```

This allows a user to have multiple preferences without embedding them directly into the User table.

---

# 10. GEOGRAPHIC HIERARCHY

OFFBEAT's geographic discovery model follows:

```text
COUNTRY
   ↓
REGION
   ↓
DESTINATION
   ↓
PLACE
```

The hierarchy is intentionally compatible with the map-first UX.

---

# 11. COUNTRY

```text
Country
├── id
├── name
├── code
├── slug
├── geometry
├── createdAt
└── updatedAt
```

`geometry` may contain the geographic representation required by the map system.

---

# 12. REGION

A Region represents a selectable geographic administrative area such as:

* State
* Union Territory
* Province
* Equivalent administrative region

```text
Region
├── id
├── countryId
├── name
├── code
├── type
├── slug
├── geometry
├── centroid
├── createdAt
└── updatedAt
```

### Example

```text
Country:
India

Region:
West Bengal

type:
STATE
```

The frontend's **region rise/pop interaction** is driven by this geographic entity.

---

# 13. DESTINATION

A destination represents a travel destination or destination cluster.

Examples:

```text
Darjeeling
Digha
Kolkata
Kalimpong
```

```text
Destination
├── id
├── regionId
├── name
├── slug
├── description
├── coordinates
├── imageUrl
├── status
├── createdAt
└── updatedAt
```

A destination can contain multiple places.

---

# 14. PLACE

Place is one of the most important entities in OFFBEAT.

It represents a specific location that a traveler can discover.

Examples:

```text
Tiger Hill
Victoria Memorial
Mandarmani Beach
Jorasanko Thakur Bari
```

```text
Place
├── id
├── destinationId
├── name
├── slug
├── description
├── latitude
├── longitude
├── address
├── website
├── phone
├── imageUrl
├── status
├── createdAt
└── updatedAt
```

Additional structured intelligence should be associated through separate entities rather than creating a massive Place table.

---

# 15. PLACE CATEGORY

```text
PlaceCategory
├── id
├── name
├── slug
└── description
```

Examples:

```text
Historical
Beach
Mountain
Nature
Restaurant
Photography
Spiritual
Adventure
Culture
Local Business
```

Places can belong to multiple categories.

Therefore:

```text
Place
   ↕
PlaceCategoryRelation
   ↕
PlaceCategory
```

---

# 16. EXTERNAL PLACE REFERENCES

OFFBEAT may discover the same place through external services.

Instead of storing provider-specific identifiers directly in Place:

```text
ExternalPlaceReference
├── id
├── placeId
├── provider
├── externalId
├── sourceUrl
├── metadata
├── lastSyncedAt
└── createdAt
```

Example:

```text
provider:
SERPAPI

externalId:
provider-specific place identifier
```

This keeps OFFBEAT's internal Place entity independent of external providers.

---

# 17. COMMUNITY SUBMISSION

This represents something submitted by a traveler.

```text
CommunitySubmission
├── id
├── userId
├── placeId
├── destinationId
├── type
├── title
├── content
├── status
├── createdAt
└── updatedAt
```

### Submission Types

```text
HIDDEN_PLACE
LOCAL_BUSINESS
RESTAURANT
PHOTO_SPOT
BEST_TIME
CROWD_TIP
TRAVEL_TIP
LOCAL_SPECIALTY
TAKE_HOME
EXPERIENCE
ALTERNATIVE
OTHER
```

A submission does not automatically become trusted knowledge.

It enters the verification pipeline.

---

# 18. SUBMISSION EVIDENCE

Evidence supporting a submission should be stored independently.

```text
SubmissionEvidence
├── id
├── submissionId
├── type
├── source
├── content
├── mediaUrl
├── externalReference
├── createdAt
└── metadata
```

Possible evidence:

```text
Photo
Review
External source
Repeated observation
Geographic evidence
Community observation
```

This enables OFFBEAT to reason over the **evidence behind a claim**.

---

# 19. SUBMISSION SUPPORT

Community members can support another submission.

```text
SubmissionSupport
├── id
├── submissionId
├── userId
├── createdAt
└── type
```

Possible support:

```text
AGREE
USEFUL
CONFIRM
```

A user should not be able to create unlimited duplicate support records.

A unique constraint should prevent duplicate support from the same user for the same submission.

---

# 20. SUBMISSION REPORT

Community members can report potentially incorrect or problematic information.

```text
SubmissionReport
├── id
├── submissionId
├── userId
├── reason
├── description
├── status
├── createdAt
└── resolvedAt
```

Possible reasons:

```text
INCORRECT
OUTDATED
DUPLICATE
SPAM
MISLEADING
INAPPROPRIATE
OTHER
```

---

# 21. VERIFICATION RECORD

Verification represents the result of the review and verification process.

```text
VerificationRecord
├── id
├── submissionId
├── status
├── method
├── reviewer
├── reasoning
├── createdAt
└── updatedAt
```

### Verification States

```text
PENDING
COMMUNITY_SUPPORTED
COMMUNITY_VERIFIED
FLAGGED
REJECTED
```

Gemini may assist interpretation, but the system should retain the underlying evidence and verification history.

---

# 22. CONFIDENCE RECORD

Confidence represents the current strength of evidence for a piece of community knowledge.

```text
ConfidenceRecord
├── id
├── submissionId
├── score
├── evidenceCount
├── supportCount
├── contradictionCount
├── externalCorroboration
├── reasoning
├── calculatedAt
└── version
```

Important:

> **Confidence is evidence strength, not truth.**

The scoring formula will be defined by the intelligence layer and versioned so that future changes do not destroy historical understanding.

---

# 23. CROWD OBSERVATION

Crowd intelligence needs its own data model.

```text
CrowdObservation
├── id
├── placeId
├── destinationId
├── userId
├── level
├── timeStart
├── timeEnd
├── dayType
├── season
├── observation
├── source
├── createdAt
└── expiresAt
```

### Crowd Levels

```text
LOW
MODERATE
HIGH
VERY_HIGH
UNKNOWN
```

This enables OFFBEAT to understand:

```text
Place
+
Time
+
Day
+
Season
```

rather than storing only:

```text
crowded = true
```

---

# 24. TIME OBSERVATION

Time intelligence records when a place is considered useful, accessible, or particularly valuable.

```text
TimeObservation
├── id
├── placeId
├── userId
├── type
├── startTime
├── endTime
├── dayType
├── observation
├── source
├── confidence
├── createdAt
└── expiresAt
```

### Types

```text
OPENING_TIME
CLOSING_TIME
BEST_TIME
SUNRISE_TIME
SUNSET_TIME
LOW_CROWD_TIME
COMMUNITY_RECOMMENDED_TIME
```

The distinction between operating information and community recommendation must remain explicit.

---

# 25. ITINERARY

```text
Itinerary
├── id
├── userId
├── destinationId
├── title
├── startDate
├── endDate
├── status
├── createdAt
└── updatedAt
```

---

# 26. ITINERARY ITEM

```text
ItineraryItem
├── id
├── itineraryId
├── placeId
├── date
├── startTime
├── endTime
├── position
├── notes
├── createdAt
└── updatedAt
```

`position` allows drag-and-drop reordering.

---

# 27. TAKE HOME ITEM

TAKE HOME should be linked to a destination and optionally to a place/community discovery.

```text
TakeHomeItem
├── id
├── destinationId
├── placeId
├── submissionId
├── category
├── name
├── description
├── whereToFind
├── imageUrl
├── createdAt
└── updatedAt
```

### Categories

```text
FOOD
HANDICRAFT
CLOTHING
ART
LOCAL_PRODUCT
REGIONAL_SPECIALTY
CULTURAL_ITEM
WORKSHOP
EXPERIENCE
OTHER
```

---

# 28. SAVED PLACE

Users can save discoveries.

```text
SavedPlace
├── id
├── userId
├── placeId
├── createdAt
└── updatedAt
```

Unique constraint:

```text
(userId, placeId)
```

---

# 29. RECOMMENDATION

Recommendations generated for a user may need persistence for history, analytics, or explanation.

```text
Recommendation
├── id
├── userId
├── placeId
├── destinationId
├── intent
├── reason
├── sourceSummary
├── confidence
├── generatedBy
├── createdAt
└── expiresAt
```

The recommendation should not become permanent truth.

It represents an intelligence result generated within a particular context.

---

# 30. SEARCH CACHE

External API responses should be cached to reduce unnecessary calls and improve response time.

```text
SearchCache
├── id
├── provider
├── queryHash
├── query
├── response
├── expiresAt
└── createdAt
```

The raw cached response is an implementation detail and should not become the frontend's data contract.

---

# 31. RELATIONSHIP OVERVIEW

```text
USER
 │
 ├──────── PROFILE
 │
 ├──────── USER_TRAVEL_TASTE ─────── TRAVEL_TASTE
 │
 ├──────── USER_EXPERIENCE_TASTE ─── EXPERIENCE_TASTE
 │
 ├──────── SAVED_PLACE ───────────── PLACE
 │
 ├──────── ITINERARY
 │             │
 │             └──── ITINERARY_ITEM ─── PLACE
 │
 └──────── COMMUNITY_SUBMISSION
                │
                ├──── EVIDENCE
                ├──── SUPPORT
                ├──── REPORT
                ├──── VERIFICATION
                └──── CONFIDENCE


COUNTRY
   │
   └──── REGION
           │
           └──── DESTINATION
                    │
                    └──── PLACE
                           │
                           ├──── CATEGORY
                           ├──── EXTERNAL_REFERENCE
                           ├──── CROWD_OBSERVATION
                           ├──── TIME_OBSERVATION
                           ├──── COMMUNITY_SUBMISSION
                           └──── TAKE_HOME_ITEM
```

---

# 32. DATA OWNERSHIP

Each domain has a clear ownership boundary.

| Domain          | Primary Owner         |
| --------------- | --------------------- |
| Authentication  | User                  |
| Preferences     | User Profile          |
| Geography       | Geography Domain      |
| Places          | Place Domain          |
| Community       | Community Domain      |
| Verification    | Verification Domain   |
| Confidence      | Intelligence Domain   |
| Crowd           | Crowd Intelligence    |
| Time            | Time Intelligence     |
| Recommendations | Recommendation Engine |
| Itinerary       | Itinerary Domain      |
| TAKE HOME       | TAKE HOME Domain      |
| External Data   | External Data Layer   |
| Cache           | Infrastructure        |

---

# 33. DATA LIFECYCLE

Community intelligence follows:

```text
SUBMITTED
    ↓
COLLECT EVIDENCE
    ↓
COMMUNITY SUPPORT
    ↓
VERIFY
    ↓
CONFIDENCE
    ↓
ACTIVE KNOWLEDGE
    ↓
MONITOR
    ↓
UPDATED / EXPIRED / FLAGGED
```

This prevents old community information from becoming permanent unquestioned truth.

---

# 34. SOFT DELETION / STATUS

Important user-generated and intelligence records should generally avoid immediate hard deletion when historical context is useful.

Use states such as:

```text
ACTIVE
INACTIVE
FLAGGED
ARCHIVED
REJECTED
EXPIRED
```

Permanent deletion should be reserved for cases where data-retention requirements or privacy requirements require it.

---

# 35. INDEXING STRATEGY

Important indexes should exist for:

### User

```text
email
username
```

### Geography

```text
Country.slug
Region.countryId
Region.slug
Destination.regionId
Destination.slug
```

### Places

```text
Place.destinationId
Place.slug
Place.latitude / longitude
Place.status
```

### Community

```text
CommunitySubmission.placeId
CommunitySubmission.userId
CommunitySubmission.status
SubmissionEvidence.submissionId
SubmissionSupport.submissionId
SubmissionReport.submissionId
```

### Intelligence

```text
ConfidenceRecord.submissionId
CrowdObservation.placeId
CrowdObservation.timeStart
TimeObservation.placeId
TimeObservation.startTime
```

### Planning

```text
Itinerary.userId
ItineraryItem.itineraryId
ItineraryItem.date
```

Indexes should be validated against actual query patterns during implementation.

---

# 36. GEOSPATIAL CONSIDERATIONS

Because OFFBEAT is fundamentally geographic, PostgreSQL should support efficient location queries.

Where practical, the implementation should use:

**PostGIS**

for:

* Radius searches
* Nearby places
* Geographic boundaries
* Region geometry
* Distance calculations
* Map discovery
* Alternative discovery

This is particularly important for:

> **“Find something OFFBEAT near this place.”**

---

# 37. PRISMA IMPLEMENTATION

Prisma should represent the relational domain model while PostgreSQL remains the authoritative database.

The implementation should prioritize:

* Strong typing
* Foreign-key integrity
* Unique constraints
* Enum consistency
* Transaction boundaries
* Indexed query paths
* Migration history

The exact Prisma schema should be generated only after the final entity relationships and API contracts are locked.

---

# 38. TRANSACTION REQUIREMENTS

Transactions should be used when multiple related records must succeed or fail together.

Examples:

### Community Submission

```text
Create Submission
+
Create Evidence
+
Create Initial Confidence
```

### Verification

```text
Update Verification
+
Update Confidence
+
Update Submission Status
```

### Itinerary

```text
Create Itinerary
+
Create Initial Items
```

The goal is to prevent partially completed domain operations.

---

# 39. DATABASE VS INTELLIGENCE

The database stores evidence and structured state.

It does **not** independently decide what the traveler should do.

The architecture remains:

```text
DATABASE
    ↓
RAW / STRUCTURED KNOWLEDGE
    ↓
INTELLIGENCE SERVICES
    ↓
GEMINI REASONING
    ↓
RECOMMENDATION ENGINE
    ↓
USER
```

This separation is fundamental.

---

# 40. DATABASE NORTH STAR

The OFFBEAT database should answer four fundamental questions:

### 1. What exists?

Places, destinations, regions, categories.

### 2. What do travelers say?

Community submissions, observations, evidence.

### 3. How strong is the evidence?

Support, contradictions, verification, confidence.

### 4. What context can OFFBEAT use?

Time, crowd, preferences, saved places, itineraries, and destination knowledge.

---

# 41. FINAL DATABASE DEFINITION

> **The OFFBEAT database is a PostgreSQL-backed knowledge and application data layer that stores geographic entities, places, traveler preferences, community discoveries, evidence, verification history, confidence signals, crowd and time observations, itineraries, TAKE HOME discoveries, and external references — enabling the intelligence layer to transform fragmented travel information into contextual, explainable discovery.**

The database is therefore not merely a storage layer.

> **It is the persistent knowledge foundation of OFFBEAT.**
