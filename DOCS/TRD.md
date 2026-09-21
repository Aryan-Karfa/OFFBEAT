# OFFBEAT — TECHNICAL REQUIREMENTS DOCUMENT

**Version:** 1.0
**Status:** Baseline Technical Specification
**Product:** OFFBEAT
**Track:** Travel & Local Discovery
**Primary External Data Provider:** SerpApi
**AI Reasoning Layer:** Google Gemini Flash
**Core Principle:** **Let's discover where you should go.**

---

# 1. DOCUMENT PURPOSE

This Technical Requirements Document defines the technical architecture, system requirements, data flow, APIs, intelligence layers, data models, security requirements, and implementation constraints required to build the OFFBEAT platform.

The TRD translates the OFFBEAT Product Requirements Document into an implementable technical system.

The system must support:

* Destination discovery
* Interactive geographic exploration
* Travel Taste
* Experience Taste
* Time-aware discovery
* Crowd-aware discovery
* Community-generated travel intelligence
* Community verification
* Confidence scoring
* AI-powered recommendations
* Context-aware alternatives
* Itinerary construction
* TAKE HOME discoveries
* User contributions

---

# 2. TECHNICAL VISION

OFFBEAT will operate as a multi-source intelligence platform.

The system combines:

```text
                    USER INPUT
                        │
                        ▼
              ┌───────────────────┐
              │ OFFBEAT FRONTEND  │
              └─────────┬─────────┘
                        │
                        ▼
              ┌───────────────────┐
              │ OFFBEAT BACKEND   │
              └─────────┬─────────┘
                        │
          ┌─────────────┼─────────────┐
          │             │             │
          ▼             ▼             ▼
     ┌─────────┐   ┌──────────┐   ┌──────────┐
     │ SerpApi │   │ Community│   │  Gemini  │
     │  Data   │   │   Data   │   │    AI    │
     └────┬────┘   └────┬─────┘   └────┬─────┘
          │              │              │
          └──────────────┼──────────────┘
                         ▼
              ┌────────────────────┐
              │ OFFBEAT INTELLIGENCE│
              │      ENGINE         │
              └──────────┬─────────┘
                         │
                         ▼
               RECOMMENDATIONS
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
      DISCOVERY       ITINERARY      TAKE HOME
```

---

# 3. SYSTEM ARCHITECTURE

## 3.1 High-Level Architecture

OFFBEAT will use a layered architecture.

```text
┌──────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                         │
│                                                          │
│ React + TypeScript + Vite + Tailwind CSS                 │
│ Zustand / Client State                                   │
│ Interactive Map                                          │
│ Discovery UI                                             │
│ Itinerary UI                                             │
└──────────────────────────┬───────────────────────────────┘
                           │ HTTPS / REST
                           ▼
┌──────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                     │
│                                                          │
│ Node.js + Express + TypeScript                           │
│                                                          │
│ Auth / User Service                                      │
│ Discovery Service                                        │
│ Community Service                                        │
│ Recommendation Service                                   │
│ Verification Service                                     │
│ Itinerary Service                                        │
│ TAKE HOME Service                                        │
│ AI Orchestration Service                                 │
└───────────────┬──────────────────────┬───────────────────┘
                │                      │
                ▼                      ▼
┌────────────────────────┐   ┌─────────────────────────────┐
│      DATA LAYER        │   │      EXTERNAL SERVICES      │
│                        │   │                             │
│ PostgreSQL             │   │ SerpApi                    │
│ Prisma ORM             │   │ Gemini API                 │
│ Community Data         │   │                             │
│ Recommendation Data    │   │                             │
│ Verification Data      │   │                             │
└────────────────────────┘   └─────────────────────────────┘
```

---

# 4. RECOMMENDED TECHNOLOGY STACK

## 4.1 Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Zustand
* React Router
* Map rendering library
* REST API client
* Form validation library

## 4.2 Backend

* Node.js
* Express.js
* TypeScript
* Zod
* Prisma
* PostgreSQL
* JWT authentication if authentication is enabled
* Structured logging
* Request ID middleware
* Centralized error handling

## 4.3 External Intelligence

### SerpApi

Used for external search and place/travel information.

### Gemini

Used for reasoning, classification, recommendation synthesis, itinerary logic, and contextual interpretation.

## 4.4 Infrastructure

Target deployment architecture:

```text
Frontend → Vercel / Equivalent
Backend  → Render / Railway / Fly.io / Equivalent
Database → PostgreSQL provider
```

Exact deployment provider is implementation-dependent.

---

# 5. SERPAPI INTEGRATION

SerpApi is the external search/data layer for OFFBEAT.

SerpApi currently provides Google Maps search capabilities through:

`engine=google_maps`

and exposes structured fields including place title, reviews, ratings, opening state, hours, address, descriptions, GPS coordinates, links, and related place information.

SerpApi also provides Google Maps Reviews through:

`engine=google_maps_reviews`

which can retrieve reviews associated with a place using identifiers such as `data_id` or `place_id`.

Google Local results are available through:

`engine=google_local`

and can return structured local-place information such as ratings, reviews, hours, addresses, descriptions, GPS coordinates, and place IDs.

---

# 6. SERPAPI RESPONSIBILITIES

SerpApi should provide external factual/contextual signals such as:

* Places
* Attractions
* Restaurants
* Local businesses
* Reviews
* Ratings
* Opening hours
* Addresses
* GPS coordinates
* Place categories
* Descriptions
* Related places
* Similar places
* Local search results
* Search results
* Relevant destination information

SerpApi is an **information source**, not the recommendation engine.

---

# 7. SERPAPI DATA FLOW

```text
USER REQUEST
     ↓
OFFBEAT BACKEND
     ↓
QUERY BUILDER
     ↓
SERPAPI
     ↓
RAW RESPONSE
     ↓
NORMALIZATION
     ↓
OFFBEAT PLACE MODEL
     ↓
INTELLIGENCE ENGINE
```

The backend must normalize external data before exposing it to the frontend.

The frontend must never depend directly on SerpApi response structures.

---

# 8. SERPAPI QUERY BUILDER

The backend should construct queries based on:

* Country
* State / Region
* City
* Travel Taste
* Experience Taste
* Day / Night
* Place type
* User intent
* Optional geographic coordinates

Example:

```text
Country: India
Region: West Bengal
Taste: Mountains
Experience: Photography
Time: Morning
```

Possible search intent:

```text
mountain photography places West Bengal
```

The final query should be generated by the backend rather than allowing unrestricted frontend query construction.

---

# 9. SERPAPI CACHING

External API requests should be cached whenever practical.

Caching objectives:

* Reduce API consumption
* Reduce response latency
* Improve reliability
* Avoid repeated identical requests
* Reduce unnecessary duplicate searches

Potential cache key:

```text
country:
region:
taste:
experience:
time:
query:
coordinates:
```

Cache expiration should depend on the volatility of the information.

For example:

| Data                  | Suggested Cache Behavior |
| --------------------- | ------------------------ |
| Place metadata        | Long                     |
| GPS coordinates       | Long                     |
| Place categories      | Long                     |
| Reviews               | Medium                   |
| Opening hours         | Short/Medium             |
| Current open state    | Very short               |
| Search results        | Medium                   |
| Community information | Database-controlled      |

---

# 10. GEMINI INTEGRATION

The original product vision specified "Gemini Flash 3.6+".

Current Google documentation lists **Gemini 3.6 Flash**, **Gemini 3.7 Flash**, and **Gemini 3.8 Flash** as stable Gemini 3 Flash models. The current stable endpoint for Gemini 3.8 Flash is:

`gemini-3.8-flash`

Google describes Gemini 3.8 Flash as its most intelligent Flash model and supports structured outputs, function calling, search grounding, URL context, and other capabilities.

### OFFBEAT default target

```text
gemini-3.8-flash
```

The model identifier must remain configurable through environment variables rather than hard-coded throughout the application.

Example:

```text
GEMINI_MODEL=gemini-3.8-flash
```

This allows the model to be changed without modifying business logic.

---

# 11. GEMINI RESPONSIBILITIES

Gemini is responsible for reasoning over structured OFFBEAT information.

Potential responsibilities include:

### Intent Understanding

Interpret:

* Travel Taste
* Experience Taste
* Day/Night
* Destination intent
* User constraints

### Recommendation Synthesis

Combine:

* SerpApi data
* Community data
* Confidence signals
* User preferences

### Alternative Generation

Determine what "alternative" means for the selected place.

### Itinerary Reasoning

Determine:

* Ordering
* Timing
* Grouping
* Compatibility
* Experience flow

### Community Interpretation

Interpret:

* Repeated observations
* Contradictions
* Timing recommendations
* Place relevance

### TAKE HOME

Identify potentially meaningful local products, experiences, and specialties.

---

# 12. AI SAFETY / TRUST PRINCIPLE

Gemini must not be treated as an authoritative database.

The system must distinguish:

```text
FACTUAL EXTERNAL DATA
        vs
COMMUNITY OBSERVATION
        vs
AI-GENERATED INTERPRETATION
```

AI-generated claims should be grounded in structured inputs available to the system.

The application should avoid presenting an AI inference as an independently verified fact.

---

# 13. AI ORCHESTRATION LAYER

Gemini should not be called directly from the frontend.

Correct:

```text
Frontend
   ↓
Backend
   ↓
AI Orchestrator
   ↓
Gemini
```

Incorrect:

```text
Frontend
   ↓
Gemini API
```

The AI orchestration layer should:

1. Validate input.
2. Gather required data.
3. Normalize context.
4. Construct the AI request.
5. Call Gemini.
6. Validate structured output.
7. Apply business rules.
8. Store relevant result if required.
9. Return normalized data.

---

# 14. STRUCTURED AI OUTPUT

Gemini responses should be requested in structured formats wherever possible.

Example conceptual response:

```json
{
  "recommendations": [
    {
      "placeId": "place_123",
      "reason": "Matches mountain + photography preferences",
      "confidence": 0.84,
      "bestVisitWindow": {
        "start": "04:30",
        "end": "06:30"
      }
    }
  ]
}
```

The backend must validate AI output before returning it to the frontend.

---

# 15. RECOMMENDATION ENGINE

The OFFBEAT recommendation engine combines multiple signals.

Conceptual model:

```text
USER PREFERENCES
       +
PLACE DATA
       +
OPENING HOURS
       +
COMMUNITY SIGNALS
       +
CONFIDENCE
       +
CROWD SIGNALS
       +
GEOGRAPHIC CONTEXT
       +
AI REASONING
       ↓
OFFBEAT RECOMMENDATION
```

---

# 16. RECOMMENDATION SIGNALS

Potential signals include:

## User Signals

* Travel Taste
* Experience Taste
* Day/Night
* Selected region
* Selected duration
* Saved places
* Itinerary context

## Place Signals

* Category
* Rating
* Reviews
* Location
* Opening hours
* Place type
* Description

## Community Signals

* Number of submissions
* Number of supporting users
* Repeated observations
* User endorsements
* Photos
* Timing observations

## Context Signals

* Distance
* Opening availability
* Destination relevance
* Crowd-related information
* Similarity to selected experience

---

# 17. RECOMMENDATION PIPELINE

```text
USER PREFERENCES
       ↓
QUERY GENERATION
       ↓
SERPAPI SEARCH
       ↓
PLACE NORMALIZATION
       ↓
COMMUNITY RETRIEVAL
       ↓
SIGNAL AGGREGATION
       ↓
CONFIDENCE CALCULATION
       ↓
GEMINI REASONING
       ↓
BUSINESS RULE VALIDATION
       ↓
RANKED RECOMMENDATIONS
       ↓
FRONTEND
```

---

# 18. TRAVEL TASTE ENGINE

Travel Taste must be represented as structured data.

Example:

```json
{
  "taste": [
    "historical",
    "mountains",
    "photography"
  ],
  "experience": [
    "sunrise",
    "peaceful",
    "less_crowded"
  ]
}
```

Categories must be represented using stable internal identifiers.

Example:

```text
historical
beaches
mountains
nature
food
photography
spiritual
culture
adventure
local_life
sunrise_sunset
nightlife
```

The frontend label may change without changing the underlying identifier.

---

# 19. TIME INTELLIGENCE ENGINE

Time recommendations should prioritize factual operating information.

### Priority order

```text
OPENING / OPERATING INFORMATION
          ↓
AVAILABLE TIME WINDOW
          ↓
USER DAY/NIGHT PREFERENCE
          ↓
COMMUNITY TIMING SIGNALS
          ↓
EXPERIENCE CONTEXT
          ↓
AI INTERPRETATION
```

The system must distinguish:

### Verified / external

> "Open from 5:00 AM."

from:

### Community

> "Arrive at 4:30 AM for a better sunrise experience."

---

# 20. CROWD-AWARE ENGINE

Crowd intelligence should operate at:

### Destination level

```text
Destination → crowd context
```

### Place level

```text
Place → crowd context
```

### Time level

```text
Place + Time → crowd context
```

The system should not fabricate crowd measurements.

If direct crowd data is unavailable, the UI should clearly distinguish:

* External crowd information
* Community observations
* AI inference

---

# 21. COMMUNITY DATA MODEL

Community contributions should be modeled independently from external place data.

A community submission should contain conceptually:

```text
Submission
├── Author
├── Place / Destination
├── Type
├── Content
├── Media
├── Timestamp
├── Evidence
├── Verification State
├── Confidence
└── Moderation State
```

---

# 22. COMMUNITY SUBMISSION TYPES

Supported submission types may include:

```text
HIDDEN_PLACE
LOCAL_BUSINESS
TIMING_TIP
PHOTO_SPOT
TRAVEL_TIP
REVIEW
LOCAL_SPECIALTY
EXPERIENCE
CROWD_TIP
ROUTE_TIP
OTHER
```

The type system must remain extensible.

---

# 23. COMMUNITY VERIFICATION ENGINE

Conceptual flow:

```text
SUBMISSION
    ↓
VALIDATION
    ↓
MODERATION
    ↓
SIGNAL COLLECTION
    ↓
EVIDENCE ANALYSIS
    ↓
CONFIDENCE CALCULATION
    ↓
STATUS UPDATE
```

Possible states:

```text
PENDING
SUPPORTED
VERIFIED
FLAGGED
REJECTED
```

---

# 24. CONFIDENCE ENGINE

Confidence should be derived from multiple signals.

Conceptual factors:

```text
Community Agreement
        +
Evidence Quality
        +
External Corroboration
        +
Submission History
        +
Consistency
        -
Contradictions
        -
Flags
        ↓
CONFIDENCE
```

The exact scoring formula must be defined during implementation and validated through testing.

The system must not present a confidence number as an objective probability of truth.

---

# 25. CONFLICT RESOLUTION

When community submissions disagree:

```text
SUBMISSION A
      +
SUBMISSION B
      +
SUBMISSION C
      ↓
CONFLICT DETECTION
      ↓
PATTERN ANALYSIS
      ↓
GEMINI INTERPRETATION
      ↓
CONTEXTUAL RESPONSE
```

The system may produce:

```text
Consensus
```

or:

```text
Mixed Community Opinion
```

rather than forcing an artificial single answer.

---

# 26. FIND AN ALTERNATIVE ENGINE

Find an Alternative must be context-aware.

The system first determines:

### Is this place replaceable?

If yes:

```text
Original Place
      ↓
Experience Similarity
      +
Travel Taste
      +
Crowd Context
      +
Distance
      +
Time
      ↓
Alternative Place
```

If no:

```text
Must-Visit Place
      ↓
Alternative Experience
      +
Nearby Discovery
      +
Hidden Spot
      +
Better Timing
      +
Complementary Place
```

Example:

```text
TAJ MAHAL
   ↓
NOT:
"Replace Taj Mahal"

INSTEAD:
"Enhance the Taj Mahal experience"
```

This logic must be represented explicitly in the recommendation engine.

---

# 27. ITINERARY ENGINE

The itinerary engine receives:

```text
Selected Places
+
Opening Hours
+
Travel Time
+
Geographic Distance
+
User Preferences
+
Community Timing
+
Alternative Suggestions
```

and produces:

```text
DAY 1
 ├── Place A
 ├── Place B
 └── Local Experience

DAY 2
 ├── Place C
 ├── Place D
 └── TAKE HOME
```

The itinerary engine must prevent obvious conflicts such as:

* Closed places
* Impossible travel times
* Overlapping time windows
* Duplicate places
* Invalid sequencing

---

# 28. TAKE HOME ENGINE

The TAKE HOME system receives:

```text
Destination
+
Local Businesses
+
Local Specialties
+
Community Contributions
+
Travel Taste
```

and produces:

```text
Thing / Experience
+
Why it matters
+
Where to find it
+
Relevant context
```

Example:

```text
Destination:
Kolkata

TAKE HOME:
Traditional Bengali Sweet

WHERE:
Recommended local shop

WHY:
Regional specialty
```

The system may include both physical products and experiences.

---

# 29. DATABASE

Primary database:

**PostgreSQL**

ORM:

**Prisma**

---

# 30. CORE DATABASE ENTITIES

The initial conceptual schema includes:

```text
User
Profile
Destination
Region
Place
PlaceCategory
TravelTaste
ExperienceTaste
CommunitySubmission
SubmissionEvidence
SubmissionSupport
VerificationRecord
ConfidenceRecord
Itinerary
ItineraryItem
TakeHomeItem
SavedPlace
SearchCache
Recommendation
```

Additional entities may be introduced during implementation.

---

# 31. USER MODEL

Conceptual fields:

```text
User
├── id
├── email
├── name
├── avatar
├── createdAt
└── updatedAt
```

If authentication is not required for the MVP, the user model may initially support anonymous sessions while preserving a future path to full accounts.

---

# 32. PLACE MODEL

Conceptual structure:

```text
Place
├── id
├── externalId
├── source
├── name
├── description
├── category
├── address
├── latitude
├── longitude
├── rating
├── reviewCount
├── openingHours
├── metadata
├── createdAt
└── updatedAt
```

`externalId` and `source` are required to prevent confusion between external and internal place records.

---

# 33. COMMUNITY SUBMISSION MODEL

Conceptual structure:

```text
CommunitySubmission
├── id
├── userId
├── placeId
├── type
├── title
├── content
├── media
├── status
├── confidence
├── createdAt
└── updatedAt
```

---

# 34. ITINERARY MODEL

Conceptual structure:

```text
Itinerary
├── id
├── userId / sessionId
├── title
├── destination
├── startDate
├── endDate
├── createdAt
└── updatedAt
```

### ItineraryItem

```text
ItineraryItem
├── id
├── itineraryId
├── placeId
├── day
├── startTime
├── endTime
├── order
└── notes
```

---

# 35. API ARCHITECTURE

The backend should expose REST APIs.

Conceptual structure:

```text
/api/v1
```

---

# 36. DISCOVERY ENDPOINTS

```http
GET /api/v1/destinations
GET /api/v1/regions
GET /api/v1/places
GET /api/v1/discover
GET /api/v1/recommendations
```

Possible discovery request:

```http
GET /api/v1/discover?
country=IN&
region=WB&
taste=mountains&
experience=photography&
time=morning
```

The exact query structure will be finalized during API specification.

---

# 37. COMMUNITY ENDPOINTS

```http
POST /api/v1/community/submissions
GET  /api/v1/community/submissions
GET  /api/v1/community/submissions/:id
POST /api/v1/community/submissions/:id/support
POST /api/v1/community/submissions/:id/report
```

---

# 38. ITINERARY ENDPOINTS

```http
POST   /api/v1/itineraries
GET    /api/v1/itineraries/:id
PATCH  /api/v1/itineraries/:id
DELETE /api/v1/itineraries/:id

POST   /api/v1/itineraries/:id/items
PATCH  /api/v1/itineraries/:id/items/:itemId
DELETE /api/v1/itineraries/:id/items/:itemId
```

---

# 39. ALTERNATIVE ENDPOINT

```http
GET /api/v1/places/:placeId/alternatives
```

Request context may include:

```text
Travel Taste
Experience Taste
Time
Current itinerary
Crowd preference
Distance preference
```

The backend determines whether the response should represent:

* Replacement
* Complementary experience
* Nearby discovery
* Better timing
* Hidden spot

---

# 40. TAKE HOME ENDPOINT

```http
GET /api/v1/destinations/:destinationId/take-home
```

Possible response:

```json
{
  "items": [
    {
      "name": "Local Specialty",
      "type": "food",
      "description": "...",
      "whereToFind": "..."
    }
  ]
}
```

---

# 41. AI ENDPOINTS

AI functionality should be orchestrated internally.

Example internal services:

```text
POST /api/v1/ai/recommend
POST /api/v1/ai/alternative
POST /api/v1/ai/itinerary
POST /api/v1/ai/take-home
POST /api/v1/ai/analyze-submission
```

These endpoints should not expose the Gemini API directly to clients.

---

# 42. API VALIDATION

All incoming API requests must be validated.

Recommended:

**Zod**

Validation must occur for:

* Query parameters
* Request bodies
* Path parameters
* AI outputs
* Community submissions

Invalid requests should return structured errors.

---

# 43. ERROR RESPONSE STANDARD

All backend errors should follow a consistent structure.

Example:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid discovery parameters"
  },
  "requestId": "req_123"
}
```

---

# 44. REQUEST ID

Every request should receive a unique request ID.

Example:

```text
X-Request-ID
```

The ID should be propagated through:

```text
Frontend
 ↓
Backend
 ↓
SerpApi
 ↓
Gemini
```

where supported internally.

This improves debugging and observability.

---

# 45. SECURITY REQUIREMENTS

## API Keys

SerpApi and Gemini keys must never be exposed to the frontend.

Correct:

```text
Frontend
   ↓
Backend
   ↓
API Keys
```

Incorrect:

```text
Frontend
   ↓
SERPAPI KEY
```

---

# 46. ENVIRONMENT VARIABLES

Example:

```env
NODE_ENV=development

PORT=5000

DATABASE_URL=

SERPAPI_API_KEY=

GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.8-flash

JWT_SECRET=

CORS_ORIGIN=
```

Secrets must not be committed to Git.

---

# 47. RATE LIMITING

Rate limiting should exist at multiple layers.

### Public API

Limit repeated requests from the same client/IP.

### Community Submission

Apply stricter limits to prevent spam.

### AI

Prevent excessive Gemini requests.

### External APIs

Use caching and request deduplication to control SerpApi usage.

---

# 48. COMMUNITY ABUSE PREVENTION

The system should support:

* Submission rate limits
* Reporting
* Moderation state
* Duplicate detection
* Suspicious activity detection
* Evidence requirements
* Confidence decay where appropriate

Users should not be able to artificially inflate confidence through unlimited self-support actions.

---

# 49. DUPLICATE DETECTION

Community submissions should be checked for duplicates.

Possible matching signals:

```text
Place ID
+
Geographic proximity
+
Submission type
+
Semantic similarity
```

AI-assisted semantic similarity may be used where necessary.

---

# 50. DATA NORMALIZATION

External data must be normalized into internal OFFBEAT structures.

Example:

```text
SERPAPI
   ↓
Raw External Data
   ↓
Normalizer
   ↓
OFFBEAT Place
   ↓
Recommendation Engine
```

The frontend must never directly depend on raw SerpApi schemas.

---

# 51. EXTERNAL DATA VS INTERNAL DATA

The system must maintain a clear distinction.

### External Data

Originates from SerpApi or another external provider.

### Internal Data

Generated/stored by OFFBEAT:

* Community submissions
* Confidence records
* User preferences
* Itineraries
* Saved places
* Recommendation history

### AI Data

Generated through reasoning over available inputs.

This separation is critical for traceability.

---

# 52. FRONTEND STATE MANAGEMENT

Recommended global state:

```text
User State
Discovery State
Travel Taste
Experience Taste
Selected Country
Selected Region
Day/Night
Search Results
Recommendation Results
Community Data
Itinerary
TAKE HOME
UI State
```

Zustand may be used for global state.

Server data should not unnecessarily be duplicated into global state.

---

# 53. FRONTEND ROUTE STRUCTURE

Conceptual routes:

```text
/
├── /discover
├── /discover/:country
├── /discover/:country/:region
├── /place/:id
├── /alternative/:placeId
├── /itinerary
├── /itinerary/:id
├── /take-home/:destinationId
├── /community
├── /community/:id
└── /contribute
```

Exact routing may evolve with UX testing.

---

# 54. DISCOVERY UI FLOW

```text
LANDING PAGE
     ↓
COUNTRY
     ↓
INTERACTIVE MAP
     ↓
STATE / REGION
     ↓
TRAVEL TASTE
     ↓
EXPERIENCE TASTE
     ↓
DAY / NIGHT
     ↓
DISCOVERY RESULTS
```

The user should always understand:

**Where am I?**

**What am I selecting?**

**Why am I seeing these recommendations?**

---

# 55. RECOMMENDATION CARD

A recommendation card may contain:

```text
Place Name
Category
Location
Rating
Opening Status
Recommended Time
Community Signal
Confidence
Why OFFBEAT recommends it
Alternative
Save
Add to Itinerary
```

The card should distinguish factual information from AI/community interpretation.

---

# 56. COMMUNITY CARD

A community discovery card may contain:

```text
Contributor
Submission Type
Place
Observation
Media
Confidence
Verification Status
Date
Support
Report
```

Example:

```text
📸 HIDDEN PHOTO SPOT

Taj Mahal

"Walk around the eastern side after sunrise
for a quieter photography angle."

🟢 Community Verified
Confidence: High
```

---

# 57. OBSERVABILITY

The backend should record:

* Request ID
* Endpoint
* Response status
* Response time
* External API latency
* AI latency
* Errors
* Cache hit/miss
* Recommendation generation failures

Logs must not contain:

* API keys
* Passwords
* Sensitive tokens
* Private user content unnecessarily

---

# 58. PERFORMANCE REQUIREMENTS

Target experience:

### Frontend

* Fast initial load
* Lazy loading for heavy components
* Optimized map rendering
* Image optimization
* Minimal unnecessary re-renders

### Backend

* Cached external results
* Parallel external requests where safe
* Timeouts for external APIs
* AI request timeouts
* Database indexing

### AI

Avoid unnecessary Gemini calls.

For example:

```text
Same place
+
Same preferences
+
Same context
=
Reuse cached recommendation where appropriate
```

---

# 59. FAILURE HANDLING

External services can fail.

## SerpApi failure

Fallback:

```text
Cached Data
   ↓
Community Data
   ↓
Partial Discovery
```

## Gemini failure

Fallback:

```text
Structured SerpApi Results
+
Community Data
```

The application should remain usable even when the AI layer temporarily fails.

---

# 60. AI FAILURE PRINCIPLE

OFFBEAT must never become unusable simply because Gemini is unavailable.

Gemini enhances:

> **Understanding + reasoning**

It does not become the only source of application functionality.

---

# 61. DATA FRESHNESS

Different data types require different freshness policies.

| Data                  | Freshness                    |
| --------------------- | ---------------------------- |
| Place identity        | Low change                   |
| Coordinates           | Low change                   |
| Category              | Low change                   |
| Opening hours         | Medium                       |
| Open/closed state     | High                         |
| Reviews               | Medium                       |
| Community submissions | Database-controlled          |
| Confidence            | Recomputed as signals change |
| AI recommendations    | Context-dependent            |

---

# 62. SCALABILITY

The architecture should allow future expansion to:

* More countries
* More regions
* More travel categories
* More users
* More community contributions
* More external APIs
* Mobile applications
* Personalized profiles
* Social features
* Advanced recommendation models

The initial implementation should remain modular.

---

# 63. MODULAR BACKEND SERVICES

Recommended service boundaries:

```text
services/
├── discovery/
├── serpapi/
├── gemini/
├── recommendation/
├── community/
├── verification/
├── itinerary/
├── take-home/
├── places/
├── users/
└── cache/
```

This is a logical separation.

It does not require separate microservices for the MVP.

---

# 64. RECOMMENDED MVP ARCHITECTURE

For the hackathon, use a **modular monolith**.

```text
              EXPRESS BACKEND
                    │
     ┌──────────────┼──────────────┐
     │              │              │
 Discovery      Community      Itinerary
     │              │              │
     └──────────────┼──────────────┘
                    │
             Intelligence
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
       SerpApi              Gemini
                    │
                    ▼
               PostgreSQL
```

Do not introduce microservices unless scaling requirements justify them.

---

# 65. DEVELOPMENT PRINCIPLES

## Principle 1

**Backend owns business logic.**

## Principle 2

**Frontend owns presentation and interaction.**

## Principle 3

**External API schemas never leak directly into frontend components.**

## Principle 4

**AI outputs must be validated.**

## Principle 5

**Community claims and external facts remain distinguishable.**

## Principle 6

**Every recommendation should have explainable supporting context.**

## Principle 7

**The system should degrade gracefully when external services fail.**

---

# 66. TECHNICAL SUCCESS CRITERIA

The MVP is technically successful when the system can complete this flow:

```text
USER
 ↓
Select Country
 ↓
Explore Map
 ↓
Select Region
 ↓
Select Travel Taste
 ↓
Select Experience Taste
 ↓
Select Day/Night
 ↓
Backend builds discovery query
 ↓
SerpApi retrieves external data
 ↓
OFFBEAT retrieves community signals
 ↓
Confidence system evaluates evidence
 ↓
Gemini interprets the combined context
 ↓
Recommendation Engine generates results
 ↓
User explores place
 ↓
Find an Alternative
 ↓
Add to Itinerary
 ↓
TAKE HOME
 ↓
User contributes discovery
```

---

# 67. TECHNICAL NORTH STAR

The technical architecture must support one central principle:

> **OFFBEAT should be able to take structured external information, real traveler knowledge, and user preferences, reason over them, and turn them into understandable travel discoveries.**

The system is therefore not simply:

```text
Search API → Results
```

It is:

```text
USER INTENT
    +
EXTERNAL DATA
    +
COMMUNITY KNOWLEDGE
    +
EVIDENCE
    +
AI REASONING
    ↓
CONTEXTUAL TRAVEL DISCOVERY
```

---

# 68. CURRENT TECHNICAL DECISIONS

| Component             | Decision                       |
| --------------------- | ------------------------------ |
| Frontend              | React + TypeScript + Vite      |
| Styling               | Tailwind CSS                   |
| State                 | Zustand                        |
| Backend               | Node.js + Express + TypeScript |
| Validation            | Zod                            |
| Database              | PostgreSQL                     |
| ORM                   | Prisma                         |
| External Search       | SerpApi                        |
| AI                    | Gemini Flash                   |
| Current Gemini Target | `gemini-3.8-flash`             |
| API Style             | REST                           |
| Architecture          | Modular Monolith               |
| Community Data        | Internal PostgreSQL            |
| External API Keys     | Backend only                   |
| AI Calls              | Backend only                   |
| Caching               | Required                       |
| Rate Limiting         | Required                       |
| Request IDs           | Required                       |
| Structured AI Output  | Required                       |

---

# 69. OPEN TECHNICAL DECISIONS

The following must be finalized before implementation:

1. Exact SerpApi APIs required by the hackathon.
2. Exact SerpApi request quotas and usage strategy.
3. Exact Gemini API SDK.
4. Gemini thinking configuration.
5. Map rendering provider/library.
6. Authentication requirements for MVP.
7. Image/media storage.
8. Community moderation implementation.
9. Confidence scoring formula.
10. Recommendation ranking formula.
11. Cache technology.
12. Deployment providers.
13. Exact database schema.
14. Exact API contracts.
15. Exact frontend folder architecture.

---

# 70. NEXT TECHNICAL DOCUMENTS

The TRD should be followed by:

### 1. API Specification

Detailed:

* Endpoint contracts
* Request schemas
* Response schemas
* Error codes
* Authentication
* Pagination
* Rate limits

### 2. Database Design Document

Detailed:

* ER diagram
* Prisma schema
* Relationships
* Indexes
* Constraints
* Enums
* Seed data

### 3. AI / Intelligence Specification

Detailed:

* Gemini prompts
* Structured outputs
* Recommendation pipeline
* Confidence engine
* Alternative engine
* Itinerary reasoning

### 4. SerpApi Integration Specification

Detailed mapping of the **specific SerpApi APIs allowed/required by the hackathon** to each OFFBEAT feature.

### 5. Frontend Architecture Document

Detailed:

* Folder structure
* Components
* Hooks
* Stores
* Routes
* API clients
* State boundaries

### 6. UI/UX Specification

Detailed:

* Screen-by-screen behavior
* Interaction states
* Empty states
* Loading states
* Error states
* Responsive behavior
* Design system

---

# 71. FINAL TECHNICAL STATEMENT

OFFBEAT will be implemented as a modular, API-driven travel discovery platform in which:

**SerpApi provides external travel/place intelligence.**

**The OFFBEAT community provides first-hand travel intelligence.**

**Gemini provides reasoning and contextual interpretation.**

**The OFFBEAT backend orchestrates these sources.**

**The recommendation engine converts them into personalized discoveries.**

**The frontend turns those discoveries into an exploratory travel experience.**

The system's ultimate technical objective is:

> **Transform fragmented travel data and human travel knowledge into contextual, evidence-aware, personalized discovery.**
