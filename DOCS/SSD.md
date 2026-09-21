# OFFBEAT — SYSTEM SPECIFICATION DOCUMENT

**Version:** 1.0
**Status:** Baseline System Specification
**Product:** OFFBEAT
**System Type:** Community-Powered Travel Discovery Platform
**Primary External Data Provider:** SerpApi
**AI Reasoning Layer:** Google Gemini Flash
**Architecture:** Modular Monolith
**Database:** PostgreSQL
**Backend:** Node.js + Express + TypeScript
**Frontend:** React + TypeScript + Vite

---

# 1. SYSTEM OVERVIEW

OFFBEAT is a travel discovery system that combines:

* User preferences
* Travel Taste
* Experience Taste
* Geographic discovery
* External travel/place data
* Community-generated travel intelligence
* Confidence and verification signals
* AI reasoning
* Context-aware recommendations
* Itinerary construction
* TAKE HOME discoveries

The system is designed around the principle:

> **"Let's discover where you should go."**

OFFBEAT does not require the user to know their destination before beginning the discovery process.

The system can start from:

```text
COUNTRY
   ↓
REGION
   ↓
TRAVEL TASTE
   ↓
EXPERIENCE TASTE
   ↓
DAY / NIGHT
   ↓
DISCOVERY
```

---

# 2. SYSTEM OBJECTIVES

The system must:

1. Allow users to discover destinations geographically.
2. Allow users to discover places based on Travel Taste.
3. Allow Experience Taste refinement.
4. Support Day/Night-based discovery.
5. Retrieve external place and travel information.
6. Retrieve and process community knowledge.
7. Evaluate community confidence.
8. Generate personalized recommendations.
9. Support crowd-aware discovery.
10. Support time-aware recommendations.
11. Provide context-aware alternatives.
12. Build travel itineraries.
13. Provide TAKE HOME discoveries.
14. Allow users to contribute travel information.
15. Preserve distinction between facts, community observations, and AI-generated reasoning.

---

# 3. SYSTEM ACTORS

## 3.1 Traveler

The primary system actor.

Can:

* Discover destinations
* Select Travel Taste
* Select Experience Taste
* Explore places
* View recommendations
* View community information
* View confidence
* Find alternatives
* Build itineraries
* View TAKE HOME
* Submit discoveries

---

## 3.2 Contributor

A traveler who contributes information to the community.

Can submit:

* Hidden places
* Timing tips
* Photography spots
* Local businesses
* Reviews
* Local specialties
* Experiences
* Crowd tips
* Travel tips

A contributor may also support or report community submissions.

---

## 3.3 System Administrator

Responsible for platform management.

Can:

* Moderate submissions
* Review reported content
* Manage categories
* Manage verification
* Manage system configuration
* Review system activity

---

## 3.4 SerpApi

External data provider.

Provides:

* Places
* Local businesses
* Reviews
* Ratings
* Opening information
* Geographic information
* Search results
* Related place information

---

## 3.5 Gemini

AI reasoning actor/service.

Responsible for:

* Intent interpretation
* Recommendation synthesis
* Community interpretation
* Alternative generation
* Itinerary reasoning
* TAKE HOME reasoning

---

# 4. SYSTEM BOUNDARIES

## Inside OFFBEAT

```text
User Interface
Backend API
Recommendation Engine
Community System
Verification System
Confidence Engine
Itinerary Engine
TAKE HOME Engine
AI Orchestration
Database
Caching
Authentication
Moderation
```

## Outside OFFBEAT

```text
SerpApi
Gemini API
Map Provider
External Place Data
External Review Data
External Hosting Infrastructure
```

OFFBEAT must communicate with external systems through controlled backend integrations.

---

# 5. HIGH-LEVEL SYSTEM ARCHITECTURE

```text
┌──────────────────────────────────────────────────────────┐
│                     OFFBEAT CLIENT                       │
│                                                          │
│ React + TypeScript + Vite + Tailwind + Zustand           │
│                                                          │
│ Discovery │ Map │ Places │ Community │ Itinerary         │
└─────────────────────────┬────────────────────────────────┘
                          │ HTTPS / REST
                          ▼
┌──────────────────────────────────────────────────────────┐
│                   OFFBEAT BACKEND                        │
│                                                          │
│ Express + Node.js + TypeScript                           │
│                                                          │
│ ┌────────────┐ ┌────────────┐ ┌──────────────────────┐  │
│ │ Discovery  │ │ Community  │ │ Recommendation       │  │
│ │ Service    │ │ Service    │ │ Engine               │  │
│ └────────────┘ └────────────┘ └──────────────────────┘  │
│                                                          │
│ ┌────────────┐ ┌────────────┐ ┌──────────────────────┐  │
│ │ Verification│ │ Itinerary │ │ TAKE HOME            │  │
│ │ Engine     │ │ Engine     │ │ Engine               │  │
│ └────────────┘ └────────────┘ └──────────────────────┘  │
│                                                          │
│ ┌─────────────────────┐ ┌─────────────────────────────┐ │
│ │ AI Orchestration    │ │ External Data Integration  │ │
│ └─────────────────────┘ └─────────────────────────────┘ │
└───────────────┬──────────────────────┬───────────────────┘
                │                      │
                ▼                      ▼
       ┌────────────────┐     ┌───────────────────┐
       │   PostgreSQL   │     │ External Services │
       │                │     │                   │
       │ Prisma ORM     │     │ SerpApi           │
       │                │     │ Gemini             │
       └────────────────┘     │ Map Provider       │
                              └───────────────────┘
```

---

# 6. CORE SYSTEM MODULES

OFFBEAT consists of the following logical modules:

```text
01. User Module
02. Discovery Module
03. Geographic Exploration Module
04. Travel Taste Module
05. Experience Taste Module
06. Place Module
07. External Data Module
08. Community Module
09. Verification Module
10. Confidence Module
11. Recommendation Module
12. Crowd Intelligence Module
13. Time Intelligence Module
14. Alternative Module
15. Itinerary Module
16. TAKE HOME Module
17. AI Orchestration Module
18. Moderation Module
19. Cache Module
20. Analytics / Observability Module
```

---

# 7. DISCOVERY SYSTEM

The Discovery System is the primary entry point into OFFBEAT.

## Input

```text
Country
Region
Travel Taste
Experience Taste
Day / Night
Optional Preferences
```

## Processing

```text
User Input
   ↓
Input Validation
   ↓
Discovery Context
   ↓
Query Construction
   ↓
External Data Retrieval
   ↓
Community Retrieval
   ↓
Signal Aggregation
   ↓
AI Reasoning
   ↓
Recommendation Ranking
```

## Output

```text
Discovery Results
```

---

# 8. GEOGRAPHIC DISCOVERY

The geographic discovery system follows:

```text
COUNTRY
   ↓
INTERACTIVE MAP
   ↓
STATE / REGION
   ↓
DESTINATION DISCOVERY
```

The map is an exploratory interface.

The system must allow users to visually identify regions before selecting one.

---

# 9. COUNTRY SELECTION

## Input

User selects a country.

## System Action

The system loads supported regions/states.

## Output

```text
Country
+
Available Regions
+
Interactive Map
```

The system should not require a complete external API request simply to render basic geographic boundaries if these can be provided through static geographic data.

---

# 10. REGION SELECTION

When a region is selected:

```text
Region
   ↓
Region Context
   ↓
Available Travel Tastes
   ↓
Available Experiences
```

The system may also display:

* Featured destinations
* Popular places
* Community discoveries
* Regional highlights

---

# 11. TRAVEL TASTE SYSTEM

Travel Taste represents the user's broad discovery preference.

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

The system should support multiple selections.

Example:

```text
[
  "mountains",
  "photography",
  "nature"
]
```

---

# 12. EXPERIENCE TASTE SYSTEM

Experience Taste provides more granular preferences.

Example:

```text
Mountains
 ├── Sunrise
 ├── Photography
 ├── Peaceful
 ├── Adventure
 ├── Nature
 ├── Local Culture
 └── Less Crowded
```

Experience Taste is context-dependent.

Different Travel Taste categories may expose different Experience Taste options.

---

# 13. DAY / NIGHT SYSTEM

The user may select:

```text
DAY
NIGHT
```

This selection modifies discovery context.

The system should consider:

* Opening hours
* Operating hours
* Experience availability
* Community recommendations
* Night/day-specific experiences

Day/Night must not be treated as a generic quality ranking.

---

# 14. DISCOVERY CONTEXT

The backend should construct a normalized discovery context.

Example:

```json
{
  "country": "India",
  "region": "West Bengal",
  "travelTaste": [
    "mountains"
  ],
  "experienceTaste": [
    "photography",
    "sunrise",
    "less_crowded"
  ],
  "timeContext": "day"
}
```

This object becomes the primary input to the recommendation pipeline.

---

# 15. EXTERNAL DATA RETRIEVAL

The External Data Module communicates with SerpApi.

Flow:

```text
Discovery Context
       ↓
Query Builder
       ↓
SerpApi Adapter
       ↓
SerpApi
       ↓
Raw Response
       ↓
Normalizer
       ↓
Internal Place Objects
```

The SerpApi adapter isolates external API-specific implementation from the rest of the system.

---

# 16. SERPAPI ADAPTER

The adapter should provide internal methods such as:

```text
searchPlaces()
searchLocalPlaces()
getPlaceDetails()
getPlaceReviews()
searchDestination()
```

The exact methods depend on the final list of SerpApi APIs selected for the hackathon.

The rest of OFFBEAT should not know the exact HTTP request structure used by SerpApi.

---

# 17. PLACE NORMALIZATION

External place information must be normalized.

Conceptual object:

```json
{
  "id": "internal_place_id",
  "externalId": "serpapi_place_id",
  "source": "serpapi",
  "name": "Victoria Memorial",
  "category": "historical",
  "location": {
    "latitude": 22.5448,
    "longitude": 88.3426
  },
  "rating": 4.6,
  "reviewCount": 10000,
  "openingHours": [],
  "address": "...",
  "description": "..."
}
```

---

# 18. COMMUNITY RETRIEVAL

The Community Module retrieves relevant internal submissions.

Query context may include:

```text
Place
Region
Travel Taste
Experience Taste
Submission Type
Time
```

Example:

```text
Place: Tiger Hill
Type: TIMING_TIP
Context: Sunrise
```

---

# 19. COMMUNITY SIGNAL AGGREGATION

The system aggregates:

```text
Submission Count
Supporting Users
Repeated Observations
Media Evidence
External Corroboration
Reports
Contradictions
Historical Reliability
```

These signals are passed to the Confidence Engine.

---

# 20. CONFIDENCE SYSTEM

The Confidence Engine determines the current evidence state of community information.

Conceptual processing:

```text
Community Submission
       ↓
Evidence Retrieval
       ↓
Signal Aggregation
       ↓
Conflict Detection
       ↓
Confidence Calculation
       ↓
Verification State
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

# 21. CONFIDENCE CALCULATION

The system may consider:

```text
Positive Signals
────────────────────────
Community Agreement
Evidence Quality
External Corroboration
Repeated Reports
Contributor Reliability

Negative Signals
────────────────────────
Contradictions
Reports
Duplicate / Spam Patterns
Low Evidence
```

A precise mathematical formula will be finalized during implementation and testing.

---

# 22. COMMUNITY CONFLICT SYSTEM

When contradictory submissions exist:

```text
Submission A
Submission B
Submission C
       ↓
Conflict Detector
       ↓
Pattern Analysis
       ↓
Contextual Interpretation
```

Possible output:

```text
Consensus
```

or:

```text
Mixed Community Opinion
```

The system must avoid inventing consensus where evidence is insufficient.

---

# 23. TIME INTELLIGENCE SYSTEM

Time Intelligence determines suitable visiting windows.

Primary information hierarchy:

```text
Opening / Operating Information
          ↓
Available Window
          ↓
Day / Night Context
          ↓
Community Timing
          ↓
Experience Context
          ↓
AI Interpretation
```

---

# 24. TIME RECOMMENDATION EXAMPLE

Input:

```text
Place:
Tiger Hill

Experience:
Sunrise

User Context:
Day

Community:
Multiple users recommend arriving at approximately 04:30 AM.
```

System output:

```text
Recommended Arrival:
04:30 AM

Reason:
Supports sunrise experience and aligns with community observations.
```

The system must distinguish:

```text
OPENING TIME
```

from:

```text
COMMUNITY RECOMMENDED ARRIVAL TIME
```

---

# 25. CROWD INTELLIGENCE SYSTEM

Crowd intelligence operates at three levels.

## Destination

```text
Destination
→ Crowd Context
```

## Place

```text
Place
→ Crowd Context
```

## Time

```text
Place + Time
→ Crowd Context
```

The system must not fabricate numerical crowd levels without supporting data.

Where only community observations exist, they must be labeled accordingly.

---

# 26. RECOMMENDATION ENGINE

The Recommendation Engine is the central intelligence component.

Inputs:

```text
User Context
+
External Places
+
Community Data
+
Confidence
+
Time
+
Crowd Signals
+
Geographic Context
```

Output:

```text
Ranked Recommendations
```

---

# 27. RECOMMENDATION PIPELINE

```text
             USER CONTEXT
                  ↓
           QUERY GENERATION
                  ↓
              SERPAPI
                  ↓
          PLACE NORMALIZATION
                  ↓
         COMMUNITY RETRIEVAL
                  ↓
          SIGNAL AGGREGATION
                  ↓
        CONFIDENCE EVALUATION
                  ↓
          GEMINI REASONING
                  ↓
        BUSINESS RULE CHECK
                  ↓
          RANKED RESULTS
```

---

# 28. RECOMMENDATION EXPLANATION

Each recommendation should have an explanation.

Example:

```text
Darjeeling

Why OFFBEAT recommends this:
Matches your mountain + photography preferences
and has community-supported sunrise experiences.
```

The explanation should distinguish:

* External facts
* Community observations
* AI interpretation

---

# 29. GEMINI ORCHESTRATION

Gemini is accessed only through the backend.

```text
Frontend
   ↓
Backend
   ↓
AI Orchestrator
   ↓
Context Builder
   ↓
Gemini
   ↓
Structured Output
   ↓
Output Validator
   ↓
Recommendation Engine
```

---

# 30. AI CONTEXT BUILDER

The Context Builder creates a structured AI input containing:

```text
User Preferences
Place Data
Opening Information
Community Data
Confidence
Crowd Signals
Geographic Context
Itinerary Context
```

The AI should not be given unnecessary raw data.

Only relevant information should be included.

---

# 31. AI OUTPUT VALIDATION

Gemini responses must be validated before being used.

Validation must check:

* Required fields
* Data types
* Place identifiers
* Time formats
* Recommendation structure
* Unsupported claims
* Invalid references

Invalid AI output must not directly reach the frontend.

---

# 32. FIND AN ALTERNATIVE SYSTEM

The Alternative Engine determines the meaning of "alternative."

## Case A — Replaceable Place

```text
Original Place
      ↓
Similarity Analysis
      ↓
Travel Taste
      ↓
Crowd Context
      ↓
Distance
      ↓
Time
      ↓
Alternative Place
```

## Case B — Must-Visit Place

```text
Must-Visit Place
      ↓
Experience Enhancement
      ↓
Nearby Discovery
      ↓
Hidden Spot
      ↓
Better Timing
      ↓
Complementary Experience
```

---

# 33. ALTERNATIVE ENGINE RULE

The system must not automatically assume:

```text
Alternative = Replacement
```

Instead:

```text
Alternative
=
Replacement
OR
Enhancement
OR
Complementary Experience
OR
Nearby Discovery
OR
Timing Alternative
```

---

# 34. ITINERARY SYSTEM

The Itinerary Engine converts selected discoveries into an ordered travel plan.

Inputs:

```text
Places
Opening Hours
Recommended Times
Distance
Travel Time
User Preferences
Community Timing
Trip Duration
```

Output:

```text
Ordered Itinerary
```

---

# 35. ITINERARY VALIDATION

Before saving an itinerary, the system should check:

* Place availability
* Opening hours
* Time conflicts
* Duplicate locations
* Impossible travel transitions
* Invalid dates
* Invalid time windows

---

# 36. TAKE HOME SYSTEM

The TAKE HOME Engine identifies meaningful destination-specific discoveries.

Input:

```text
Destination
+
Local Data
+
Community Data
+
User Taste
```

Output:

```text
Thing / Experience
+
Description
+
Why it matters
+
Where to find it
```

Possible categories:

```text
Food
Handicraft
Clothing
Art
Local Product
Regional Specialty
Cultural Item
Workshop
Experience
Other
```

---

# 37. COMMUNITY CONTRIBUTION SYSTEM

Users can create submissions.

Flow:

```text
USER
 ↓
CREATE SUBMISSION
 ↓
VALIDATE
 ↓
MODERATION
 ↓
STORE
 ↓
SIGNAL COLLECTION
 ↓
CONFIDENCE
 ↓
COMMUNITY DISCOVERY
```

---

# 38. SUBMISSION VALIDATION

The system should validate:

* Submission type
* Title
* Description
* Place association
* Location if required
* Media format
* Content length
* Required fields

The system should reject malformed submissions before database storage.

---

# 39. MODERATION SYSTEM

Community submissions may enter:

```text
PENDING
```

before becoming:

```text
SUPPORTED
```

or:

```text
VERIFIED
```

Content may become:

```text
FLAGGED
```

or:

```text
REJECTED
```

based on moderation rules.

---

# 40. PLACE IDENTITY

OFFBEAT must avoid creating duplicate place records.

Place identity should use:

```text
External Source
+
External Place ID
```

as a primary matching signal.

Additional matching may use:

```text
Name
+
Coordinates
+
Address
```

---

# 41. DATA OWNERSHIP

## External Data

Owned and maintained by external providers.

Examples:

* Place metadata
* External reviews
* Opening information

## OFFBEAT Data

Owned by OFFBEAT:

* Community submissions
* Confidence
* Verification states
* Itineraries
* User preferences
* Saved places

## AI Output

Generated by Gemini based on available context.

AI output must not automatically become permanent factual data.

---

# 42. API REQUEST FLOW

General API flow:

```text
CLIENT
  ↓
ROUTER
  ↓
VALIDATION
  ↓
CONTROLLER
  ↓
SERVICE
  ↓
DOMAIN LOGIC
  ↓
DATABASE / EXTERNAL SERVICE
  ↓
NORMALIZATION
  ↓
RESPONSE
```

---

# 43. ERROR HANDLING

Every service should return normalized errors.

Example:

```json
{
  "success": false,
  "error": {
    "code": "SERPAPI_UNAVAILABLE",
    "message": "External place data is temporarily unavailable."
  },
  "requestId": "req_123"
}
```

---

# 44. EXTERNAL SERVICE FAILURE

## SerpApi Failure

Fallback:

```text
Cached Data
   ↓
Community Data
   ↓
Partial Discovery
```

## Gemini Failure

Fallback:

```text
Structured External Data
+
Community Data
```

The system should remain functional without AI where possible.

---

# 45. CACHING SYSTEM

Caching should exist at the external data boundary.

Potential cache layers:

```text
Browser Cache
     ↓
Backend Cache
     ↓
Database
     ↓
External API
```

External data should not be fetched repeatedly when the same context has recently been requested.

---

# 46. CACHE KEY

Conceptual key:

```text
country
region
taste
experience
time
query
location
```

Example:

```text
IN:WB:mountains:photography:day
```

---

# 47. DATABASE INTERACTION

The backend uses Prisma to access PostgreSQL.

```text
Service
   ↓
Repository / Prisma Layer
   ↓
PostgreSQL
```

Business logic should not directly embed raw SQL throughout controllers.

---

# 48. CORE DATABASE RELATIONSHIPS

Conceptually:

```text
User
 │
 ├───────────────┐
 │               │
 ▼               ▼
Community      Itinerary
Submission        │
 │                ▼
 ▼            ItineraryItem
Place
 │
 ├───────────────┐
 ▼               ▼
Recommendation   CommunitySubmission
 │
 ▼
Confidence
```

---

# 49. SECURITY ARCHITECTURE

Sensitive credentials must remain server-side.

```text
Frontend
    │
    │ HTTPS
    ▼
Backend
    │
    ├── SERPAPI_KEY
    └── GEMINI_API_KEY
```

The frontend must never receive:

* SerpApi API key
* Gemini API key
* Database credentials
* JWT signing secret

---

# 50. AUTHENTICATION

Authentication should be modular.

If authentication is included in the MVP:

```text
User
 ↓
Register / Login
 ↓
JWT
 ↓
Authenticated Requests
```

If authentication is excluded from the first prototype:

```text
Anonymous Session
 ↓
Discovery
 ↓
Temporary Itinerary
```

The system architecture must preserve the ability to introduce full accounts later.

---

# 51. AUTHORIZATION

Potential roles:

```text
TRAVELER
ADMIN
```

Future roles may include:

```text
MODERATOR
VERIFIED_CONTRIBUTOR
```

Permissions must be enforced server-side.

---

# 52. RATE LIMITING

Rate limiting is required for:

* Discovery endpoints
* Community submissions
* Support/upvote actions
* Reports
* AI endpoints
* External API requests

AI and external API endpoints should receive stricter controls.

---

# 53. DUPLICATE SUBMISSION DETECTION

Before storing a new community submission:

```text
Submission
   ↓
Place Match
   ↓
Type Match
   ↓
Content Similarity
   ↓
Duplicate Detection
```

Potential duplicates should be merged, linked, or flagged rather than repeatedly inserted.

---

# 54. FRONTEND SYSTEM

Frontend responsibilities:

```text
Render UI
Manage interaction
Manage local state
Call backend APIs
Display recommendations
Display community information
Display confidence
Manage itinerary UI
Render map
```

Frontend must not contain:

* SerpApi secrets
* Gemini secrets
* Core recommendation logic
* Confidence calculation logic
* Verification logic

---

# 55. FRONTEND STATE

Global state may contain:

```text
selectedCountry
selectedRegion
travelTaste
experienceTaste
timeContext
discoveryResults
selectedPlace
communityResults
itinerary
takeHome
uiState
```

Server-generated data should be managed separately from purely local UI state where practical.

---

# 56. DISCOVERY SCREEN SYSTEM

The primary discovery interface should follow:

```text
COUNTRY
   ↓
MAP
   ↓
REGION
   ↓
TRAVEL TASTE
   ↓
EXPERIENCE TASTE
   ↓
DAY / NIGHT
   ↓
RESULTS
```

Each transition should preserve user context.

---

# 57. PLACE DETAIL SYSTEM

A place detail page should be able to display:

```text
Place Name
Category
Location
Rating
Reviews
Opening Information
Recommended Time
Community Discoveries
Confidence
Why OFFBEAT Recommends It
Find an Alternative
Add to Itinerary
TAKE HOME
```

---

# 58. COMMUNITY DETAIL SYSTEM

A community contribution should display:

```text
Contributor
Submission Type
Place
Content
Media
Confidence
Verification State
Supporting Signals
Report
```

---

# 59. LOADING STATES

Every asynchronous operation must have an appropriate loading state.

Examples:

```text
Loading Map
Loading Places
Loading Recommendations
Analyzing Community Data
Building Itinerary
Finding Alternative
Loading TAKE HOME
```

The UI should avoid displaying an empty screen while processing.

---

# 60. EMPTY STATES

Examples:

### No Places

> "We couldn't find places matching this taste yet."

### No Community Data

> "You're among the first to discover something here."

### No Alternative

> "OFFBEAT couldn't find a meaningful alternative for this experience."

### No TAKE HOME

> "No local discoveries have been identified yet."

---

# 61. OBSERVABILITY

System logs should capture:

```text
Request ID
Endpoint
User / Session
Response Status
Latency
SerpApi Latency
Gemini Latency
Database Latency
Cache Hit / Miss
Errors
```

Secrets and sensitive data must not be logged.

---

# 62. SYSTEM PERFORMANCE

Target behavior:

### Frontend

* Fast initial load
* Lazy-load heavy components
* Optimize map rendering
* Optimize images
* Avoid unnecessary re-renders

### Backend

* Cache external calls
* Parallelize independent requests
* Apply timeouts
* Use database indexes
* Avoid duplicate external calls

### AI

* Call Gemini only when reasoning is required
* Reuse valid cached results where appropriate
* Limit context size to relevant information

---

# 63. SYSTEM RELIABILITY

OFFBEAT should degrade gracefully.

### Full Mode

```text
SerpApi
+
Community
+
Gemini
```

### Reduced Mode

```text
SerpApi
+
Community
```

### Cached Mode

```text
Cached External Data
+
Community
```

### Community Mode

```text
Community Data
```

The user should still receive useful information whenever sufficient data exists.

---

# 64. SYSTEM DATA FLOW — COMPLETE

```text
                    USER
                     │
                     ▼
             ┌──────────────┐
             │  FRONTEND    │
             └──────┬───────┘
                    │
                    ▼
             ┌──────────────┐
             │  API LAYER   │
             └──────┬───────┘
                    │
                    ▼
             DISCOVERY CONTEXT
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
     SERPAPI    COMMUNITY    DATABASE
        │           │           │
        └───────────┼───────────┘
                    ▼
             SIGNAL AGGREGATION
                    │
                    ▼
             CONFIDENCE ENGINE
                    │
                    ▼
             GEMINI REASONING
                    │
                    ▼
           RECOMMENDATION ENGINE
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
      DISCOVERY  ALTERNATIVE  TIME
          │
          ▼
       ITINERARY
          │
          ▼
       TAKE HOME
          │
          ▼
       EXPERIENCE
          │
          ▼
      CONTRIBUTION
          │
          └──────────────► COMMUNITY
```

---

# 65. COMPLETE SYSTEM LOOP

OFFBEAT's technical system ultimately forms a closed loop:

```text
DISCOVER
   ↓
SEARCH
   ↓
INTERPRET
   ↓
RECOMMEND
   ↓
EXPERIENCE
   ↓
CONTRIBUTE
   ↓
VERIFY
   ↓
INCREASE COMMUNITY KNOWLEDGE
   ↓
IMPROVE FUTURE DISCOVERY
```

This loop is fundamental to the platform.

---

# 66. SYSTEM PRINCIPLES

## S1 — Backend First

Business logic must remain server-side.

## S2 — Data Separation

External data, community data, and AI interpretations must remain distinguishable.

## S3 — Evidence-Aware

Recommendations should be supported by identifiable signals.

## S4 — Context-Aware

The system must interpret user intent instead of applying rigid universal rules.

## S5 — Explainable

Users should understand why something was recommended.

## S6 — Resilient

External service failure must not completely break the application.

## S7 — Extensible

New travel categories, APIs, recommendation signals, and community features must be addable without redesigning the entire system.

---

# 67. SYSTEM NON-FUNCTIONAL REQUIREMENTS

| Requirement          | Target                         |
| -------------------- | ------------------------------ |
| API Transport        | HTTPS                          |
| API Architecture     | REST                           |
| Database             | PostgreSQL                     |
| ORM                  | Prisma                         |
| Backend              | Node.js + Express + TypeScript |
| Frontend             | React + TypeScript             |
| Validation           | Zod                            |
| External Data        | SerpApi                        |
| AI                   | Gemini Flash                   |
| Secrets              | Server-side                    |
| Rate Limiting        | Required                       |
| Caching              | Required                       |
| Request IDs          | Required                       |
| Structured AI Output | Required                       |
| Graceful Degradation | Required                       |
| Logging              | Required                       |
| Input Validation     | Required                       |
| Community Moderation | Required                       |

---

# 68. MVP SYSTEM BOUNDARY

The first implementation should prioritize:

```text
COUNTRY
   ↓
REGION
   ↓
TRAVEL TASTE
   ↓
DAY / NIGHT
   ↓
PLACE DISCOVERY
   ↓
COMMUNITY DATA
   ↓
CONFIDENCE
   ↓
AI RECOMMENDATION
   ↓
ALTERNATIVE
   ↓
ITINERARY
   ↓
TAKE HOME
```

Advanced social functionality should not compromise the core discovery experience.

---

# 69. FUTURE SYSTEM EXTENSIONS

The architecture should support future:

* Mobile application
* User profiles
* Following
* Social feeds
* Traveler reputation
* Contributor levels
* Advanced crowd prediction
* Real-time events
* Weather integration
* Transport intelligence
* Flight intelligence
* Hotel intelligence
* Collaborative itineraries
* Offline travel mode
* Personalized long-term Travel Taste
* Community moderation automation
* Advanced recommendation models

These are outside the baseline MVP system.

---

# 70. SYSTEM ACCEPTANCE CRITERIA

The system will be considered functionally complete for the baseline when:

### Discovery

* User can select a country.
* User can explore a region.
* User can select Travel Taste.
* User can select Experience Taste where applicable.
* User can select Day/Night.

### Intelligence

* System retrieves relevant external data.
* System retrieves relevant community data.
* System evaluates confidence.
* System produces contextual recommendations.
* System can explain recommendations.

### Time

* System respects operating/opening information.
* System can incorporate community timing recommendations.

### Alternatives

* System supports Find an Alternative.
* System distinguishes replacement from enhancement.

### Planning

* User can add places to an itinerary.
* System validates basic timing conflicts.
* User can view itinerary structure.

### TAKE HOME

* System can surface destination-specific local discoveries.

### Community

* User can submit a travel discovery.
* Submission enters the verification/moderation pipeline.

### Reliability

* API failures are handled gracefully.
* AI failures do not completely break discovery.
* External API keys remain private.

---

# 71. FINAL SYSTEM DEFINITION

OFFBEAT is technically defined as:

> **A modular, community-powered travel discovery system that combines external travel data, first-hand traveler knowledge, evidence and confidence signals, and AI reasoning to generate context-aware travel discoveries, alternatives, itineraries, and local experiences.**

Its fundamental technical transformation is:

```text
USER INTENT
     +
EXTERNAL TRAVEL DATA
     +
COMMUNITY KNOWLEDGE
     +
EVIDENCE
     +
AI REASONING
     ↓
CONTEXTUAL DISCOVERY
     ↓
TRAVEL EXPERIENCE
     ↓
COMMUNITY CONTRIBUTION
```

# SYSTEM NORTH STAR

> ## **LET'S DISCOVER WHERE YOU SHOULD GO.**

The system exists not merely to return travel search results, but to create a continuously improving discovery loop where **data tells OFFBEAT what exists, travelers tell OFFBEAT what matters, and AI helps connect the two into meaningful experiences.**
