# OFFBEAT — MEMORY ARCHITECTURE

**Version:** 1.0
**Status:** Baseline Memory Architecture
**Purpose:** Define how OFFBEAT stores, derives, updates, and uses persistent travel knowledge and user context.

---

# 1. MEMORY PHILOSOPHY

OFFBEAT should become more useful as a traveler uses it.

However:

> **OFFBEAT should remember useful context — not everything.**

Memory exists to improve future discovery, personalization, and community intelligence.

It should never become an uncontrolled collection of user activity.

The fundamental principle is:

> **Memory must have a purpose.**

If remembering something does not improve the travel experience, it should not become persistent memory.

---

# 2. MEMORY IS NOT THE DATABASE

The database stores application data.

Memory represents **information that can influence future decisions or intelligence**.

For example:

### Database

```text
User visited Tiger Hill
Date: 2026-10-12
```

### Memory

```text
User has shown strong interest in
sunrise mountain experiences.
```

The first is an event.

The second is a reusable preference pattern.

Therefore:

> **Database = what happened.**
> **Memory = what is useful to remember from what happened.**

---

# 3. MEMORY DOMAINS

OFFBEAT uses four major memory domains:

```text
USER MEMORY
     │
     ├── Preference Memory
     ├── Travel History
     ├── Discovery Memory
     └── Interaction Memory

COMMUNITY MEMORY
     │
     ├── Observations
     ├── Discoveries
     ├── Recommendations
     └── Collective Patterns

PLACE MEMORY
     │
     ├── Time Knowledge
     ├── Crowd Knowledge
     ├── Local Knowledge
     └── Experience Knowledge

SYSTEM MEMORY
     │
     ├── Verified Knowledge
     ├── Confidence History
     └── Intelligence Patterns
```

---

# 4. USER MEMORY

User Memory represents information that can improve future personalization.

Examples:

```text
User frequently chooses mountains.

User often prefers sunrise experiences.

User values photography.

User frequently looks for peaceful locations.

User repeatedly saves less-crowded places.
```

These are not necessarily explicit statements.

They may be derived from repeated user behavior.

---

# 5. EXPLICIT VS INFERRED MEMORY

OFFBEAT must distinguish between information the user explicitly provides and information the system infers.

## Explicit Memory

The user directly tells OFFBEAT:

```text
"I love mountains."

"I prefer peaceful places."

"I usually travel early in the morning."
```

This should have high confidence because it came directly from the user.

---

## Inferred Memory

The system observes a repeated pattern:

```text
User selects:
Mountains → 8 times

Sunrise → 6 times

Photography → 7 times
```

OFFBEAT may derive:

```text
Possible preference:
Mountain sunrise photography
```

But this must remain an **inference**, not a declared fact.

---

# 6. MEMORY CONFIDENCE

Every inferred memory should have a confidence level.

Conceptually:

```text
Explicit User Preference
        ↓
High Confidence

Repeated Behaviour
        ↓
Increasing Confidence

Single Interaction
        ↓
Low Confidence
```

Example:

```text
Memory:
"User prefers mountains"

Source:
Repeated selections

Confidence:
0.86
```

The system should not treat low-confidence inferred preferences as strong constraints.

---

# 7. USER MEMORY TYPES

### Preference Memory

```text
Travel Taste
Experience Taste
Timing preference
Crowd preference
Budget preference
Discovery preference
```

### Destination Memory

```text
Visited destinations
Saved destinations
Previously explored destinations
Repeatedly viewed destinations
```

### Place Memory

```text
Saved places
Liked discoveries
Rejected recommendations
Previously visited places
```

### Interaction Memory

```text
Frequently used features
Repeated discovery patterns
Alternative requests
Community contributions
```

---

# 8. WHAT OFFBEAT SHOULD NOT INFER

OFFBEAT should avoid turning weak behavioral signals into strong personal assumptions.

For example:

```text
User selected a beach once
```

should NOT automatically become:

```text
User loves beaches.
```

Similarly:

```text
User rejected one mountain recommendation
```

should NOT automatically become:

```text
User dislikes mountains.
```

Memory should be based on:

* Explicit input
* Repeated behavior
* Strong evidence
* Clear context

---

# 9. MEMORY DECAY

Travel preferences can change.

Someone who loved beaches last year may want mountains this year.

Therefore, inferred memories should be capable of becoming weaker over time.

Conceptually:

```text
New Preference
     ↓
Strong Signal
     ↓
Repeated Signal
     ↓
Stable Memory
     ↓
No Reinforcement
     ↓
Confidence Decay
```

Explicit preferences should not silently disappear simply because time passed.

---

# 10. MEMORY UPDATE MODEL

Memory should be updated through evidence rather than overwritten blindly.

Example:

```text
Existing Memory:
Prefers peaceful experiences
Confidence: 0.78
```

New interaction:

```text
User selects:
Busy nightlife destination
```

OFFBEAT should not immediately delete the old memory.

Instead:

```text
New evidence
     ↓
Re-evaluate preference
     ↓
Update confidence
```

This allows users to have multiple interests.

---

# 11. USER MEMORY EXAMPLE

Suppose Aryan repeatedly searches:

```text
West Bengal
Mountains
Sunrise
Photography
Peaceful
Less Crowded
```

OFFBEAT may derive:

```text
Memory Pattern

Primary Interest:
Mountain travel

Strong Experiences:
Sunrise
Photography

Secondary Preference:
Peaceful environments

Potential Preference:
Lower-crowd experiences
```

Future discovery can use this context.

---

# 12. MEMORY IN DISCOVERY

When a user starts a new discovery session:

```text
Current User Input
        +
Explicit Preferences
        +
Relevant Memory
        ↓
User Context
        ↓
Intent Engine
```

Memory should therefore **assist** the current request.

It should not override it.

### Example

Stored memory:

```text
User prefers mountains.
```

Current request:

```text
Show me beaches.
```

OFFBEAT should recommend beaches.

The current explicit request has priority.

---

# 13. MEMORY PRIORITY

When different signals conflict, use this hierarchy:

```text
CURRENT EXPLICIT REQUEST
        ↓
CURRENT SESSION CONTEXT
        ↓
EXPLICIT STORED PREFERENCE
        ↓
HIGH-CONFIDENCE MEMORY
        ↓
INFERRED MEMORY
        ↓
WEAK BEHAVIOURAL SIGNAL
```

This prevents old memory from hijacking the current travel decision.

---

# 14. COMMUNITY MEMORY

Community Memory is fundamentally different from personal memory.

It represents knowledge generated by many travelers.

Examples:

```text
"Best sunrise around 4:30 AM."

"This trail gets crowded after 8 AM."

"There is a hidden photography point nearby."

"This local shop is known for handmade textiles."
```

The system should preserve:

* Who submitted it
* When it was submitted
* Supporting evidence
* Community agreement
* Contradictions
* Verification
* Confidence

---

# 15. COMMUNITY MEMORY IS COLLECTIVE

A single user observation is not automatically collective knowledge.

The progression is:

```text
Individual Observation
        ↓
Supporting Observations
        ↓
Repeated Pattern
        ↓
Community Knowledge
        ↓
Confidence
```

Example:

```text
User A:
"Arrive at 4:30 AM."

User B:
"4:30 AM worked best for sunrise."

User C:
"After 5:30 AM it becomes crowded."

        ↓

Community Pattern:
Early arrival is preferable for sunrise.
```

---

# 16. CONFLICTING COMMUNITY MEMORY

OFFBEAT should preserve disagreement.

Example:

```text
Observation A:
Low crowd at 8 AM

Observation B:
High crowd at 8 AM

Observation C:
Weekdays are quiet

Observation D:
Weekends are crowded
```

Instead of forcing:

```text
Crowd = HIGH
```

the memory layer should retain the contextual pattern.

Potential derived knowledge:

```text
Weekday Morning → Lower Crowd
Weekend Morning → Higher Crowd
```

Gemini may interpret the evidence, but the underlying observations remain available.

---

# 17. PLACE MEMORY

Every important place can accumulate contextual knowledge over time.

Example:

```text
TIGER HILL

Operating Information
        +
Sunrise Timing
        +
Community Timing
        +
Crowd Patterns
        +
Photography Knowledge
        +
Local Tips
        +
Alternative Discoveries
```

This becomes the **living knowledge context of the place**.

---

# 18. PLACE MEMORY IS TIME-SENSITIVE

Some place knowledge can become outdated.

Examples:

```text
Opening hours
Road access
Ticket information
Crowd patterns
Temporary closures
Local business status
Events
```

Therefore, memory entries should support:

```text
createdAt
updatedAt
observedAt
expiresAt
```

Not every memory requires expiration, but time-sensitive information should.

---

# 19. MEMORY SOURCES

Every memory should have a source.

Possible sources:

```text
USER_EXPLICIT
USER_BEHAVIOR
COMMUNITY_SUBMISSION
COMMUNITY_PATTERN
EXTERNAL_SOURCE
VERIFICATION
AI_DERIVED
SYSTEM_DERIVED
```

The source must remain identifiable.

---

# 20. MEMORY EVIDENCE

Important memories should be traceable to supporting evidence.

Example:

```text
Memory:
"Sunrise is best around 4:30 AM."

Evidence:
├── Community Submission #102
├── Community Submission #148
├── Community Submission #201
└── External sunrise timing
```

This allows OFFBEAT to explain why it believes something.

---

# 21. MEMORY CONFIDENCE

Memory confidence should be separate from recommendation confidence.

Conceptually:

```text
Memory
   ↓
Evidence
   ↓
Confidence
```

Example:

```text
Memory:
User prefers peaceful mountain experiences.

Source:
Repeated user choices.

Confidence:
0.91
```

Another:

```text
Memory:
Tiger Hill is less crowded at 4:30 AM.

Source:
Community observations.

Confidence:
0.79
```

---

# 22. AI AND MEMORY

Gemini should not directly own the memory database.

Instead:

```text
OFFBEAT Memory Layer
        ↓
Relevant Memory Selection
        ↓
AI Context Builder
        ↓
Gemini
```

Gemini receives only the memory relevant to the current task.

This prevents unnecessary exposure of unrelated information.

---

# 23. GEMINI MEMORY RULE

Gemini may:

* Interpret memory
* Identify patterns
* Suggest potential memory updates
* Explain relationships
* Resolve contextual conflicts

Gemini must not independently:

* Create permanent memory
* Delete permanent memory
* Override explicit user preferences
* Change confidence without backend validation
* Invent user preferences

The backend remains authoritative.

---

# 24. MEMORY WRITE PIPELINE

A potential memory update follows:

```text
EVENT
  ↓
CLASSIFICATION
  ↓
IS THIS MEMORY-WORTHY?
  ↓
NO ─────────────→ Ignore
  │
 YES
  ↓
MEMORY TYPE
  ↓
SOURCE
  ↓
EVIDENCE
  ↓
CONFIDENCE
  ↓
DUPLICATE / EXISTING MEMORY CHECK
  ↓
UPDATE / CREATE
  ↓
STORE
```

---

# 25. MEMORY READ PIPELINE

When generating a recommendation:

```text
CURRENT REQUEST
      ↓
IDENTIFY RELEVANT MEMORY
      ↓
FILTER BY CONTEXT
      ↓
CHECK CONFIDENCE
      ↓
CHECK FRESHNESS
      ↓
BUILD USER CONTEXT
      ↓
INTELLIGENCE ENGINE
```

OFFBEAT should not load every memory record into every request.

---

# 26. MEMORY RELEVANCE

Memory should be retrieved based on relevance.

Example:

Current request:

```text
Darjeeling
Mountains
Sunrise
Photography
```

Relevant memory:

```text
Mountain preference
Sunrise preference
Photography preference
Peaceful experience preference
Previous Darjeeling exploration
```

Irrelevant memory:

```text
Previously searched restaurants in Goa
```

The irrelevant memory should not influence the recommendation.

---

# 27. MEMORY TYPES — SUMMARY

| Memory                | Source             |         Persistent | Confidence |
| --------------------- | ------------------ | -----------------: | ---------: |
| Explicit Preference   | User               |                Yes |       High |
| Inferred Preference   | Behavior           |                Yes |   Variable |
| Saved Place           | User               |                Yes |        N/A |
| Travel History        | User               |                Yes |        N/A |
| Community Observation | Community          |                Yes |   Variable |
| Community Pattern     | Aggregated         |                Yes |   Variable |
| Place Knowledge       | Multiple           |                Yes |   Variable |
| Crowd Pattern         | Community/External |     Time-sensitive |   Variable |
| Time Recommendation   | Community/External |     Time-sensitive |   Variable |
| AI Interpretation     | Gemini             | Usually contextual |   Variable |

---

# 28. PRIVACY PRINCIPLE

OFFBEAT should follow:

> **Collect the minimum information required to provide useful personalization.**

Memory should not be used to create unrelated personal profiles.

The system should avoid storing sensitive information unless it is explicitly required by the product and appropriately handled.

---

# 29. USER CONTROL

Users should have meaningful control over personalization.

Where appropriate, the product should allow users to:

* View important remembered preferences
* Correct incorrect preferences
* Remove saved places
* Reset personalization
* Understand why a recommendation was personalized

The exact UI will be defined during implementation.

---

# 30. MEMORY SAFETY

Memory should never become a source of fabricated facts.

If memory confidence is low:

```text
Do not present:
"This is what you like."
```

Prefer:

```text
"You've often explored..."
```

or use the information silently as a weak ranking signal.

Similarly, uncertain community memory should never be presented as verified fact.

---

# 31. MEMORY + COMMUNITY FEEDBACK LOOP

OFFBEAT creates a continuous intelligence loop:

```text
TRAVELER
   ↓
DISCOVERS
   ↓
EXPERIENCES
   ↓
CONTRIBUTES
   ↓
COMMUNITY
   ↓
EVIDENCE
   ↓
VERIFICATION
   ↓
CONFIDENCE
   ↓
OFFBEAT KNOWLEDGE
   ↓
FUTURE TRAVELER
```

This is one of the most important characteristics of OFFBEAT.

The platform becomes more useful through **collective travel knowledge**.

---

# 32. MEMORY + USER PERSONALIZATION LOOP

The personal loop is:

```text
USER
 ↓
CHOICES
 ↓
INTERACTIONS
 ↓
PATTERNS
 ↓
MEMORY
 ↓
PERSONALIZED DISCOVERY
 ↓
NEW CHOICES
 ↓
UPDATED MEMORY
```

This allows OFFBEAT to become more personalized without requiring the user to repeatedly configure the same preferences.

---

# 33. MEMORY ARCHITECTURE

Conceptually:

```text
                    OFFBEAT MEMORY
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
      USER MEMORY   COMMUNITY MEMORY  PLACE MEMORY
          │              │              │
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                 MEMORY RETRIEVAL
                         │
                         ▼
                  CONTEXT BUILDER
                         │
                         ▼
                  INTELLIGENCE LAYER
                         │
                         ▼
                       GEMINI
                         │
                         ▼
                  RECOMMENDATION
```

---

# 34. MEMORY IS A KNOWLEDGE LOOP

OFFBEAT's memory system should not simply store history.

It should create a controlled loop:

> **Observe → Evaluate → Remember → Retrieve → Reason → Improve**

But every stage must remain evidence-aware.

---

# 35. MEMORY NORTH STAR

The memory system should answer:

> **“What does OFFBEAT already know that is relevant to this traveler, this place, and this moment?”**

Not:

> “What does OFFBEAT know about everything?”

Relevance is more important than volume.

---

# 36. FINAL MEMORY DEFINITION

> **OFFBEAT Memory is a controlled, evidence-aware persistence layer that stores useful user preferences, behavioral patterns, community knowledge, place intelligence, and evolving travel signals so that OFFBEAT can provide increasingly relevant discovery without allowing stale, weak, inferred, or unsupported information to override current user intent.**

The fundamental rule is:

> **REMEMBER WHAT HELPS. VERIFY WHAT MATTERS. FORGET WHAT BECOMES IRRELEVANT.**
