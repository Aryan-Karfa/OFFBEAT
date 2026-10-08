# OFFBEAT — Golden Demo Walkthrough Script (3–5 Minutes)

> **Core Product Narrative:**  
> _"I don't just search for a place. I discover my kind of place. I find out why it fits me. I can find a better or different way to experience it. I can build a day around it. I can find something meaningful to take home. And when I come back... OFFBEAT remembers how I travel."_

---

## Demo Overview

| Stage                       | Duration | Primary View                           | What the Judge Sees                                              |
| --------------------------- | -------- | -------------------------------------- | ---------------------------------------------------------------- |
| 1. Landing & Vision         | 30s      | `/`                                    | Map-first exploratory philosophy; Zero paid ads                  |
| 2. Interactive Geography    | 30s      | `/country/india/map`                   | 28 States & 8 UTs vector map; West Bengal elevation              |
| 3. Taste Formulation        | 30s      | `/travel-taste` & `/experience-taste`  | Multi-dimensional preference collection before recommendation    |
| 4. Contextual Discovery     | 45s      | `/discovery`                           | Tiger Hill primary pick with "Why OFFBEAT Chose This"            |
| 5. Find an Alternative      | 45s      | `/place/place_tiger_hill/alternatives` | 6 strategic modes (Lower Crowd, Replacement, Nearby)             |
| 6. Build My Day (Itinerary) | 45s      | `/itinerary`                           | Intelligent ordering, pace controls, stop swap (Batasia Loop)    |
| 7. TAKE HOME Specialty      | 30s      | `/take-home/dest_darjeeling`           | Darjeeling First-Flush Tea; verified local artisan spots         |
| 8. Memory & Return          | 30s      | `/memory` & `/discovery`               | Explicit + inferred memory, privacy controls, personalized boost |

---

## Step-by-Step Script for Presenter

### Step 1: The Landing Experience (`/`)

- **Action:** Open `http://localhost:5173/`
- **Presenter:**  
  _"Traditional travel search begins with a blinking cursor asking 'Where to?'. But if you don't already know where you should go, search is useless. OFFBEAT is discovery-first, not search-first. We collect travel taste and local intelligence before suggesting a destination."_
- **Click:** **[ START DISCOVERING ]** (or click India on the featured grid).

---

### Step 2: Interactive Geographic Exploration (`/country/india/map`)

- **Action:** Lands on the interactive India vector map.
- **Presenter:**  
  _"Here is our signature geographic discovery surface. It renders all 28 States and 8 Union Territories with high-performance responsive SVG projections. Notice that tiny island territories like Lakshadweep and Andaman are elevated with dedicated spatial markers so nothing is lost."_
- **Action:** Hover over states to show live discovery counts, then click **West Bengal** (`IN-WB`).
- **Click:** **[ EXPLORE WEST BENGAL ]** to enter taste collection.

---

### Step 3: Travel & Experience Taste Formulation (`/travel-taste` → `/experience-taste`)

- **Action:** Traveler selects core tastes.
- **Presenter:**  
  _"We don't pigeonhole travelers into generic buckets. We separate macro travel styles from immediate micro experiences."_
- **Select Travel Taste:** **Mountains** + **Photography** → Click **[ NEXT: EXPERIENCE TASTE ]**.
- **Select Experience Taste:** **Sunrise** + **Nature** → Click **[ REVIEW CONTEXT ]** → Click **[ LAUNCH DISCOVERY ]**.

---

### Step 4: Multi-Signal Discovery & Attribution (`/discovery`)

- **Action:** Discovery Engine presents curated candidates.
- **Presenter:**  
  _"The Discovery Engine merges canonical places with live external evidence and peer community reports. Notice our flagship recommendation: Tiger Hill. Look at the attribution badges: OFFBEAT clearly separates verified facts from community recommendations and AI reasoning."_
- **Highlight:**
  - **Match Score:** 93%+
  - **Timing & Crowd:** Early dawn window (04:30–06:00) with LOW crowd fit
  - **"Why OFFBEAT Chose This":** Grounded explanation showing optimal Kanchenjunga dawn panorama.
- **Click:** **Tiger Hill** card → Enters Place Details (`/place/place_tiger_hill`).

---

### Step 5: Find an Alternative (`/place/place_tiger_hill/alternatives`)

- **Action:** On Tiger Hill page, click the signature **[ FIND AN ALTERNATIVE ]** banner.
- **Presenter:**  
  _"Travel isn't one-size-fits-all. What if Tiger Hill is fogged in, or you want lower crowds, or you're traveling with elderly family who can't hike pre-dawn? OFFBEAT provides 6 distinct alternative strategies, not just random nearby places."_
- **Demonstration:**
  - Switch between **Lower Crowd** and **Replacement**.
  - Show candidate **Batasia Loop** or **Senchal Lake**.
  - Highlight the truthful **Tradeoff Analysis**: e.g., _"Gentler access and war memorial loop, but mountain panorama is lower altitude."_

---

### Step 6: Build My Day (Itinerary Engine) (`/itinerary`)

- **Action:** Click **[ BUILD MY DAY ]** from Tiger Hill or Alternatives.
- **Presenter:**  
  _"Instead of forcing users into rigid 5-day templates, OFFBEAT assembles a geographically and temporally feasible day schedule around your anchor place."_
- **Demonstration:**
  - Notice the intelligent chronological sequence: Dawn Tiger Hill (05:00) → Senchal Forest → Batasia Loop → Darjeeling Mall.
  - Pace selector: Toggle **Relaxed** vs **Balanced** vs **Packed** to see time windows dynamically adjust.
  - Stop Swapping: Click **[ SWAP STOP ]** on one stop and choose a peer-verified alternative with zero itinerary recalculation friction.

---

### Step 7: TAKE HOME (Artisanal Culture & Local Finds) (`/take-home`)

- **Action:** Click **[ TAKE HOME ]** in the header or the "Before You Leave" banner in the itinerary.
- **Presenter:**  
  _"Every meaningful trip ends with bringing something authentic home. But tourism is plagued by souvenir traps and fake claims. OFFBEAT's TAKE HOME engine surfaces signature regional specialties—like First-Flush Darjeeling Tea and Hand-Knitted Woolens—scored strictly by cultural significance."_
- **Click:** **[ WHERE TO FIND ]** on Darjeeling Single-Estate Tea to show verified local tea grower outlets with exact coordinates and hours.

---

### Step 8: Traveler Memory & Return Journey (`/memory`)

- **Action:** Navigate to **[ MEMORY ]** in the navigation header.
- **Presenter:**  
  _"Finally, travel discovery shouldn't reset every time you close your browser. OFFBEAT features an isolated Traveler Memory system."_
- **Demonstration:**
  - Show explicit preferences (Mountains, Sunrise) held permanently with high confidence.
  - Show inferred category affinities (Quiet Nature, Photography) decaying gently over time so tastes stay fresh.
  - Show privacy controls: One-click memory toggle, single memory item deletion, and total purge.
  - Return to **[ DISCOVER ]**: Notice the personalization indicator subtly boosting mountain and sunrise destinations based on accumulated memory.

---

### Step 9: Demo Reset (Golden Reset)

- **Action:** Click **[ RESET DEMO ]** in the top navigation bar.
- **Presenter:**  
  _"At any moment, a judge or evaluator can click 'Reset Demo'. It cleans ephemeral client state, purges demo traveler memory on the server, and returns to the initial pristine experience in under 200 milliseconds."_

---

## 30-Second Elevator Summary for Judges

> _"OFFBEAT replaces empty search boxes with taste-first discovery. We combine vector map exploration, multi-signal ranking, 6 alternative strategies, chronological day planning, local artisanal finds, and private traveler memory into one reliable, production-ready system."_
