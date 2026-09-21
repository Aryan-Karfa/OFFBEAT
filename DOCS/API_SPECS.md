# OFFBEAT — API SPECIFICATION

**Version:** 1.0
**Status:** Baseline API Contract
**Architecture:** REST
**Base URL:** `/api/v1`
**Backend:** Node.js + Express + TypeScript
**Validation:** Zod
**Database:** PostgreSQL + Prisma
**External Intelligence:** SerpApi
**AI Layer:** Gemini

---

# 1. API PURPOSE

The OFFBEAT API is the communication contract between the frontend application and the backend intelligence platform.

It exposes product-level capabilities for:

* Geographic discovery
* Travel Taste
* Experience Taste
* Place discovery
* Community intelligence
* Recommendations
* Alternatives
* Itinerary management
* TAKE HOME
* Saved places
* User profile and preferences

The API hides internal implementation details such as:

* SerpApi
* Gemini
* Confidence calculations
* Community aggregation
* Ranking logic
* Caching
* Internal intelligence services

The frontend should never need to know how OFFBEAT generated a recommendation.

---

# 2. API DESIGN PRINCIPLE

The API follows:

> **Frontend requests an outcome → Backend orchestrates intelligence → Backend returns an explainable result.**

Example:

```text
Frontend
   │
   │ POST /discover
   ▼
OFFBEAT API
   │
   ├── Intent Engine
   ├── Data Retrieval
   ├── Community Intelligence
   ├── Confidence
   ├── Gemini
   └── Recommendation Engine
   │
   ▼
Discovery Response
```

The frontend does not directly call:

```text
Gemini
SerpApi
Confidence Engine
Community Database
```

All external intelligence remains server-side.

---

# 3. BASE URL

All application endpoints use:

```text
/api/v1
```

Example:

```text
POST /api/v1/discover
```

---

# 4. RESPONSE FORMAT

Successful responses should follow a consistent envelope.

```json
{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "req_123"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid discovery request",
    "details": []
  },
  "meta": {
    "requestId": "req_123"
  }
}
```

Every request should receive a request ID for debugging and observability.

---

# 5. HTTP STATUS CODES

| Status | Meaning                         |
| ------ | ------------------------------- |
| `200`  | Successful request              |
| `201`  | Resource created                |
| `204`  | Successful request with no body |
| `400`  | Invalid request                 |
| `401`  | Authentication required         |
| `403`  | Permission denied               |
| `404`  | Resource not found              |
| `409`  | Resource conflict               |
| `422`  | Semantically invalid input      |
| `429`  | Rate limit exceeded             |
| `500`  | Internal server error           |
| `502`  | External service failure        |
| `503`  | Service temporarily unavailable |

---

# 6. AUTHENTICATION

Authenticated endpoints use:

```text
Authorization: Bearer <access_token>
```

Public discovery endpoints may be accessible without authentication where appropriate.

Authentication and authorization details will remain centralized rather than duplicated inside individual feature handlers.

---

# 7. API DOMAIN MAP

```text
/api/v1
│
├── /auth
│
├── /profile
│
├── /countries
│
├── /regions
│
├── /destinations
│
├── /places
│
├── /discover
│
├── /recommendations
│
├── /community
│
├── /itineraries
│
├── /take-home
│
└── /saved-places
```

---

# 8. AUTHENTICATION API

## POST `/auth/register`

Creates a new OFFBEAT account.

### Request

```json
{
  "email": "user@example.com",
  "username": "traveler123",
  "password": "********"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_123",
      "email": "user@example.com",
      "username": "traveler123"
    },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

---

## POST `/auth/login`

Authenticates a user.

### Request

```json
{
  "email": "user@example.com",
  "password": "********"
}
```

---

## POST `/auth/refresh`

Refreshes an expired access token.

---

## POST `/auth/logout`

Invalidates the active session/refresh token.

---

# 9. PROFILE API

## GET `/profile`

Returns the authenticated user's profile and relevant preferences.

---

## PATCH `/profile`

Updates profile information.

### Example

```json
{
  "displayName": "Aryan",
  "bio": "Always looking for the next place.",
  "avatarUrl": "..."
}
```

---

# 10. TRAVEL TASTE API

## GET `/travel-tastes`

Returns available Travel Taste categories.

### Example

```json
{
  "success": true,
  "data": [
    {
      "id": "taste_01",
      "name": "Mountains",
      "slug": "mountains"
    },
    {
      "id": "taste_02",
      "name": "Beaches",
      "slug": "beaches"
    }
  ]
}
```

---

# 11. EXPERIENCE TASTE API

## GET `/experience-tastes`

Returns available Experience Taste options.

Example:

```text
Sunrise
Photography
Peaceful
Adventure
Nature
Local Culture
Less Crowded
Night Experience
```

---

## PUT `/profile/preferences`

Stores or updates the user's preferences.

### Request

```json
{
  "travelTasteIds": [
    "mountains",
    "photography"
  ],
  "experienceTasteIds": [
    "sunrise",
    "peaceful",
    "nature"
  ]
}
```

---

# 12. GEOGRAPHIC DISCOVERY API

## GET `/countries`

Returns available countries.

---

## GET `/countries/:countryId`

Returns country information and its regions.

---

## GET `/countries/:countryId/regions`

Returns selectable States / Union Territories / equivalent regions.

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "reg_wb",
      "name": "West Bengal",
      "type": "STATE",
      "geometry": {},
      "centroid": {
        "lat": 22.9868,
        "lng": 87.855
      }
    }
  ]
}
```

The geometry supports the frontend's interactive map experience.

---

# 13. REGION API

## GET `/regions/:regionId`

Returns region information.

### Response

```json
{
  "success": true,
  "data": {
    "id": "reg_wb",
    "name": "West Bengal",
    "type": "STATE",
    "description": "...",
    "categories": [
      "Mountains",
      "Beaches",
      "History",
      "Culture",
      "Food"
    ]
  }
}
```

---

## GET `/regions/:regionId/destinations`

Returns destinations within the selected region.

---

# 14. PLACE API

## GET `/places/:placeId`

Returns detailed information about a place.

### Response

```json
{
  "success": true,
  "data": {
    "id": "place_tiger_hill",
    "name": "Tiger Hill",
    "destination": "Darjeeling",
    "categories": [
      "Mountain",
      "Sunrise",
      "Photography"
    ],
    "location": {
      "lat": 27.012,
      "lng": 88.261
    },
    "openingHours": {},
    "community": {},
    "timeIntelligence": {},
    "crowdIntelligence": {},
    "confidence": {}
  }
}
```

---

# 15. CORE DISCOVERY API

## POST `/discover`

This is the primary OFFBEAT intelligence endpoint.

It should be the main entry point for contextual discovery.

### Request

```json
{
  "regionId": "reg_wb",
  "travelTaste": [
    "mountains"
  ],
  "experienceTaste": [
    "sunrise",
    "photography",
    "peaceful"
  ],
  "dayNight": "DAY",
  "preferredTime": "EARLY_MORNING",
  "intent": "DISCOVER_PLACES"
}
```

### Backend Flow

```text
Request
 ↓
User Context
 ↓
Intent Engine
 ↓
Data Retrieval
 ↓
Normalization
 ↓
Community Intelligence
 ↓
Confidence
 ↓
Time Intelligence
 ↓
Crowd Intelligence
 ↓
Gemini
 ↓
Recommendation Engine
 ↓
Validation
 ↓
Response
```

### Response

```json
{
  "success": true,
  "data": {
    "context": {
      "region": "West Bengal",
      "travelTaste": ["Mountains"],
      "experienceTaste": [
        "Sunrise",
        "Photography",
        "Peaceful"
      ]
    },
    "recommendations": [
      {
        "place": {},
        "why": "Strong match for sunrise photography and a peaceful mountain experience.",
        "bestTime": {},
        "crowd": {},
        "community": {},
        "confidence": {},
        "reasoning": {}
      }
    ]
  },
  "meta": {
    "requestId": "req_123"
  }
}
```

---

# 16. DISCOVERY PAGINATION

Discovery results should support pagination or controlled result windows.

Example:

```text
POST /discover
```

Request:

```json
{
  "regionId": "reg_wb",
  "page": 1,
  "limit": 12
}
```

The backend should not retrieve or return unnecessary amounts of external data.

---

# 17. RECOMMENDATION API

## GET `/recommendations/:recommendationId`

Returns a previously generated recommendation.

---

## POST `/recommendations/refresh`

Requests a refreshed recommendation set using the current context.

The backend may reuse cached intelligence where valid rather than always calling external providers.

---

# 18. FIND AN ALTERNATIVE API

## GET `/places/:placeId/alternatives`

Returns contextual alternatives or complementary experiences.

### Query Parameters

```text
mode
travelTaste
experienceTaste
time
```

### Example

```text
GET /places/tiger-hill/alternatives?mode=LOWER_CROWD
```

### Response

```json
{
  "success": true,
  "data": {
    "originalPlace": {},
    "mode": "LOWER_CROWD",
    "alternatives": [
      {
        "place": {},
        "type": "REPLACEMENT",
        "why": "...",
        "similarity": {},
        "crowd": {},
        "confidence": {}
      }
    ]
  }
}
```

---

# 19. MUST-VISIT ALTERNATIVE MODE

The API must support context-aware alternative semantics.

### Possible modes

```text
REPLACEMENT
ENHANCEMENT
COMPLEMENTARY
NEARBY_DISCOVERY
TIMING_ALTERNATIVE
LOWER_CROWD
```

Example:

```text
GET /places/taj-mahal/alternatives?mode=COMPLEMENTARY
```

This allows OFFBEAT to preserve must-visit experiences rather than blindly replacing them.

---

# 20. COMMUNITY API

## POST `/community/submissions`

Creates a community discovery.

### Request

```json
{
  "placeId": "place_123",
  "type": "PHOTO_SPOT",
  "title": "Hidden sunrise viewpoint",
  "content": "A small viewpoint behind the main trail...",
  "evidence": [
    {
      "type": "PHOTO",
      "mediaUrl": "..."
    }
  ]
}
```

---

## GET `/community/submissions`

Returns community discoveries.

### Query Parameters

```text
placeId
destinationId
type
status
page
limit
```

---

## GET `/community/submissions/:submissionId`

Returns a specific submission including:

* Content
* Author
* Evidence
* Support
* Verification state
* Confidence
* Reports where appropriate

---

# 21. SUPPORT COMMUNITY DISCOVERY

## POST `/community/submissions/:submissionId/support`

Supports or confirms a community discovery.

### Request

```json
{
  "type": "CONFIRM"
}
```

The backend prevents duplicate support from the same user.

---

# 22. REPORT COMMUNITY DISCOVERY

## POST `/community/submissions/:submissionId/report`

Reports potentially incorrect or problematic information.

### Request

```json
{
  "reason": "OUTDATED",
  "description": "The access conditions have changed."
}
```

---

# 23. COMMUNITY VERIFICATION

## GET `/community/submissions/:submissionId/verification`

Returns the current verification state and relevant confidence information.

Example:

```json
{
  "success": true,
  "data": {
    "status": "COMMUNITY_SUPPORTED",
    "confidence": {
      "score": 0.78,
      "evidenceCount": 5,
      "supportCount": 12,
      "contradictionCount": 1
    }
  }
}
```

The raw internal AI reasoning should not automatically be exposed.

The API returns a user-facing explanation where appropriate.

---

# 24. TIME INTELLIGENCE API

Time intelligence is primarily consumed by discovery and place-detail APIs.

However, a dedicated endpoint can be exposed where the frontend needs focused timing information.

## GET `/places/:placeId/times`

Returns:

* Operating hours
* Community-recommended times
* Best experience windows
* Relevant crowd timing

### Example Response

```json
{
  "success": true,
  "data": {
    "operatingHours": {},
    "recommendedTimes": [
      {
        "start": "04:30",
        "end": "05:30",
        "reason": "Sunrise photography",
        "source": "COMMUNITY"
      }
    ]
  }
}
```

The response must distinguish **operating information** from **community recommendation**.

---

# 25. CROWD INTELLIGENCE API

## GET `/places/:placeId/crowd`

Returns contextual crowd information.

### Response

```json
{
  "success": true,
  "data": {
    "overall": "MODERATE",
    "patterns": [
      {
        "dayType": "WEEKEND",
        "time": "08:00-10:00",
        "level": "HIGH"
      }
    ],
    "confidence": 0.81
  }
}
```

Crowd information should remain contextual rather than presenting a false universal crowd score.

---

# 26. ITINERARY API

## POST `/itineraries`

Creates an itinerary.

### Request

```json
{
  "destinationId": "dest_darjeeling",
  "title": "Darjeeling — 3 Days",
  "startDate": "2026-10-10",
  "endDate": "2026-10-12"
}
```

---

## GET `/itineraries`

Returns the authenticated user's itineraries.

---

## GET `/itineraries/:itineraryId`

Returns an itinerary and its items.

---

## PATCH `/itineraries/:itineraryId`

Updates itinerary metadata.

---

## DELETE `/itineraries/:itineraryId`

Deletes or archives an itinerary.

---

# 27. ITINERARY ITEM API

## POST `/itineraries/:itineraryId/items`

Adds a place.

### Request

```json
{
  "placeId": "place_123",
  "date": "2026-10-10",
  "startTime": "04:30",
  "endTime": "06:30",
  "position": 1
}
```

---

## PATCH `/itineraries/:itineraryId/items/:itemId`

Updates an itinerary item.

---

## DELETE `/itineraries/:itineraryId/items/:itemId`

Removes an itinerary item.

---

# 28. ITINERARY INTELLIGENCE

## POST `/itineraries/:itineraryId/optimize`

Requests OFFBEAT to improve an itinerary.

The backend evaluates:

```text
Opening Hours
Time Intelligence
Crowd Intelligence
Distance
Travel Time
User Preferences
Experience Taste
Geographic Clustering
```

The API returns a proposed optimized itinerary.

The backend should not silently modify a user's itinerary without explicit user action.

---

# 29. TAKE HOME API

## GET `/destinations/:destinationId/take-home`

Returns meaningful local things a traveler can discover and take home.

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "takehome_01",
      "name": "Local Handwoven Textile",
      "category": "CLOTHING",
      "description": "...",
      "whereToFind": "...",
      "source": "COMMUNITY"
    }
  ]
}
```

TAKE HOME remains a discovery experience, not an e-commerce API.

---

# 30. SAVED PLACE API

## POST `/saved-places`

Saves a place.

### Request

```json
{
  "placeId": "place_123"
}
```

---

## GET `/saved-places`

Returns saved places.

---

## DELETE `/saved-places/:placeId`

Removes a saved place.

---

# 31. EXTERNAL DATA BOUNDARY

The following services must remain **internal to the backend**:

```text
SerpApi
Gemini
Search Cache
Confidence Engine
Recommendation Engine
Intent Engine
Community Aggregation
```

The frontend must never call:

```text
SerpApi directly
Gemini directly
Database directly
```

This protects:

* API keys
* Business logic
* Query construction
* AI prompts
* Ranking logic
* Confidence logic
* External API quotas

---

# 32. AI RESPONSE CONTRACT

Gemini outputs must be converted into a controlled internal structure before reaching the frontend.

Conceptually:

```json
{
  "reasoning": "...",
  "recommendations": [
    {
      "placeId": "place_123",
      "reason": "...",
      "bestTime": "...",
      "experienceMatch": [
        "sunrise",
        "photography"
      ]
    }
  ],
  "warnings": [],
  "confidenceNotes": []
}
```

The backend validates this output before using it.

Gemini must never directly determine:

* Database IDs
* Authorization
* User permissions
* Final database state
* Unvalidated external URLs
* Security decisions

---

# 33. ZOD VALIDATION

Every externally supplied request must be validated before entering the domain layer.

Example conceptual flow:

```text
HTTP Request
     ↓
Zod Schema
     ↓
Validated Input
     ↓
Controller
     ↓
Service
     ↓
Domain Logic
```

AI outputs should also be validated before they are accepted.

---

# 34. ERROR HANDLING

Errors should use stable machine-readable codes.

Example:

```json
{
  "success": false,
  "error": {
    "code": "PLACE_NOT_FOUND",
    "message": "The requested place could not be found."
  }
}
```

Example error codes:

```text
VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
PLACE_NOT_FOUND
REGION_NOT_FOUND
SUBMISSION_NOT_FOUND
ITINERARY_NOT_FOUND
DUPLICATE_SUPPORT
INVALID_STATE
RATE_LIMITED
EXTERNAL_SERVICE_ERROR
AI_SERVICE_ERROR
DATABASE_ERROR
```

---

# 35. RATE LIMITING

Rate limiting should operate at multiple levels.

### Public APIs

Restrict excessive anonymous discovery requests.

### Authenticated APIs

Use user-level rate limits.

### Community APIs

Use stricter limits for:

* Submissions
* Reports
* Support actions

### AI / External APIs

Apply backend-level protection to prevent unnecessary Gemini and SerpApi consumption.

---

# 36. CACHING

The backend may cache:

* Geographic data
* Place information
* External search results
* Opening information
* Frequently requested discovery context
* TAKE HOME information

However:

> **Community evidence and user-specific intelligence should not be blindly served from generic cache entries.**

Cache invalidation should consider data freshness.

---

# 37. API SECURITY

The API must enforce:

* Authentication where required
* Authorization
* Input validation
* Rate limiting
* Request IDs
* Server-side API keys
* Safe error messages
* Payload size limits
* CORS restrictions
* Secure password hashing
* Token validation

---

# 38. API VERSIONING

The initial API uses:

```text
/api/v1
```

Breaking changes should result in a new version.

Example:

```text
/api/v2
```

The backend should avoid breaking existing clients through silent schema changes.

---

# 39. API RESPONSE DESIGN PRINCIPLE

Responses should be designed around **frontend needs**, not database tables.

Bad:

```json
{
  "placeTable": {},
  "confidenceTable": {},
  "timeObservationTable": {}
}
```

Good:

```json
{
  "place": {},
  "bestTime": {},
  "crowd": {},
  "community": {},
  "confidence": {},
  "why": {}
}
```

The backend should compose information into a usable product response.

---

# 40. CORE API FLOW

The main OFFBEAT experience becomes:

```text
USER
 │
 ▼
FRONTEND
 │
 ▼
POST /api/v1/discover
 │
 ▼
API VALIDATION
 │
 ▼
INTENT ENGINE
 │
 ▼
DISCOVERY ORCHESTRATOR
 │
 ├── SerpApi
 ├── PostgreSQL
 ├── Community Intelligence
 ├── Crowd Intelligence
 └── Time Intelligence
 │
 ▼
CONFIDENCE ENGINE
 │
 ▼
GEMINI
 │
 ▼
RECOMMENDATION ENGINE
 │
 ▼
RESPONSE
 │
 ▼
FRONTEND
```

---

# 41. API SURFACE SUMMARY

| Domain           | Core Endpoints                |
| ---------------- | ----------------------------- |
| Auth             | `/auth/*`                     |
| Profile          | `/profile`                    |
| Travel Taste     | `/travel-tastes`              |
| Experience Taste | `/experience-tastes`          |
| Geography        | `/countries/*`, `/regions/*`  |
| Places           | `/places/*`                   |
| Discovery        | `/discover`                   |
| Recommendations  | `/recommendations/*`          |
| Alternatives     | `/places/:id/alternatives`    |
| Community        | `/community/*`                |
| Time             | `/places/:id/times`           |
| Crowd            | `/places/:id/crowd`           |
| Itinerary        | `/itineraries/*`              |
| TAKE HOME        | `/destinations/:id/take-home` |
| Saved Places     | `/saved-places/*`             |

---

# 42. API NORTH STAR

The API should make the frontend experience simple even though the intelligence behind it is complex.

The frontend should be able to say:

> **“This is what the traveler wants.”**

And the backend should handle:

> **“Here's everything OFFBEAT knows that can help.”**

---

# 43. FINAL API DEFINITION

> **The OFFBEAT API is a versioned REST interface that exposes product-level travel discovery capabilities while keeping external providers, AI reasoning, confidence calculations, community aggregation, and business logic entirely within the backend.**

The API exists to turn OFFBEAT's intelligence architecture into a **stable, secure, explainable contract between the product interface and the system's underlying intelligence.**