# OFFBEAT — UI / UX FRAMEWORK

**Version:** 1.0
**Status:** Baseline UI/UX Specification
**Product:** OFFBEAT
**Design Philosophy:** Discovery-first, map-driven, community-powered
**Core Statement:** **"Let's discover where you should go."**

---

# 1. UI / UX VISION

OFFBEAT's interface should feel like an **exploration tool rather than a conventional travel booking platform**.

The experience should encourage curiosity.

The user should feel:

> **"I don't know exactly where I'm going yet — let's see what I can discover."**

The interface must therefore prioritize:

* Discovery
* Exploration
* Visual geography
* Travel Taste
* Community knowledge
* Context
* Storytelling
* Confidence
* Personalization
* Simplicity

The UI should avoid feeling like:

* A generic AI chatbot
* A hotel-booking platform
* A conventional Google Maps clone
* A social-media feed
* A static travel directory

---

# 2. CORE UX PRINCIPLE

## **DISCOVERY BEFORE DESTINATION**

Traditional travel flow:

```text
I KNOW WHERE I WANT TO GO
            ↓
SEARCH
            ↓
RESULT
```

OFFBEAT flow:

```text
I KNOW WHAT I WANT TO EXPERIENCE
            ↓
EXPLORE
            ↓
DISCOVER
            ↓
CHOOSE
```

The interface should reinforce this distinction at every major interaction.

---

# 3. PRIMARY UX PROMISE

The product should continuously answer:

> **"What should I discover next?"**

rather than repeatedly asking:

> **"What do you want to search for?"**

---

# 4. DESIGN PERSONALITY

OFFBEAT should feel:

### Curious

Encourage exploration.

### Human

Community content should feel like advice from real travelers.

### Intelligent

Recommendations should feel contextual rather than random.

### Trustworthy

Facts, community observations, and AI interpretation should remain distinguishable.

### Modern

The UI should feel contemporary without becoming visually complicated.

### Exploratory

Maps, transitions, cards, and discovery interactions should encourage users to move through the product.

---

# 5. UX DESIGN PRINCIPLES

## P1 — Explore, Don't Search

The user should be able to discover without knowing a destination beforehand.

## P2 — Map as a Discovery Surface

The map is not merely a location viewer.

It is part of the core product experience.

## P3 — Taste Before Destination

Users should be able to describe what they like before selecting a specific place.

## P4 — Context Over Generic Recommendations

Every recommendation should be connected to:

* Taste
* Time
* Location
* Community
* Experience

## P5 — Human Knowledge Must Feel Human

Community discoveries should visually feel different from machine-generated recommendations.

## P6 — Confidence Must Be Visible

Users should understand how strongly a community discovery is supported.

## P7 — Explain Why

The interface should answer:

> **"Why am I seeing this?"**

## P8 — Alternatives Are Contextual

"Find an Alternative" must not always mean "replace this place."

## P9 — Don't Overload

The system may be intelligent underneath, but the interface should remain simple.

---

# 6. INFORMATION ARCHITECTURE

The primary application structure:

```text
OFFBEAT
│
├── DISCOVER
│   ├── Country
│   ├── Map
│   ├── Region
│   ├── Travel Taste
│   ├── Experience Taste
│   └── Day / Night
│
├── PLACES
│   ├── Recommendations
│   ├── Place Details
│   ├── Community Discoveries
│   ├── Find an Alternative
│   └── TAKE HOME
│
├── ITINERARY
│   ├── Current Trip
│   ├── Days
│   └── Places
│
├── COMMUNITY
│   ├── Discoveries
│   ├── Contributions
│   └── Verification
│
└── PROFILE
    ├── Travel Taste
    ├── Saved Places
    └── Contributions
```

The MVP may expose only the functionality required for the hackathon journey.

---

# 7. PRIMARY NAVIGATION

The main navigation should remain minimal.

Recommended structure:

```text
┌─────────────────────────────────────────────────────┐
│ OFFBEAT                    Discover  Itinerary  Me │
└─────────────────────────────────────────────────────┘
```

For desktop:

```text
OFFBEAT
────────────────────────────
DISCOVER
ITINERARY
COMMUNITY
PROFILE
```

For mobile:

```text
┌─────────────────────────────┐
│                             │
│         APPLICATION         │
│                             │
├─────────────────────────────┤
│ Discover │ Trips │ Community│
│          │       │    Me    │
└─────────────────────────────┘
```

Navigation should never compete with discovery content.

---

# 8. LANDING PAGE

The landing page should immediately establish the product philosophy.

## Hero

Primary message:

> **LET'S DISCOVER WHERE YOU SHOULD GO.**

Supporting message:

> Explore destinations based on what you love, how you travel, and what people who've been there have discovered.

Primary CTA:

> **START DISCOVERING**

Secondary interaction:

> **I KNOW WHERE I'M GOING**

This allows both discovery-first and destination-known users to enter the product.

---

### 8.1 — REGION POP / RISE INTERACTION

The transition from **Country → State / Union Territory** should feel like a major discovery moment rather than a conventional map click.

When a user clicks or selects a particular **State / Union Territory**, the selected region should visually **rise, pop, or emerge from the map surface**.

The interaction should create the feeling that the user is physically exploring the geography of the country.

#### Interaction Concept

**COUNTRY MAP**

↓ User selects a State / UT

**SELECTED REGION RISES**

↓ Camera subtly focuses on the region

**REGION BECOMES THE PRIMARY VISUAL**

↓ Information and discovery options appear

**“LET'S DISCOVER [REGION].”**

---

### Visual Behaviour

When a region is selected:

1. **Region separates visually from surrounding geography**

   * The selected State / UT should appear elevated above the map.
   * Surrounding regions should become slightly subdued.
   * The selected region should receive stronger visual emphasis.

2. **Elevation / Pop Animation**

   * The selected region should appear to lift from the map plane.
   * Use a combination of:

     * scale
     * translation
     * depth/elevation
     * subtle perspective
     * lighting/highlight treatment
   * The effect should feel physical rather than like a simple CSS hover.

3. **Camera Focus**

   * The map should smoothly zoom toward the selected region.
   * The transition should preserve geographic context rather than abruptly changing screens.

4. **Boundary Emphasis**

   * The selected region's boundary should become clearly visible.
   * Internal geographic details may progressively appear as the region becomes active.

5. **Neighbouring Regions**

   * Adjacent States / UTs should remain visible but visually recede.
   * They should not disappear completely because geographic context is important.

6. **Information Reveal**

   * Once the region reaches its active state, contextual information should appear.
   * Example:

   **WEST BENGAL**

   `Eastern India`

   `Mountains · Beaches · History · Culture · Food`

   **EXPLORE WEST BENGAL →**

---

### “Marvel” Moment

The interaction should deliberately create a **premium visual reveal**.

The intended feeling is:

> **“I didn't just click West Bengal. West Bengal came out of the map.”**

The animation should feel like a combination of:

**Interactive Geography + Editorial Motion + Premium Product Design**

It should become one of OFFBEAT's signature visual moments.

This interaction should communicate that **the map is not merely displaying geography — it is the gateway into discovery.**

---

### Motion Principles

The animation should feel:

* Smooth
* Cinematic
* Physical
* Responsive
* Premium
* Fast enough to remain interactive
* Dramatic enough to be memorable

Avoid:

* Generic map zoom
* Simple fade-in
* Basic hover effects
* Excessive bouncing
* Slow cinematic transitions that interrupt exploration
* Overly flashy 3D effects that reduce usability

The motion should have a clear sequence:

**SELECT → RISE → FOCUS → REVEAL → EXPLORE**

---

### Interaction States

The region should support the following states:

| State         | Behaviour                                    |
| ------------- | -------------------------------------------- |
| **Idle**      | Country displayed normally                   |
| **Hover**     | Region subtly highlights                     |
| **Pressed**   | Immediate visual response                    |
| **Rising**    | Region separates/elevates from map           |
| **Focused**   | Camera centers and zooms toward region       |
| **Active**    | Region remains visually elevated/highlighted |
| **Exploring** | Discovery information and controls appear    |
| **Back**      | Region smoothly returns to country context   |

---

### Example Experience

User lands on OFFBEAT.

**“LET'S DISCOVER WHERE YOU SHOULD GO.”**

The country map appears.

The user moves toward **West Bengal**.

West Bengal subtly responds.

The user clicks.

**West Bengal rises from the map.**

The camera gently moves closer.

The surrounding Indian map recedes.

A contextual panel appears:

> **WEST BENGAL**
> Mountains. History. Beaches. Culture. Food.
> **What kind of West Bengal are you looking for?**

The user then selects:

**TRAVEL TASTE → MOUNTAINS**

followed by:

**EXPERIENCE TASTE → SUNRISE / PHOTOGRAPHY / PEACEFUL**

OFFBEAT then begins discovering places.

---

### Technical UX Requirement

The implementation should preferably use a map/rendering system capable of producing this depth and interaction rather than relying exclusively on a static SVG image.

The architecture should allow:

* Region-level selection
* Region geometry
* Hover detection
* Click detection
* Camera transitions
* Region highlighting
* Elevation/depth effects
* Animated transitions
* Responsive interaction
* Reduced-motion fallback

The exact rendering technology will be finalized during the frontend architecture and implementation phase.

---

### Accessibility / Reduced Motion

For users who have enabled reduced motion:

* Disable dramatic elevation animation.
* Use a simpler highlight + focus transition.
* Preserve all geographic and discovery functionality.
* Never make the animation necessary to understand which region is selected.

---

### Design Principle

> **THE MAP SHOULD FEEL ALIVE.**

OFFBEAT's geographic exploration should be one of the application's defining experiences.

The user should feel that they are **physically diving into a place**, rather than navigating a conventional travel website.


# 9. LANDING PAGE STRUCTURE

```text
HERO
 ↓
WHAT KIND OF TRAVELER ARE YOU?
 ↓
TRAVEL TASTE
 ↓
COMMUNITY DISCOVERIES
 ↓
HOW OFFBEAT WORKS
 ↓
TAKE HOME
 ↓
COMMUNITY
 ↓
START DISCOVERING
```

The landing page should communicate the product concept without requiring the user to understand the underlying AI architecture.

---

# 10. DISCOVERY ENTRY

When the user selects:

> **START DISCOVERING**

the system begins with:

# WHERE DO YOU WANT TO EXPLORE?

### Country Selection

The user can:

* Search a country
* Browse countries
* Select a suggested country

The system should make the interaction visually simple.

---

# 11. COUNTRY → MAP TRANSITION

After selecting a country:

```text
COUNTRY
   ↓
MAP
```

The map becomes the primary interface.

Example:

```text
┌──────────────────────────────────────────────┐
│ ← India                                     │
│                                              │
│              INTERACTIVE MAP                 │
│                                              │
│       West Bengal     Bihar                  │
│              ↑                               │
│       Jharkhand                            │
│                                              │
│                              [Continue →]     │
└──────────────────────────────────────────────┘
```

States/regions should react visually when hovered or selected.

---

# 12. MAP INTERACTION

The map should support:

### Hover

Show:

* Region name
* Basic discovery indicator
* Optional high-level category signals

### Click

Select region.

### Selection

The selected region becomes the active discovery context.

The interaction should feel exploratory rather than administrative.

---

# 13. REGION DISCOVERY

After selecting a region:

> **"What are you in the mood for?"**

This is the beginning of Travel Taste.

The user sees visually distinct categories.

Example:

```text
WHAT ARE YOU IN THE MOOD FOR?

┌────────────┐ ┌────────────┐ ┌────────────┐
│ HISTORICAL │ │  BEACHES   │ │ MOUNTAINS  │
└────────────┘ └────────────┘ └────────────┘

┌────────────┐ ┌────────────┐ ┌────────────┐
│   NATURE   │ │    FOOD    │ │ PHOTOGRAPHY│
└────────────┘ └────────────┘ └────────────┘
```

---

# 14. TRAVEL TASTE UI

Travel Taste categories should be visually recognizable.

Each category should contain:

* Icon/image
* Name
* Short descriptor
* Optional example

Example:

```text
┌──────────────────────┐
│ 🏔️                   │
│ MOUNTAINS            │
│ Peaks, valleys,       │
│ viewpoints & escapes  │
└──────────────────────┘
```

Multiple tastes may be selected.

Selected categories should have an obvious active state.

---

# 15. EXPERIENCE TASTE

After selecting a broad Travel Taste, OFFBEAT may ask:

> **"What kind of experience are you looking for?"**

Example:

### Mountains

```text
[ Sunrise ]
[ Photography ]
[ Peaceful ]
[ Adventure ]
[ Nature ]
[ Local Culture ]
[ Less Crowded ]
```

This interaction should feel lightweight.

The user should never feel like they are filling out a long questionnaire.

---

# 16. DAY / NIGHT

The user can select:

```text
☀️ DAY
🌙 NIGHT
```

This should be represented as a simple contextual control rather than a complicated filter panel.

Example:

```text
WHEN ARE YOU EXPLORING?

┌─────────────────┐ ┌─────────────────┐
│ ☀️ DAY          │ │ 🌙 NIGHT        │
└─────────────────┘ └─────────────────┘
```

The selection modifies recommendation context.

---

# 17. DISCOVERY RESULTS

The discovery results screen is one of the most important screens in OFFBEAT.

It should communicate:

> **"Here is what OFFBEAT discovered for you."**

Example:

```text
WEST BENGAL
MOUNTAINS • PHOTOGRAPHY • DAY

────────────────────────────────────────────

OFFBEAT DISCOVERED THESE FOR YOU

┌────────────────────────────────────────────┐
│ Darjeeling                                │
│ Mountains • Photography                   │
│                                            │
│ Best experience: Sunrise                  │
│ Community: 🟢 Verified                    │
│                                            │
│ Why OFFBEAT?                              │
│ Matches your mountain + photography      │
│ preferences.                              │
│                                            │
│ [Explore] [Alternative] [+ Itinerary]    │
└────────────────────────────────────────────┘
```

---

# 18. RECOMMENDATION CARD HIERARCHY

Each card should prioritize:

### Level 1

**Place Name**

### Level 2

**Why it matches the user**

### Level 3

**Time / experience information**

### Level 4

**Community confidence**

### Level 5

Actions.

The card should not become a wall of metadata.

---

# 19. "WHY OFFBEAT?"

Every major recommendation should have a concise explanation.

Examples:

> **Matches your mountain + photography taste.**

> **Community members frequently recommend early morning visits.**

> **A quieter experience has been reported during this time.**

The explanation should make the recommendation feel intentional.

---

# 20. COMMUNITY SIGNAL UI

Community information should be visually distinguishable from external data.

Example:

```text
┌───────────────────────────────────┐
│ 👥 COMMUNITY DISCOVERY            │
│                                   │
│ "Arrive around 4:30 AM for       │
│ sunrise before the main crowd."   │
│                                   │
│ 🟢 Community Verified             │
└───────────────────────────────────┘
```

This makes the human contribution obvious.

---

# 21. CONFIDENCE UI

Confidence should be understandable without technical knowledge.

Avoid exposing:

> `confidenceScore = 0.847291`

Instead:

### User-facing:

🟢 **Community Verified**

or:

🟡 **Community Supported**

or:

⚪ **New Discovery**

Optional supporting text:

> Supported by multiple traveler observations.

---

# 22. FACT VS COMMUNITY VS AI

OFFBEAT should visually distinguish three types of information.

### External Fact

```text
OPEN
05:00 AM – 07:00 PM
```

### Community Observation

```text
👥 COMMUNITY
"Arrive around 04:30 AM for sunrise."
```

### AI Interpretation

```text
OFFBEAT SAYS
This timing may suit your sunrise preference.
```

This distinction is fundamental to trust.

---

# 23. PLACE DETAIL PAGE

The place page should follow a storytelling hierarchy.

```text
HERO IMAGE
     ↓
PLACE NAME
     ↓
LOCATION / CATEGORY
     ↓
WHY IT MATTERS
     ↓
BEST TIME
     ↓
COMMUNITY DISCOVERIES
     ↓
FIND AN ALTERNATIVE
     ↓
NEARBY DISCOVERIES
     ↓
TAKE HOME
     ↓
ADD TO ITINERARY
```

---

# 24. PLACE HERO

The hero section should contain:

* Place image
* Place name
* Location
* Category
* Rating where available
* Save button
* Add to itinerary

Avoid placing every piece of information above the fold.

---

# 25. BEST TIME SECTION

Example:

```text
┌──────────────────────────────────────┐
│ BEST TIME                            │
│                                      │
│ 🌅 04:30 AM – 06:30 AM              │
│                                      │
│ Community reports suggest arriving   │
│ early for sunrise.                   │
│                                      │
│ ⚠️ Opening information: 05:00 AM     │
└──────────────────────────────────────┘
```

The distinction between:

**Opening Time**

and:

**Recommended Arrival Time**

must remain obvious.

---

# 26. FIND AN ALTERNATIVE CTA

The CTA should be prominent but contextual.

Recommended label:

> **FIND AN ALTERNATIVE**

Not:

> "Replace Place"

because the interaction may result in an enhancement rather than replacement.

---

# 27. ALTERNATIVE EXPERIENCE

When the user clicks:

> **FIND AN ALTERNATIVE**

the system should explain the interpretation.

Example:

```text
WHAT KIND OF ALTERNATIVE?

For this place, OFFBEAT found:

○ A quieter alternative
○ A similar experience
○ Something nearby
○ A hidden experience around this place
```

For a highly significant destination such as the Taj Mahal, the UI can instead communicate:

> **"This place is part of the experience. Let's find something OFFBEAT around it."**

This makes the interaction context-sensitive.

---

# 28. ALTERNATIVE RESULTS

Example:

```text
TAJ MAHAL
     ↓
FIND AN ALTERNATIVE

┌────────────────────────────────────┐
│ HIDDEN PHOTO SPOT                  │
│                                    │
│ A quieter viewpoint near the      │
│ main attraction.                  │
│                                    │
│ [Explore] [Add to Trip]           │
└────────────────────────────────────┘
```

The UI should clearly explain **why this is considered an alternative**.

---

# 29. ITINERARY BUILDER

The itinerary interface should be simple and visual.

Example:

```text
MY TRIP
──────────────────────────────────

DAY 1
08:00  Place A
10:30  Place B
13:00  Lunch
15:00  Place C
18:00  Sunset Spot

DAY 2
09:00  Place D
12:00  Local Experience
16:00  TAKE HOME
```

The user should be able to:

* Add places
* Remove places
* Reorder places
* Change day
* Adjust time
* View conflicts

---

# 30. ITINERARY INTELLIGENCE

When a user manually creates a conflict, the UI should provide a helpful warning.

Example:

> ⚠️ **This place closes at 5:00 PM.**

or:

> ⚠️ **This schedule leaves only 15 minutes for travel.**

The system should suggest corrections rather than simply rejecting the action.

---

# 31. TAKE HOME UI

TAKE HOME should feel like a discovery section, not an e-commerce page.

Example:

```text
┌──────────────────────────────────────┐
│ TAKE HOME                            │
│                                      │
│ What makes this place worth          │
│ remembering?                         │
│                                      │
│ 🛍️ Local Craft                      │
│ 📍 Where to find it                 │
│                                      │
│ 🍜 Regional Food                     │
│ 📍 Where to find it                 │
│                                      │
│ 🎨 Local Art                         │
│ 📍 Where to find it                 │
└──────────────────────────────────────┘
```

The experience should communicate:

> **"Take a piece of the place with you."**

---

# 32. COMMUNITY DISCOVERY SCREEN

The community screen should focus on **people and discoveries**, not vanity metrics.

Possible feed categories:

```text
ALL
PLACES
TIMING
PHOTOGRAPHY
FOOD
LOCAL
EXPERIENCES
```

Example:

```text
👤 Traveler

📸 HIDDEN PHOTO SPOT
Taj Mahal

"There's a much quieter angle around
the eastern side early in the morning."

🟢 Community Verified

[Explore Place]
```

---

# 33. CONTRIBUTE SCREEN

Primary CTA:

> **SHARE A DISCOVERY**

The user should immediately understand:

> **"Your experience can help the next traveler."**

---

# 34. CONTRIBUTION FLOW

```text
WHAT DID YOU DISCOVER?
        ↓
SELECT TYPE
        ↓
SELECT PLACE
        ↓
ADD EXPERIENCE
        ↓
ADD PHOTO / MEDIA
        ↓
SUBMIT
        ↓
COMMUNITY VERIFICATION
```

---

# 35. CONTRIBUTION TYPES

The UI may offer:

```text
📍 Hidden Place
⏰ Timing Tip
📸 Photo Spot
🍜 Local Food
🏪 Local Business
🛍️ Local Specialty
💡 Travel Tip
⭐ Review
🏕️ Experience
👥 Crowd Tip
```

And:

> **Something Else**

for anything that doesn't fit.

---

# 36. CONTRIBUTION FORM

The form should remain short.

Required:

* Place
* Discovery type
* Description

Optional:

* Photo
* Exact timing
* Additional context
* Supporting information

The user should not have to understand the verification system while submitting.

---

# 37. COMMUNITY CONFIDENCE EXPLANATION

If the user taps a confidence indicator:

```text
WHY IS THIS VERIFIED?

This discovery has:
✓ Multiple supporting traveler reports
✓ Supporting media
✓ External place information

Confidence:
COMMUNITY VERIFIED
```

The interface should explain evidence in plain language.

---

# 38. SEARCH

OFFBEAT should support search, but search should not dominate the experience.

Search can be used when the user:

* Already knows a destination
* Wants a specific place
* Wants a specific restaurant
* Wants to find a particular experience

Search should act as a **shortcut**, not the product's identity.

---

# 39. MAP + LIST VIEW

Discovery results should support two complementary views:

### Map View

Best for:

* Geographic exploration
* Nearby discoveries
* Regional understanding

### List View

Best for:

* Comparing recommendations
* Reading details
* Building an itinerary

Possible toggle:

```text
[ MAP ] [ LIST ]
```

---

# 40. RESPONSIVE DESIGN

OFFBEAT must support:

* Desktop
* Tablet
* Mobile

The information architecture should remain consistent while layouts adapt.

---

# 41. DESKTOP EXPERIENCE

Desktop can prioritize:

```text
┌──────────────────────────────────────────────────────┐
│ Navigation                                            │
├──────────────────────────────┬───────────────────────┤
│                              │                       │
│          MAP                 │     DISCOVERIES       │
│                              │                       │
│                              │                       │
└──────────────────────────────┴───────────────────────┘
```

This is especially appropriate for map-based discovery.

---

# 42. MOBILE EXPERIENCE

Mobile should prioritize:

```text
┌────────────────────────────┐
│ OFFBEAT                    │
├────────────────────────────┤
│                            │
│       DISCOVERY             │
│                            │
│                            │
├────────────────────────────┤
│ MAP / LIST                 │
├────────────────────────────┤
│ Bottom Navigation          │
└────────────────────────────┘
```

Map and cards should not fight for screen space.

---

# 43. DESIGN SYSTEM

The design system should define:

* Typography
* Colors
* Spacing
* Grid
* Icons
* Buttons
* Cards
* Badges
* Inputs
* Modals
* Tooltips
* Map markers
* States
* Animations

---

# 44. VISUAL LANGUAGE

OFFBEAT should have a distinctive visual identity.

Recommended characteristics:

### Clean

Avoid unnecessary visual noise.

### Editorial

Travel imagery and typography should feel curated.

### Geographic

Maps and location indicators should be visually important.

### Human

Community content should feel warm and authentic.

### Intelligent

AI-driven elements should feel integrated rather than gimmicky.

---

# 45. COLOR SYSTEM

A suggested baseline:

### Primary

**OFFBEAT Dark**

`#0B0D0E`

### Surface

`#15191B`

### Elevated Surface

`#202528`

### Primary Text

`#F5F2EA`

### Secondary Text

`#A9AFB1`

### Accent

A distinctive travel-oriented accent may be selected during visual design exploration.

### Confidence

Confidence indicators should use semantic colors:

* Verified → Green
* Supported → Amber
* New → Neutral
* Flagged → Red

Semantic colors should not be used as decorative elements.

---

# 46. TYPOGRAPHY

Typography should prioritize:

### Display

Strong editorial/display font.

Used for:

* Hero statements
* Large destinations
* Major section titles

### UI

Clean sans-serif.

Used for:

* Buttons
* Navigation
* Labels
* Metadata

### Body

Highly readable sans-serif.

Used for:

* Community descriptions
* Explanations
* Place information

Typography should create hierarchy without excessive font variation.

---

# 47. SPACING SYSTEM

Use a consistent spacing scale.

Recommended base:

```text
4px
8px
12px
16px
24px
32px
48px
64px
96px
```

Components should use spacing tokens rather than arbitrary values.

---

# 48. BORDER RADIUS

OFFBEAT should use moderate corner rounding.

Avoid:

* Excessive pill-shaped interfaces
* Extremely rounded cards
* Overly soft UI

Rounded elements should communicate:

* Controls
* Tags
* Status
* Interactive surfaces

---

# 49. BUTTON SYSTEM

Primary CTA:

> **START DISCOVERING**

Secondary:

> **EXPLORE**

Contextual:

> **FIND AN ALTERNATIVE**

Planning:

> **ADD TO ITINERARY**

Community:

> **SHARE A DISCOVERY**

Buttons should use strong action verbs.

---

# 50. BADGE SYSTEM

Examples:

```text
🟢 COMMUNITY VERIFIED
🟡 COMMUNITY SUPPORTED
⚪ NEW DISCOVERY
🌅 BEST FOR SUNRISE
📸 PHOTOGRAPHY
🏔️ MOUNTAINS
```

Badges should provide useful information rather than decoration.

---

# 51. ICONOGRAPHY

Icons should be:

* Simple
* Consistent
* Recognizable
* Accessible

Avoid using icons as the sole source of meaning.

For example:

❌ 🟢 alone

Prefer:

> 🟢 **Community Verified**

---

# 52. MAP MARKERS

Map markers should communicate useful context.

Possible markers:

```text
📍 Place
👥 Community Discovery
📸 Photography Spot
🍜 Food
🌅 Sunrise
🛍️ TAKE HOME
```

Markers should avoid becoming visually overwhelming.

Marker clustering should be used when necessary.

---

# 53. INTERACTION DESIGN

Interactions should feel deliberate.

Important interactions include:

### Map Hover

Region highlights.

### Map Click

Region selection.

### Taste Selection

Card activates.

### Discovery

Recommendations progressively appear.

### Alternative

Contextual transition into alternatives.

### Add to Itinerary

Immediate visual confirmation.

### Community Submission

Submission enters verification state.

---

# 54. MICROINTERACTIONS

Use animation to communicate system state.

Examples:

* Map region highlight
* Card selection
* Loading discovery
* Recommendation reveal
* Itinerary addition
* Confidence update
* Alternative transition

Animations should generally be:

* Fast
* Purposeful
* Subtle

Avoid decorative animation that delays the user.

---

# 55. LOADING EXPERIENCE

OFFBEAT's AI and search operations may require processing.

Instead of generic:

> Loading...

Use contextual messaging.

Examples:

> **Exploring West Bengal...**

> **Finding places that match your taste...**

> **Listening to the community...**

> **Finding a better way around this experience...**

> **Building your itinerary...**

This reinforces the product personality.

---

# 56. AI TRANSPARENCY

AI-generated content should not pretend to be a human community post.

Use clear labels:

```text
OFFBEAT INSIGHT
```

for AI interpretation.

and:

```text
COMMUNITY DISCOVERY
```

for user-generated information.

---

# 57. ACCESSIBILITY

The interface must support:

* Keyboard navigation
* Focus states
* Sufficient color contrast
* Screen-reader labels
* Accessible form inputs
* Reduced-motion preference
* Non-color indicators
* Descriptive button labels

Maps must not be the only way to access discovery information.

---

# 58. ACCESSIBLE MAP FALLBACK

If a user cannot interact with the map:

```text
EXPLORE REGIONS AS LIST
```

should remain available.

Example:

```text
West Bengal
Bihar
Jharkhand
Odisha
Sikkim
...
```

The discovery experience must remain functional.

---

# 59. ERROR UX

Errors should be human-readable.

Avoid:

> `ERR_SERP_429`

Prefer:

> **We're having trouble finding fresh place information right now. Try again in a moment.**

Technical error codes may remain available for developers/logging.

---

# 60. EMPTY STATE UX

Empty states should encourage discovery.

Example:

> **Nothing here yet.**

> Be the first traveler to share something OFFBEAT about this place.

CTA:

> **SHARE A DISCOVERY**

---

# 61. COMMUNITY TRUST UX

Trust indicators should be present but never overwhelming.

The interface should communicate:

```text
WHAT IS THIS?
       ↓
WHERE DID IT COME FROM?
       ↓
HOW STRONG IS THE EVIDENCE?
```

This creates informed trust rather than blind trust.

---

# 62. UX FOR POPULAR DESTINATIONS

OFFBEAT should not make popular destinations feel like something the user should avoid automatically.

Example:

```text
TAJ MAHAL

⭐ Must-visit experience

OFFBEAT DISCOVERIES
────────────────────
📸 Hidden photo spot
⏰ Early morning timing
🍜 Local food nearby
🏛️ Nearby lesser-known places
🛍️ TAKE HOME
```

The product should **enhance** the user's trip rather than simply tell them to avoid famous locations.

---

# 63. UX FOR LESSER-KNOWN DESTINATIONS

For less-known destinations, the interface should emphasize discovery.

Example:

```text
YOU FOUND SOMETHING OFFBEAT

Shittong

🏔️ Mountains
📸 Photography
🌿 Nature

👥 Community Supported
```

The experience should reward curiosity.

---

# 64. DISCOVERY REWARD

When a user discovers something that is less obvious, OFFBEAT may reinforce the discovery emotionally.

Example:

> **"This one's OFFBEAT."**

or:

> **"You found a lesser-known experience."**

This should be used sparingly.

---

# 65. USER FEEDBACK

After visiting or interacting with a place, the system may eventually ask:

> **"Was this useful?"**

Possible responses:

```text
👍 Helpful
😐 Not really
👎 Not accurate
```

This feedback can improve future recommendation quality.

---

# 66. UX DATA LOOP

```text
USER
 ↓
DISCOVERY
 ↓
RECOMMENDATION
 ↓
EXPERIENCE
 ↓
FEEDBACK
 ↓
COMMUNITY
 ↓
VERIFICATION
 ↓
BETTER RECOMMENDATIONS
```

The interface should make contribution feel like a natural continuation of travel.

---

# 67. UX ANTI-PATTERNS

OFFBEAT should avoid:

### ❌ Generic chatbot-first UX

The primary interface should not be a blank chat box.

### ❌ Search-only UX

Discovery must remain possible without search.

### ❌ AI overload

Do not expose AI everywhere simply because AI exists.

### ❌ Information overload

Do not show every available data point simultaneously.

### ❌ Fake certainty

Never present community or AI information as absolute truth without evidence.

### ❌ Social-media cloning

Community should support travel discovery rather than becoming a generic feed.

### ❌ Booking-platform design

The primary action is discovery, not purchasing.

### ❌ Excessive filters

Taste should be intuitive, not a spreadsheet.

---

# 68. CORE SCREEN INVENTORY

The MVP should include:

```text
01. Landing Page
02. Country Selection
03. Interactive Map
04. Region Selection
05. Travel Taste
06. Experience Taste
07. Day / Night
08. Discovery Results
09. Place Details
10. Find an Alternative
11. Alternative Results
12. Itinerary Builder
13. TAKE HOME
14. Community Discovery
15. Community Submission
16. Submission Status
```

---

# 69. SCREEN RELATIONSHIP

```text
LANDING
   ↓
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
DISCOVERY RESULTS
   │
   ├───────────────┐
   ▼               ▼
PLACE          COMMUNITY
   │
   ├───────┬───────┐
   ▼       ▼       ▼
TIME   ALTERNATIVE TAKE HOME
   │
   ▼
ITINERARY
   │
   ▼
EXPERIENCE
   │
   ▼
CONTRIBUTE
```

---

# 70. DESIGN NORTH STAR

Every screen should pass this question:

> **"Does this help the traveler discover something meaningful?"**

If a UI element does not improve:

* Discovery
* Understanding
* Trust
* Planning
* Experience
* Contribution

it should be questioned before being included.

---

# 71. UX NORTH STAR

The user journey should feel like:

```text
CURIOUS
   ↓
EXPLORING
   ↓
DISCOVERING
   ↓
SURPRISED
   ↓
INFORMED
   ↓
PLANNING
   ↓
EXPERIENCING
   ↓
SHARING
```

Not:

```text
SEARCH
↓
FILTER
↓
COMPARE
↓
BOOK
```

---

# 72. FINAL UI / UX DEFINITION

OFFBEAT's UI/UX is a **discovery-first, map-driven, taste-aware, community-powered travel interface**.

The experience begins with curiosity rather than destination certainty.

The user expresses:

> **Where am I exploring?**

> **What do I like?**

> **What kind of experience do I want?**

> **When am I going?**

OFFBEAT then turns those signals into:

> **Places → Experiences → Community Knowledge → Alternatives → Itinerary → TAKE HOME**

The interface must make this intelligence feel simple, visual, human, and trustworthy.

---

# 73. UI / UX NORTH STAR

# **LET'S DISCOVER WHERE YOU SHOULD GO.**

The interface should never feel like it is simply giving the user a list of places.

It should feel like:

> **OFFBEAT is exploring with you.**
