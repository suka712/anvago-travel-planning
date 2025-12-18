# Anvago Technical Implementation

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Technology Choices (Deep Dive)](#technology-choices)
3. [Core Features & How They Work](#core-features)
4. [Feature Flows (Presentation Reference)](#feature-flows-presentation-reference)
5. [AI Integration Details](#ai-integration-details)
6. [Live Trip Tracking](#live-trip-tracking-implementation)
7. [Data Models & API Contracts](#data-models--api-contracts)
8. [Cost Analysis](#cost-analysis)
9. [Future Improvements & Scaling](#future-improvements--scaling)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                      │
│  │   React     │  │   React     │  │  Business   │                      │
│  │   Web App   │  │   Native    │  │   Portal    │                      │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                      │
└─────────┼────────────────┼────────────────┼─────────────────────────────┘
          │                │                │
          └────────────────┼────────────────┘
                           │ HTTPS/WebSocket
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY                                    │
│                     (Rate Limiting, Auth, Routing)                       │
└─────────────────────────────────────────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   Core API      │ │   AI Service    │ │  Real-time      │
│   (Go)          │ │   (Go)          │ │  Service (Go)   │
│                 │ │                 │ │                 │
│ • Users         │ │ • Optimization  │ │ • Trip State    │
│ • Itineraries   │ │ • Smart Replace │ │ • Location      │
│ • Locations     │ │ • Smart Reroute │ │   Updates       │
│ • Trips         │ │ • Authenticity  │ │ • Notifications │
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘
         │                   │                   │
         │                   ▼                   │
         │          ┌─────────────────┐          │
         │          │  Claude API     │          │
         │          │  (Anthropic)    │          │
         │          └─────────────────┘          │
         │                                       │
         └───────────────────┬───────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐          │
│  │   PostgreSQL    │  │     Redis       │  │   Object Store  │          │
│  │                 │  │                 │  │   (S3/R2)       │          │
│  │ • Users         │  │ • Session Cache │  │                 │          │
│  │ • Itineraries   │  │ • Trip State    │  │ • Images        │          │
│  │ • Locations     │  │ • Rate Limits   │  │ • User Uploads  │          │
│  │ • Trips         │  │ • AI Cache      │  │                 │          │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Choices

### Why Go Over Java or .NET?

This is a critical architectural decision. Here's our detailed reasoning:

#### Performance Comparison

| Metric | Go | Java (Spring Boot) | .NET Core |
|--------|----|--------------------|-----------|
| **Cold start** | 10-50ms | 2-5 seconds | 500ms-2s |
| **Memory footprint** | 10-30MB | 200-500MB | 100-300MB |
| **Compiled binary** | Single 15MB file | JAR + JVM (~200MB) | DLL + runtime (~150MB) |
| **Concurrency model** | Goroutines (2KB each) | Threads (1MB each) | Tasks (similar to Go) |
| **GC pause times** | <1ms (Go 1.19+) | 10-100ms (G1GC) | 1-10ms |

#### Why Go Wins for Anvago

**1. Serverless/Container Fit**
```
Deployment size comparison:
- Go: 15MB Docker image (FROM scratch)
- Java: 400MB+ Docker image (needs JVM)
- .NET: 200MB+ Docker image (needs runtime)

Cold start on Railway/Cloud Run:
- Go: 50ms → User sees response
- Java: 3-5s → User sees loading spinner
```

**2. Concurrent Connection Handling**
```go
// Go: 10,000 concurrent WebSocket connections = ~20MB RAM
// Each goroutine: 2KB initial stack, grows as needed

func handleWebSocket(conn *websocket.Conn) {
    go readPump(conn)   // 2KB
    go writePump(conn)  // 2KB
}

// Java equivalent: 10,000 threads = 10GB RAM
// Each thread: 1MB stack (JVM default)
```

**3. AI API Call Efficiency**
```go
// Go's HTTP client with connection pooling
client := &http.Client{
    Transport: &http.Transport{
        MaxIdleConns:        100,
        MaxIdleConnsPerHost: 100,
        IdleConnTimeout:     90 * time.Second,
    },
}

// Single binary, no framework overhead
// Request to Claude: ~2ms overhead
// Java/Spring: ~15-30ms overhead (reflection, DI, etc.)
```

**4. Compilation = Fewer Runtime Errors**
```go
// Go catches at compile time:
type ItineraryItem struct {
    LocationID string `json:"locationId"`
    StartTime  string `json:"startTime"`
    Duration   int    `json:"duration"`
}

// Misspell "Duration" → Compiler error, not runtime crash
```

#### When Java/.NET Would Be Better

- **Enterprise integration**: Heavy SOAP/WS-* requirements
- **Existing team expertise**: Team knows Java, timeline is tight
- **Complex business rules**: Need mature ORM, DI frameworks
- **Windows-centric deployment**: .NET has better Windows tooling

For Anvago (stateless APIs, real-time WebSockets, AI proxy), Go's simplicity wins.

---

### Why PostgreSQL Over MongoDB?

| Factor | PostgreSQL | MongoDB |
|--------|------------|---------|
| **Data relationships** | Native JOINs, foreign keys | Manual denormalization |
| **Location queries** | PostGIS extension (mature) | Geospatial (good, not as mature) |
| **ACID compliance** | Full transactions | Eventually consistent by default |
| **JSON support** | JSONB (indexed, queryable) | Native (primary storage) |
| **Hosting cost** | Cheaper at scale | Higher storage costs |

**Our data is relational:**
```sql
-- Itinerary → has many → ItineraryItems → belongs to → Location
-- This is a natural fit for PostgreSQL

SELECT i.*, array_agg(json_build_object(
    'location', l.name,
    'duration', ii.duration,
    'startTime', ii.start_time
)) as items
FROM itineraries i
JOIN itinerary_items ii ON ii.itinerary_id = i.id
JOIN locations l ON l.id = ii.location_id
WHERE i.user_id = $1
GROUP BY i.id;
```

**Geospatial queries for nearby locations:**
```sql
-- Find locations within 5km of a point
SELECT *, ST_Distance(
    coordinates::geography,
    ST_MakePoint($1, $2)::geography
) as distance_meters
FROM locations
WHERE ST_DWithin(
    coordinates::geography,
    ST_MakePoint($1, $2)::geography,
    5000  -- 5km radius
)
ORDER BY distance_meters;
```

---

### Why Claude Over GPT-4 or Gemini?

| Capability | Claude 3.5 Sonnet | GPT-4 Turbo | Gemini Pro |
|------------|-------------------|-------------|------------|
| **Structured JSON output** | Excellent | Good | Inconsistent |
| **Instruction following** | Best in class | Very good | Good |
| **Context window** | 200K tokens | 128K tokens | 1M tokens |
| **Cost (per 1M tokens)** | $3/$15 (in/out) | $10/$30 | $1.25/$5 |
| **Latency (median)** | 800ms | 1.2s | 600ms |

**Why Claude for Anvago:**

1. **Reliable JSON**: We need structured output for itinerary items
```
Claude success rate: ~99% valid JSON
GPT-4 success rate: ~95% (occasional markdown wrapping)
Gemini success rate: ~90% (sometimes adds explanatory text)
```

2. **Nuanced understanding**: "Chill & Relax" vibe vs "Adventure" changes recommendations meaningfully

3. **Safety**: Less likely to suggest dangerous activities or inappropriate venues

---

## Core Features

### Important Clarification: Curated vs Generated

**Current Implementation:**
- Itineraries are **curated by local experts** and stored in our database
- Users browse and select from pre-made itineraries
- AI enhances the experience through **optimization, personalization, and assistance**

**AI's Role (what it actually does):**
1. **Optimize** existing itineraries (reorder stops, adjust timing)
2. **Smart Replace** individual items with contextual alternatives
3. **Smart Reroute** during live trips (weather, delays)
4. **Authenticity Scoring** for locations
5. **Trip Memory Generation** (post-trip summaries)
6. **Budget Prediction** based on itinerary composition

### Feature 1: AI Optimization (Go AI Optimize)

**What it does:** Takes a user's selected itinerary and optimizes it based on their chosen criteria.

**Optimization Types:**
| Type | Algorithm | When to Use AI |
|------|-----------|----------------|
| **Route** | Nearest-neighbor TSP | AI refines edge cases, considers opening hours |
| **Time** | Greedy scheduling | AI suggests duration adjustments based on crowd data |
| **Budget** | Sort by cost/rating ratio | AI explains trade-offs to user |
| **Walking** | K-means clustering | AI groups by "vibe" not just distance |

**Non-AI Approach (Baseline):**
```go
// Route optimization without AI - O(n²) nearest neighbor
func optimizeRoute(items []ItineraryItem) []ItineraryItem {
    visited := make([]bool, len(items))
    result := make([]ItineraryItem, 0, len(items))

    current := 0 // Start from first item
    for len(result) < len(items) {
        visited[current] = true
        result = append(result, items[current])

        // Find nearest unvisited
        minDist := math.MaxFloat64
        next := -1
        for i, item := range items {
            if !visited[i] {
                dist := haversine(items[current].Lat, items[current].Lng, item.Lat, item.Lng)
                if dist < minDist {
                    minDist = dist
                    next = i
                }
            }
        }
        current = next
    }
    return result
}
```

**AI Enhancement (Why it's better):**
```
Heuristic gives: A → B → C → D → E
Distance: 12.3km, estimated time: 45min travel

AI considers:
- B opens at 10am, current time 8am → swap B later
- C and D are both food → spread meals apart
- E has sunset views → move to end of day

AI output: A → C → B → E → D
Distance: 13.1km (+0.8km), but:
- No waiting at closed venues
- Better meal distribution
- Catches sunset at E
```

### Feature 2: Smart Replace

**What it does:** When user wants to swap an item, suggests contextually-aware alternatives.

**Context considered:**
- Time of day (breakfast spot at 8am vs dinner spot)
- Previous item (beach → suggest nearby, or different vibe)
- Next item (energizing before shopping)
- User preferences (budget, local gems preference)
- Day balance (not 3 beaches in one day)

**Categories returned:**
1. **Similar** - Same category, comparable rating
2. **Higher Rated** - Quality upgrade
3. **Budget Friendly** - Cost reduction
4. **Local Hidden Gems** - High authenticity score
5. **Best for This Moment** - Contextual fit

### Feature 3: Smart Reroute (Live Trip)

**Triggers:**
1. Weather change detected (integration with weather API)
2. User running >30min behind schedule
3. Venue reported closed (user feedback or API)
4. User skips 2+ consecutive stops

**Process Flow:**
```
1. Trigger detected
2. Query alternatives from database
3. AI ranks alternatives considering:
   - Remaining schedule
   - User's exhibited preferences (what they didn't skip)
   - Weather conditions
   - Operating hours
4. Push notification to user
5. User accepts/rejects
6. Update trip state
```

### Feature 4: Authenticity Score

**What it measures:** How "local" vs "touristy" a location is (0-100 scale).

**Factors (weighted):**
- Tourist review ratio: 40%
- Local visitor data: 25%
- Menu/signage language: 15%
- Price normalization vs area: 10%
- Social media geotag analysis: 10%

**Current Implementation (Mock):**
Scores are pre-calculated and stored with location data. In production, this would be a batch job running weekly.

### Feature 5: Budget Prediction

**What it does:** Estimates total trip cost based on selected activities.

**Calculation:**
```typescript
// Client-side calculation (current)
const estimatedCost = itinerary.reduce((total, day) =>
  total + day.items.reduce((dayTotal, item) =>
    dayTotal + (item.cost || 0), 0
  ), 0
);

// Future: Add transport estimates
const transportCost = estimateTransport(itinerary); // Based on distances
const totalEstimate = estimatedCost + transportCost;
```

### Feature 6: Trip Memory Generation

**What it does:** After trip completion, generates a shareable summary.

**Input to AI:**
- Completed stops (names, types, ratings given)
- Skipped stops
- Total duration
- User's overall rating

**Output:**
- Trip title
- 2-3 sentence summary
- Top 3 highlights
- Mood/vibe tag

---

## Feature Flows (Presentation Reference)

Simplified step-by-step flows for each AI feature. Use these for presentations and demos.

### Flow 1: AI Optimization ("Go AI Optimize")

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI OPTIMIZATION FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. CURRENT ITINERARY                                           │
│     User has selected an itinerary with 6-8 stops               │
│                         ↓                                       │
│  2. SELECT OPTIMIZATION TYPE                                    │
│     Route | Time | Budget | Walking                             │
│                         ↓                                       │
│  3. GATHER STATIC CONTEXT                                       │
│     • User preferences (budget level, activity level)           │
│     • Time constraints (start/end of day)                       │
│     • Interests (food, beach, culture)                          │
│                         ↓                                       │
│  4. GATHER DYNAMIC DATA                                         │
│     • Opening hours for each location                           │
│     • GPS coordinates (for distance calc)                       │
│     • Crowd levels (if available)                               │
│     • Travel times between stops                                │
│                         ↓                                       │
│  5. SEND TO CLAUDE                                              │
│     Prompt includes: items, preferences, constraints, goal      │
│                         ↓                                       │
│  6. RECEIVE OPTIMIZED ORDER                                     │
│     • New sequence of items                                     │
│     • Adjusted start times                                      │
│     • Change explanations ("Moved B after C because...")        │
│                         ↓                                       │
│  7. SHOW COMPARISON                                             │
│     Before vs After with highlighted changes                    │
│     User: Accept | Reject | Modify                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key insight:** AI adds value by considering factors that algorithms miss (meal spacing, sunset timing, energy flow).

---

### Flow 2: Contextual Swap (formerly "Smart Replace")

> **Note:** Consider renaming "Smart Replace" to "Contextual Swap" or "Swap Suggestions" - the current name implies automation but the feature is user-initiated.

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONTEXTUAL SWAP FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. USER CLICKS "SWAP" ON AN ITEM                               │
│     Item: "My Khe Beach" at 2:00 PM                             │
│                         ↓                                       │
│  2. QUERY ALTERNATIVES FROM DATABASE                            │
│     • Same city                                                 │
│     • Open at that time slot                                    │
│     • Similar duration (±30 min)                                │
│     → Returns 10-15 candidates                                  │
│                         ↓                                       │
│  3. GATHER SEQUENCE CONTEXT                                     │
│     • Previous item: "Lunch at Bánh Mì Bà Lan" (just ate)       │
│     • Next item: "Marble Mountains" (active hiking)             │
│     • Time slot: 2:00-4:00 PM (hot afternoon)                   │
│                         ↓                                       │
│  4. GATHER DAY CONTEXT                                          │
│     • Day theme: "Beach & Culture"                              │
│     • Types already in day: [food, beach, temple]               │
│     • Missing: local experience, relaxation                     │
│                         ↓                                       │
│  5. SEND TO CLAUDE FOR CATEGORIZATION                           │
│     "Rank these 15 alternatives for this context"               │
│                         ↓                                       │
│  6. RECEIVE CATEGORIZED SUGGESTIONS                             │
│     • Similar: Another beach                                    │
│     • Higher Rated: Better-reviewed spot                        │
│     • Budget Friendly: Cheaper option                           │
│     • Local Gem: High authenticity score                        │
│     • Perfect Fit: Best for THIS moment (see below)             │
│                         ↓                                       │
│  7. SHOW OPTIONS WITH REASONS                                   │
│     Each option shows: why it fits, rating diff, cost diff      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### Flow 3: "Perfect Fit" Scoring (Best for This Moment)

This is the intelligence behind the "Best for This Moment" / "Perfect Fit" category:

```
┌─────────────────────────────────────────────────────────────────┐
│                 "PERFECT FIT" SCORING ALGORITHM                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  INPUT: Current time slot, previous/next items, day context     │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  SCORE 1: TIME-OF-DAY FIT (0-25 points)                 │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │  Morning (6-10am):                                      │    │
│  │    +25: breakfast spots, beaches (sunrise), temples     │    │
│  │    +10: cafes, markets                                  │    │
│  │     +0: bars, nightlife                                 │    │
│  │                                                         │    │
│  │  Midday (10am-2pm):                                     │    │
│  │    +25: museums (AC), indoor markets, lunch spots       │    │
│  │    +10: shaded activities                               │    │
│  │     +0: outdoor beaches (too hot)                       │    │
│  │                                                         │    │
│  │  Afternoon (2-5pm):                                     │    │
│  │    +25: cafes, pools, air-conditioned spaces            │    │
│  │    +15: covered markets, malls                          │    │
│  │     +5: outdoor but shaded                              │    │
│  │                                                         │    │
│  │  Evening (5-8pm):                                       │    │
│  │    +25: viewpoints (sunset), dinner spots, night markets│    │
│  │    +15: rooftop bars, waterfront                        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  SCORE 2: ENERGY FLOW (0-25 points)                     │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │  After ACTIVE (beach, hiking, walking tour):            │    │
│  │    +25: rest, food, seated activity, spa                │    │
│  │    +10: light walking, browsing                         │    │
│  │     +0: another active activity                         │    │
│  │                                                         │    │
│  │  After FOOD:                                            │    │
│  │    +25: light walking, exploration, markets             │    │
│  │    +10: cultural site (not too active)                  │    │
│  │     +0: heavy meal, intense activity                    │    │
│  │                                                         │    │
│  │  After REST/RELAXATION:                                 │    │
│  │    +25: active, adventure, exploration                  │    │
│  │    +15: moderate activity                               │    │
│  │     +5: more rest                                       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  SCORE 3: DAY VARIETY (0-25 points)                     │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │  Check what's MISSING from this day:                    │    │
│  │    No food yet?       → +25 for restaurants             │    │
│  │    All tourist spots? → +25 for local gems              │    │
│  │    No culture?        → +25 for temples/museums         │    │
│  │    No nature?         → +25 for beaches/parks           │    │
│  │    No relaxation?     → +25 for spas/cafes              │    │
│  │                                                         │    │
│  │  Check for REPETITION:                                  │    │
│  │    Same type as prev? → -15 penalty                     │    │
│  │    3rd of same type?  → -25 penalty                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  SCORE 4: PRACTICAL FIT (0-25 points)                   │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │  Distance from previous location:                       │    │
│  │    < 10 min travel:  +25                                │    │
│  │    10-20 min travel: +15                                │    │
│  │    20-30 min travel: +5                                 │    │
│  │    > 30 min travel:  +0                                 │    │
│  │                                                         │    │
│  │  Time slot fit:                                         │    │
│  │    Fits perfectly:   +0 (baseline)                      │    │
│  │    Slightly short:   -5                                 │    │
│  │    Too long:         -10                                │    │
│  │                                                         │    │
│  │  Currently open:                                        │    │
│  │    Yes: +0 (required)                                   │    │
│  │    No:  DISQUALIFIED                                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  TOTAL SCORE = Time + Energy + Variety + Practical             │
│  Maximum: 100 points                                            │
│                                                                 │
│  PERFECT FIT = Highest scoring alternative                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Example calculation:**

```
Scenario: Replacing 2:00 PM beach activity
Previous: Lunch (food)
Next: Marble Mountains (active hiking)
Day so far: [breakfast, temple, lunch] - no relaxation yet

Candidate: "Son Tra Coffee" (cafe with view)
  Time-of-day:  +25 (cafe perfect for hot afternoon)
  Energy flow:  +25 (light activity after food, before hiking)
  Day variety:  +25 (no cafe/relaxation in day yet)
  Practical:    +20 (12 min away, fits 2-hour slot)
  TOTAL:        95/100 → PERFECT FIT ✓

Candidate: "Another Beach"
  Time-of-day:  +5  (too hot at 2pm)
  Energy flow:  +0  (active after food, before active)
  Day variety:  -15 (already had beach yesterday)
  Practical:    +25 (nearby)
  TOTAL:        15/100 → Low rank
```

---

### Flow 4: Smart Reroute (Live Trip Adjustments)

```
┌─────────────────────────────────────────────────────────────────┐
│                     SMART REROUTE FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. TRIP IS ACTIVE                                              │
│     User is currently on their itinerary                        │
│                         ↓                                       │
│  2. TRIGGER DETECTED                                            │
│     • Weather: Rain starting in 30 min                          │
│     • Delay: User is 45 min behind schedule                     │
│     • Closure: Next venue reported closed                       │
│     • Behavior: User skipped 2 consecutive stops                │
│                         ↓                                       │
│  3. ASSESS IMPACT                                               │
│     • Which remaining stops are affected?                       │
│     • What's the cascade effect on timing?                      │
│     • Is the original plan still viable?                        │
│                         ↓                                       │
│  4. QUERY ALTERNATIVES                                          │
│     • Open NOW                                                  │
│     • Nearby (< 15 min travel)                                  │
│     • Fits remaining time window                                │
│     • Matches user's exhibited preferences                      │
│                         ↓                                       │
│  5. SEND CONTEXT TO CLAUDE                                      │
│     "User is behind schedule because X.                         │
│      They skipped Y but loved Z.                                │
│      Weather is changing to W.                                  │
│      Suggest adjustment for remaining 3 hours."                 │
│                         ↓                                       │
│  6. RECEIVE ADJUSTMENT PLAN                                     │
│     • Drop optional stop (with reason)                          │
│     • Substitute closed venue                                   │
│     • Reorder for new conditions                                │
│                         ↓                                       │
│  7. PUSH NOTIFICATION TO USER                                   │
│     "Rain expected at 4pm. We suggest moving                    │
│      Marble Mountains to tomorrow and visiting                  │
│      Han Market (covered) instead."                             │
│                         ↓                                       │
│  8. USER DECIDES                                                │
│     Accept → Update itinerary, recalculate times                │
│     Reject → Keep original, show risk warning                   │
│     Modify → Show other options                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### Flow 5: Trip Memory Generation

```
┌─────────────────────────────────────────────────────────────────┐
│                    TRIP MEMORY FLOW                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. TRIP COMPLETED                                              │
│     User marks final stop as done                               │
│                         ↓                                       │
│  2. GATHER TRIP DATA                                            │
│     • Completed stops: [list with ratings]                      │
│     • Skipped stops: [list]                                     │
│     • Total time: 8 hours                                       │
│     • Photos uploaded: 12                                       │
│     • Tips written: 3                                           │
│                         ↓                                       │
│  3. ANALYZE PATTERNS                                            │
│     • Highest rated: Bánh Mì Bà Lan (5 stars)                   │
│     • Most time spent: My Khe Beach (2 hours)                   │
│     • Category preference: 4 food spots visited                 │
│                         ↓                                       │
│  4. SEND TO CLAUDE                                              │
│     "Generate a trip memory for sharing.                        │
│      Tone: warm, personal, Instagram-worthy."                   │
│                         ↓                                       │
│  5. RECEIVE MEMORY                                              │
│     • Title: "A Foodie's Paradise in Da Nang"                   │
│     • Summary: "From sunrise on My Khe Beach to                 │
│       the best bánh mì I've ever had..."                        │
│     • Highlights: [3 moments]                                   │
│     • Mood tag: #LocalFlavors                                   │
│                         ↓                                       │
│  6. DISPLAY SHAREABLE CARD                                      │
│     Memory text + user's photos + share buttons                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### Making Features Feel "Smarter"

Current problem: Features are **reactive** (user-initiated), not **proactive**.

| Feature | Current (Reactive) | Smarter (Proactive) |
|---------|-------------------|---------------------|
| Swap | User clicks "Replace" | System: "This beach might be too crowded at 2pm. Consider these..." |
| Reroute | User asks for help | System detects delay, pushes suggestion |
| Optimize | User clicks "Optimize" | System: "Your route has 3 issues. Want me to fix them?" |

**Quick wins to feel smarter:**
1. Show warnings on potential issues (closed venues, bad timing)
2. Pre-calculate "Perfect Fit" alternatives before user asks
3. Badge items with "⚠️ Busy time" or "✓ Perfect timing"
4. Proactive notification: "Tomorrow's weather looks rainy for your beach day"

---

## Live Trip Tracking Implementation

This section covers how we track users during active trips, detect arrivals, and provide real-time assistance.

### Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Mobile App    │────▶│   WebSocket     │────▶│     Redis       │
│                 │     │   Server (Go)   │     │   (Trip State)  │
│ • GPS tracking  │◀────│                 │◀────│                 │
│ • Geofencing    │     │ • Auth          │     │ • Pub/Sub       │
│ • Notifications │     │ • State sync    │     │ • TTL (24h)     │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
             ┌───────────┐ ┌───────────┐ ┌───────────┐
             │ Weather   │ │ PostgreSQL│ │ Claude    │
             │ API       │ │ (Persist) │ │ (Reroute) │
             └───────────┘ └───────────┘ └───────────┘
```

### Location Tracking Approaches

#### Option 1: Continuous GPS (High Accuracy, High Battery)

```typescript
// React Native / Expo Location
import * as Location from 'expo-location';

const startTracking = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return;

  // High accuracy for urban navigation
  await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 10000,    // Every 10 seconds
      distanceInterval: 50,   // Or every 50 meters
    },
    (location) => {
      sendLocationToServer(location.coords);
    }
  );
};
```

**When to use:** User actively navigating, needs turn-by-turn directions
**Battery impact:** High (~15% per hour)

#### Option 2: Geofencing (Low Battery, Event-Based)

```typescript
// Set up geofences around each stop
const setupGeofences = async (stops: TripStop[]) => {
  const geofences = stops.map((stop, index) => ({
    identifier: stop.id,
    latitude: stop.latitude,
    longitude: stop.longitude,
    radius: 100, // 100 meter radius
    notifyOnEnter: true,
    notifyOnExit: true,
  }));

  await Location.startGeofencingAsync('TRIP_GEOFENCES', geofences);
};

// Background task triggered on geofence events
TaskManager.defineTask('TRIP_GEOFENCES', ({ data, error }) => {
  if (error) return;

  const { eventType, region } = data;

  if (eventType === Location.GeofencingEventType.Enter) {
    // User arrived at location
    handleArrival(region.identifier);
  } else if (eventType === Location.GeofencingEventType.Exit) {
    // User left location
    handleDeparture(region.identifier);
  }
});
```

**When to use:** Default mode, detecting arrivals/departures
**Battery impact:** Low (~2-3% per hour)

#### Option 3: Hybrid Approach (Recommended)

```typescript
// Combine both for optimal experience
const TrackingMode = {
  PASSIVE: 'passive',     // Geofencing only
  ACTIVE: 'active',       // GPS + Geofencing
  NAVIGATION: 'navigation' // High-frequency GPS
};

const locationStrategy = {
  // When app is backgrounded
  background: TrackingMode.PASSIVE,

  // When app is open but user is browsing
  foreground_idle: TrackingMode.PASSIVE,

  // When user is actively traveling to next stop
  foreground_navigating: TrackingMode.ACTIVE,

  // When user requests turn-by-turn directions
  navigation_mode: TrackingMode.NAVIGATION,
};
```

### Arrival Detection Algorithm

Detecting when a user has "arrived" is more nuanced than just GPS proximity.

#### Simple Proximity Check

```go
// Basic arrival detection
func checkArrival(userLat, userLng, stopLat, stopLng float64) bool {
    distance := haversine(userLat, userLng, stopLat, stopLng)
    return distance <= 100 // Within 100 meters
}
```

**Problem:** GPS drift, tall buildings, user passing by without stopping

#### Smart Arrival Detection

```go
type ArrivalDetector struct {
    stopID        string
    stopLat       float64
    stopLng       float64
    radius        float64
    enteredAt     *time.Time
    dwellRequired time.Duration
    readings      []LocationReading
}

type LocationReading struct {
    Lat       float64
    Lng       float64
    Accuracy  float64
    Timestamp time.Time
}

func (d *ArrivalDetector) ProcessReading(reading LocationReading) ArrivalStatus {
    distance := haversine(reading.Lat, reading.Lng, d.stopLat, d.stopLng)

    // Factor 1: Is user within radius?
    withinRadius := distance <= d.radius

    // Factor 2: Is GPS accuracy acceptable?
    accurateEnough := reading.Accuracy <= 50 // 50 meter accuracy

    // Factor 3: Has user been here long enough? (dwell time)
    if withinRadius && accurateEnough {
        if d.enteredAt == nil {
            now := time.Now()
            d.enteredAt = &now
        }

        dwellTime := time.Since(*d.enteredAt)
        if dwellTime >= d.dwellRequired {
            return ArrivalStatus{
                Arrived:   true,
                Confidence: calculateConfidence(d.readings),
                DwellTime: dwellTime,
            }
        }

        return ArrivalStatus{Arrived: false, Status: "dwelling"}
    }

    // User left the area before dwell time
    d.enteredAt = nil
    return ArrivalStatus{Arrived: false, Status: "outside"}
}

func calculateConfidence(readings []LocationReading) float64 {
    // More readings with consistent position = higher confidence
    if len(readings) < 3 {
        return 0.5
    }

    // Check consistency of readings
    var totalVariance float64
    for i := 1; i < len(readings); i++ {
        dist := haversine(
            readings[i].Lat, readings[i].Lng,
            readings[i-1].Lat, readings[i-1].Lng,
        )
        totalVariance += dist
    }

    avgVariance := totalVariance / float64(len(readings)-1)

    // Low variance = high confidence
    if avgVariance < 10 {
        return 0.95
    } else if avgVariance < 30 {
        return 0.8
    } else if avgVariance < 50 {
        return 0.6
    }
    return 0.4
}
```

#### Arrival Detection Parameters by Location Type

| Location Type | Radius | Dwell Time | Notes |
|---------------|--------|------------|-------|
| Restaurant    | 50m    | 2 min      | Small area, user sits down |
| Beach         | 200m   | 5 min      | Large area, user might walk around |
| Museum        | 100m   | 3 min      | Building entry |
| Viewpoint     | 150m   | 1 min      | Quick photo stop |
| Shopping      | 100m   | 2 min      | Multiple entrances |

### Real-Time State Synchronization

#### WebSocket Protocol

```go
// Server-side WebSocket handler
type TripWebSocket struct {
    conn     *websocket.Conn
    tripID   string
    userID   string
    redis    *redis.Client
}

// Message types
type WSMessage struct {
    Type    string          `json:"type"`
    Payload json.RawMessage `json:"payload"`
}

// Client → Server messages
const (
    MSG_LOCATION_UPDATE = "location:update"
    MSG_STOP_COMPLETE   = "stop:complete"
    MSG_STOP_SKIP       = "stop:skip"
    MSG_REQUEST_REROUTE = "reroute:request"
)

// Server → Client messages
const (
    MSG_TRIP_STATE      = "trip:state"
    MSG_ARRIVAL_DETECTED = "arrival:detected"
    MSG_WEATHER_ALERT   = "weather:alert"
    MSG_REROUTE_SUGGEST = "reroute:suggest"
    MSG_NEARBY_TIP      = "nearby:tip"
)
```

#### Location Update Flow

```
┌──────────┐                    ┌──────────┐                    ┌──────────┐
│  Client  │                    │  Server  │                    │  Redis   │
└────┬─────┘                    └────┬─────┘                    └────┬─────┘
     │                               │                               │
     │ location:update               │                               │
     │ {lat, lng, accuracy, ts}      │                               │
     │──────────────────────────────▶│                               │
     │                               │                               │
     │                               │ Check arrival at current stop │
     │                               │──────────────────────────────▶│
     │                               │                               │
     │                               │◀──────────────────────────────│
     │                               │                               │
     │         [If arrived]          │                               │
     │◀──────────────────────────────│                               │
     │ arrival:detected              │                               │
     │ {stopId, confidence}          │                               │
     │                               │                               │
     │                               │ Update trip state             │
     │                               │──────────────────────────────▶│
     │                               │                               │
     │                               │ Fetch contextual info         │
     │                               │ (tips, nearby, weather)       │
     │                               │                               │
     │◀──────────────────────────────│                               │
     │ nearby:tip                    │                               │
     │ {tip, source}                 │                               │
     │                               │                               │
```

#### Trip State in Redis

```go
type TripState struct {
    TripID          string           `json:"tripId"`
    UserID          string           `json:"userId"`
    Status          string           `json:"status"` // active, paused, completed
    CurrentDay      int              `json:"currentDay"`
    CurrentStopIdx  int              `json:"currentStopIdx"`
    Stops           []StopState      `json:"stops"`
    LastLocation    *Location        `json:"lastLocation"`
    StartedAt       time.Time        `json:"startedAt"`
    LastUpdated     time.Time        `json:"lastUpdated"`
    Alerts          []Alert          `json:"alerts"`
}

type StopState struct {
    StopID      string     `json:"stopId"`
    Status      string     `json:"status"` // upcoming, current, arrived, completed, skipped
    ArrivedAt   *time.Time `json:"arrivedAt"`
    CompletedAt *time.Time `json:"completedAt"`
    DwellTime   int        `json:"dwellTime"` // seconds spent at location
    UserRating  *int       `json:"userRating"`
}

// Redis key structure
// trip:{tripId}:state -> TripState (JSON)
// trip:{tripId}:location_history -> List of Location (for path reconstruction)
// user:{userId}:active_trip -> tripId (quick lookup)

// TTL: 24 hours after last update (auto-cleanup)
```

### Contextual Information Delivery

#### When User Arrives at Location

```go
func onArrival(tripState *TripState, stopID string) {
    stop := getStopDetails(stopID)

    // 1. Send arrival confirmation
    sendToClient(tripState.UserID, WSMessage{
        Type: MSG_ARRIVAL_DETECTED,
        Payload: ArrivalPayload{
            StopID:     stopID,
            StopName:   stop.Name,
            Confidence: 0.95,
        },
    })

    // 2. Send relevant tips from other users
    tips := getTipsForLocation(stopID)
    if len(tips) > 0 {
        sendToClient(tripState.UserID, WSMessage{
            Type: MSG_NEARBY_TIP,
            Payload: TipPayload{
                Tips: tips[:min(3, len(tips))],
                Source: "community",
            },
        })
    }

    // 3. Check for time-sensitive info
    if stop.Type == "restaurant" {
        sendToClient(tripState.UserID, WSMessage{
            Type: "info:contextual",
            Payload: map[string]interface{}{
                "type": "menu_suggestion",
                "message": "Local favorite: Bánh mì here is famous!",
                "source": "ai",
            },
        })
    }

    // 4. Update ETA for remaining stops
    recalculateSchedule(tripState)
}
```

#### Schedule Adjustment Logic

```go
func recalculateSchedule(tripState *TripState) {
    currentTime := time.Now()
    currentStopIdx := tripState.CurrentStopIdx

    var cumulativeDelay time.Duration

    for i := currentStopIdx; i < len(tripState.Stops); i++ {
        stop := &tripState.Stops[i]
        originalStartTime := stop.ScheduledStart

        // Adjust based on cumulative delay
        newStartTime := originalStartTime.Add(cumulativeDelay)

        // Check if this pushes into problematic territory
        if newStartTime.After(stop.Location.CloseTime) {
            // Stop would be closed - trigger reroute suggestion
            suggestReroute(tripState, i, "venue_closed")
            return
        }

        stop.AdjustedStart = newStartTime

        // If user is running late, track the delay
        if i == currentStopIdx && tripState.Stops[i].Status == "arrived" {
            actualArrival := *tripState.Stops[i].ArrivedAt
            expectedArrival := originalStartTime
            if actualArrival.After(expectedArrival) {
                cumulativeDelay = actualArrival.Sub(expectedArrival)
            }
        }
    }

    // Notify client of updated schedule
    sendToClient(tripState.UserID, WSMessage{
        Type: "schedule:updated",
        Payload: ScheduleUpdate{
            Delay:    cumulativeDelay.Minutes(),
            Stops:    tripState.Stops,
            NeedsAction: cumulativeDelay > 30*time.Minute,
        },
    })
}
```

### Handling Edge Cases

#### Poor GPS Signal

```go
func handlePoorSignal(reading LocationReading, tripState *TripState) {
    if reading.Accuracy > 100 { // More than 100m uncertainty
        // Don't make arrival decisions with poor data
        sendToClient(tripState.UserID, WSMessage{
            Type: "location:quality",
            Payload: map[string]interface{}{
                "quality": "poor",
                "message": "GPS signal weak. Move to open area for better accuracy.",
                "accuracy": reading.Accuracy,
            },
        })

        // Fall back to manual confirmation
        sendToClient(tripState.UserID, WSMessage{
            Type: "arrival:confirm_request",
            Payload: map[string]interface{}{
                "stopId": tripState.Stops[tripState.CurrentStopIdx].StopID,
                "stopName": tripState.Stops[tripState.CurrentStopIdx].Location.Name,
                "message": "Are you at this location?",
            },
        })
    }
}
```

#### User Goes Off-Route

```go
func checkOffRoute(location Location, tripState *TripState) {
    currentStop := tripState.Stops[tripState.CurrentStopIdx]
    nextStop := tripState.Stops[tripState.CurrentStopIdx+1]

    // Expected path: current → next
    expectedPath := []Location{currentStop.Location.Coords, nextStop.Location.Coords}

    // Calculate perpendicular distance from expected path
    distanceFromPath := perpendicularDistance(location, expectedPath)

    if distanceFromPath > 500 { // More than 500m off expected route
        // User might be exploring or lost
        sendToClient(tripState.UserID, WSMessage{
            Type: "route:off_track",
            Payload: map[string]interface{}{
                "distance": distanceFromPath,
                "options": []string{
                    "continue_exploring",
                    "return_to_route",
                    "skip_to_next_stop",
                },
            },
        })
    }
}
```

#### Battery Optimization

```go
// Adaptive tracking based on battery level
func getTrackingConfig(batteryLevel int) TrackingConfig {
    switch {
    case batteryLevel > 50:
        return TrackingConfig{
            Interval:  10 * time.Second,
            Accuracy:  AccuracyHigh,
            Geofencing: true,
        }
    case batteryLevel > 20:
        return TrackingConfig{
            Interval:  30 * time.Second,
            Accuracy:  AccuracyMedium,
            Geofencing: true,
        }
    default:
        // Low battery - minimal tracking
        return TrackingConfig{
            Interval:  0, // Geofencing only
            Accuracy:  AccuracyLow,
            Geofencing: true,
        }
    }
}
```

### Privacy Considerations

#### Data Minimization

```go
// Only collect what's necessary
type LocationUpdate struct {
    Lat       float64 `json:"lat"`
    Lng       float64 `json:"lng"`
    Accuracy  float64 `json:"accuracy"`
    Timestamp int64   `json:"ts"`
    // NO device ID, NO precise altitude, NO speed
}

// Location history retention
const (
    ACTIVE_TRIP_RETENTION  = 24 * time.Hour  // During trip
    COMPLETED_TRIP_RETENTION = 7 * 24 * time.Hour // After completion
    ANONYMIZED_RETENTION   = 90 * 24 * time.Hour // For analytics (no user ID)
)
```

#### User Controls

```typescript
// Client-side privacy settings
interface PrivacySettings {
  locationTracking: 'always' | 'while_using' | 'never';
  shareLocationWithCompanions: boolean;
  contributeToHeatmaps: boolean; // Anonymized aggregate data
  retainTripHistory: boolean;
}
```

### Manual Fallback (Current Implementation)

Since the current app is a demo without real GPS integration, we use manual controls:

```typescript
// Current UI allows manual state changes
const handleCompleteStop = () => {
  // User manually marks stop as complete
  updateStopStatus(currentStopId, 'completed');
  advanceToNextStop();
};

const handleSkipStop = () => {
  updateStopStatus(currentStopId, 'skipped');
  advanceToNextStop();
};
```

**For hackathon demo:** Manual buttons simulate what GPS + geofencing would do automatically.

**For production:** Replace manual controls with automatic detection, keeping manual override as fallback.

---

## AI Integration Details

### Request/Response Shapes

#### AI Optimization Request

```go
type OptimizationRequest struct {
    Itinerary      []ItineraryItem `json:"itinerary"`
    OptimizationType string        `json:"optimizationType"` // "route" | "time" | "budget" | "walking"
    Preferences    UserPreferences `json:"preferences"`
    Constraints    Constraints     `json:"constraints"`
}

type ItineraryItem struct {
    ID           string  `json:"id"`
    Name         string  `json:"name"`
    Type         string  `json:"type"`
    Latitude     float64 `json:"latitude"`
    Longitude    float64 `json:"longitude"`
    DurationMins int     `json:"durationMins"`
    Cost         int     `json:"cost"`         // In VND
    Rating       float64 `json:"rating"`
    OpenTime     string  `json:"openTime"`     // "06:00"
    CloseTime    string  `json:"closeTime"`    // "22:00"
}

type UserPreferences struct {
    Budget        string   `json:"budget"`        // "budget" | "moderate" | "premium"
    ActivityLevel string   `json:"activityLevel"` // "relaxed" | "moderate" | "active"
    Interests     []string `json:"interests"`     // ["food", "beach", "culture"]
}

type Constraints struct {
    StartTime    string `json:"startTime"`    // "08:00"
    EndTime      string `json:"endTime"`      // "20:00"
    MaxWalkingKm float64 `json:"maxWalkingKm"`
}
```

#### Prompt Template (Optimization)

```
You are an expert travel optimizer for Da Nang, Vietnam.

TASK: Optimize this itinerary for {optimizationType}.

CURRENT ITINERARY:
{itemsAsJson}

USER PREFERENCES:
- Budget level: {budget}
- Activity level: {activityLevel}
- Interests: {interests}

CONSTRAINTS:
- Day starts: {startTime}
- Day ends: {endTime}
- Maximum walking: {maxWalkingKm}km

OPTIMIZATION GOAL ({optimizationType}):
- route: Minimize total travel distance while respecting opening hours
- time: Maximize activities while keeping pace comfortable
- budget: Reduce costs while maintaining quality (rating > 4.0)
- walking: Minimize walking distance, cluster nearby activities

OUTPUT FORMAT (JSON only, no explanation):
{
  "optimizedItems": [
    { "id": "item_id", "newOrder": 1, "adjustedStartTime": "08:00", "adjustedDuration": 90 }
  ],
  "changes": [
    { "itemId": "item_id", "changeType": "moved", "reason": "Opens at 10am, moved later" }
  ],
  "summary": {
    "totalDistanceKm": 8.5,
    "totalDurationMins": 480,
    "estimatedCost": 850000
  }
}
```

#### AI Response Shape

```go
type OptimizationResponse struct {
    OptimizedItems []OptimizedItem `json:"optimizedItems"`
    Changes        []Change        `json:"changes"`
    Summary        Summary         `json:"summary"`
}

type OptimizedItem struct {
    ID                string `json:"id"`
    NewOrder          int    `json:"newOrder"`
    AdjustedStartTime string `json:"adjustedStartTime"`
    AdjustedDuration  int    `json:"adjustedDuration"`
}

type Change struct {
    ItemID     string `json:"itemId"`
    ItemName   string `json:"itemName"`
    ChangeType string `json:"changeType"` // "moved" | "duration_adjusted" | "removed"
    From       string `json:"from"`       // Original position/time
    To         string `json:"to"`         // New position/time
    Reason     string `json:"reason"`
}

type Summary struct {
    TotalDistanceKm   float64 `json:"totalDistanceKm"`
    TotalDurationMins int     `json:"totalDurationMins"`
    EstimatedCost     int     `json:"estimatedCost"`
}
```

#### Smart Replace Request

```go
type SmartReplaceRequest struct {
    CurrentItem   ItineraryItem   `json:"currentItem"`
    PreviousItem  *ItineraryItem  `json:"previousItem"`  // nullable
    NextItem      *ItineraryItem  `json:"nextItem"`      // nullable
    DayContext    DayContext      `json:"dayContext"`
    Alternatives  []ItineraryItem `json:"alternatives"`  // Pre-filtered from DB
    UserPrefs     UserPreferences `json:"userPrefs"`
}

type DayContext struct {
    DayNumber     int      `json:"dayNumber"`
    DayTheme      string   `json:"dayTheme"`
    CurrentTime   string   `json:"currentTime"`
    CompletedTypes []string `json:"completedTypes"` // Types already in this day
}
```

#### Smart Replace Prompt

```
You are helping a traveler find alternatives for one activity in their Da Nang itinerary.

CURRENT ITEM TO REPLACE:
{currentItemJson}

CONTEXT:
- Previous activity: {previousItem or "Start of day"}
- Next activity: {nextItem or "End of day"}
- Current time slot: {timeSlot}
- Day theme: {dayTheme}
- Activities already planned today: {completedTypes}

AVAILABLE ALTERNATIVES:
{alternativesJson}

USER PREFERENCES:
{userPrefsJson}

Categorize each alternative into ONE of these categories and provide a reason:
1. similar - Same type, comparable experience
2. higher_rated - Better reviews/quality
3. budget_friendly - Costs less than current
4. local_gem - High authenticity, off tourist path
5. best_for_moment - Best contextual fit given time/sequence

OUTPUT FORMAT (JSON only):
{
  "suggestions": [
    {
      "id": "alt_id",
      "category": "local_gem",
      "reason": "Authentic local breakfast spot, perfect after beach sunrise",
      "comparison": {
        "ratingDiff": 0.2,
        "costDiff": -50000,
        "durationDiff": -15
      }
    }
  ]
}
```

---

## Cost Analysis

### Token Estimation by Operation

| Operation | Input Tokens | Output Tokens | Total Tokens |
|-----------|--------------|---------------|--------------|
| Optimization (6 items) | ~1,200 | ~400 | ~1,600 |
| Optimization (12 items) | ~2,000 | ~600 | ~2,600 |
| Smart Replace | ~800 | ~300 | ~1,100 |
| Smart Reroute | ~1,000 | ~350 | ~1,350 |
| Trip Memory | ~500 | ~200 | ~700 |

### Claude 3.5 Sonnet Pricing (as of 2024)

- Input: $3.00 per 1M tokens
- Output: $15.00 per 1M tokens

### Cost Per Operation

```
Optimization (avg):
- Input: 1,600 tokens × $3/1M = $0.0048
- Output: 500 tokens × $15/1M = $0.0075
- Total: $0.0123 per optimization

Smart Replace:
- Input: 800 tokens × $3/1M = $0.0024
- Output: 300 tokens × $15/1M = $0.0045
- Total: $0.0069 per replace

Smart Reroute:
- Input: 1,000 tokens × $3/1M = $0.003
- Output: 350 tokens × $15/1M = $0.00525
- Total: $0.00825 per reroute

Trip Memory:
- Input: 500 tokens × $3/1M = $0.0015
- Output: 200 tokens × $15/1M = $0.003
- Total: $0.0045 per memory
```

### Monthly Cost Projection (10,000 MAU)

**Assumptions:**
- Each user optimizes 2 itineraries/month
- Each user does 3 smart replaces/month
- 20% of users do a live trip with 1 reroute
- 30% of users generate trip memory

```
Optimizations: 10,000 × 2 × $0.0123 = $246
Smart Replace: 10,000 × 3 × $0.0069 = $207
Smart Reroute: 10,000 × 0.2 × $0.00825 = $16.50
Trip Memory: 10,000 × 0.3 × $0.0045 = $13.50

Total AI Cost: ~$483/month
```

### Cost Reduction Strategies

**1. Response Caching (Redis)**
```go
// Cache optimization results for similar inputs
cacheKey := fmt.Sprintf("opt:%s:%s",
    hashItinerary(items),
    optimizationType)

if cached, err := redis.Get(ctx, cacheKey); err == nil {
    return cached // Skip AI call
}

// Cache for 1 hour
redis.Set(ctx, cacheKey, result, time.Hour)
```
**Impact:** 30-40% reduction (repeat optimizations are common)

**2. Prompt Compression**
```go
// Instead of full item details, send compressed version
type CompressedItem struct {
    ID   string `json:"i"`
    Type string `json:"t"`
    Lat  string `json:"la"` // Truncated to 4 decimals
    Lng  string `json:"lo"`
    Dur  int    `json:"d"`
}
```
**Impact:** 20-30% token reduction

**3. Batch Similar Requests**
```go
// Queue requests, process in batches every 500ms
type BatchRequest struct {
    UserID    string
    Request   OptimizationRequest
    ResponseCh chan OptimizationResponse
}

// Single AI call for multiple users with identical itineraries
```
**Impact:** 10-15% reduction during peak times

**4. Tiered Model Usage**
```go
// Use Haiku for simple operations, Sonnet for complex
func selectModel(request OptimizationRequest) string {
    if len(request.Itinerary) <= 4 {
        return "claude-3-haiku" // $0.25/$1.25 per 1M tokens
    }
    return "claude-3-5-sonnet"
}
```
**Impact:** 40-50% reduction on simple operations

---

## Future Improvements & Scaling

### When to Move Away from AI Models

#### Operations to Move to Deterministic Algorithms

| Operation | Current | Future | When to Switch |
|-----------|---------|--------|----------------|
| Route optimization | AI | Exact TSP solver (OR-Tools) | When >90% of routes are standard |
| Budget sorting | AI | DB query with ranking | Immediately - overkill for AI |
| Time scheduling | AI | Constraint solver | When patterns are well understood |

**Route Optimization Migration:**
```go
// Replace AI with Google OR-Tools
import "github.com/google/or-tools/go/constraintsolvers"

func optimizeRouteExact(items []ItineraryItem) []ItineraryItem {
    solver := constraintsolvers.NewRoutingSolver(len(items))

    // Add distance matrix
    for i := range items {
        for j := range items {
            solver.SetArcCost(i, j, distanceKm(items[i], items[j]))
        }
    }

    // Add time window constraints
    for i, item := range items {
        solver.AddTimeWindow(i, item.OpenTime, item.CloseTime)
    }

    return solver.Solve()
}
```

**Cost savings:** ~$200/month (eliminates optimization AI calls)

#### Operations Where AI Remains Valuable

1. **Smart Replace** - Context understanding is hard to encode
2. **Trip Memory** - Creative writing, personalization
3. **Smart Reroute** - Real-time reasoning with multiple factors
4. **Authenticity Scoring** - Sentiment analysis, language detection

### Fine-Tuning vs Prompting

**Current approach:** Zero-shot prompting with Claude

**When to fine-tune:**
- When we have 10,000+ optimization examples with human ratings
- When response consistency becomes critical
- When we need sub-100ms latency

**Fine-tuning considerations:**
```
Pros:
- 50-70% latency reduction
- More consistent output format
- Potentially cheaper (smaller model)

Cons:
- $3,000-10,000 fine-tuning cost
- Needs retraining when locations change
- Less flexible than prompting
```

**Recommendation:** Stay with prompting until:
1. We have enough training data
2. AI costs exceed $2,000/month
3. Latency becomes a user complaint

### Scaling Architecture

**Current (MVP):**
```
Single Go service → Railway
PostgreSQL → Railway managed
Redis → Railway managed
```

**10,000 users:**
```
Load Balancer
    ├── Go API (2 replicas)
    ├── Go AI Service (2 replicas)
    └── Go WebSocket (2 replicas)
PostgreSQL (read replica)
Redis (cluster mode)
```

**100,000 users:**
```
CDN (Cloudflare)
    └── Load Balancer (regional)
            ├── Go API (auto-scaling 2-10)
            ├── Go AI Service (auto-scaling 2-8)
            └── Go WebSocket (auto-scaling 2-20)
PostgreSQL (primary + 2 read replicas)
Redis (6-node cluster)
AI Response Cache (Redis, separate cluster)
```

---

## Infrastructure Costs

### Current (Hackathon/MVP)

| Service | Spec | Monthly Cost |
|---------|------|--------------|
| Railway (Go services) | 512MB RAM | $5 |
| Railway (PostgreSQL) | 1GB RAM | $10 |
| Railway (Redis) | 256MB | $5 |
| Domain + SSL | - | $1 |
| **Total** | | **~$21/month** |

### Production (10K users)

| Service | Spec | Monthly Cost |
|---------|------|--------------|
| Go API (2 replicas) | 2 vCPU, 4GB each | $40 |
| PostgreSQL | 2 vCPU, 8GB, 100GB | $50 |
| Redis | 1GB cluster | $15 |
| Object Storage | 50GB | $5 |
| AI Costs | ~$500/month | $500 |
| **Total** | | **~$610/month** |

### Cost Per User

```
10,000 MAU:
- Infrastructure: $110/month
- AI: $500/month
- Total: $610/month
- Per user: $0.061/month

Break-even:
- 5% premium conversion at $5/month = $2,500
- Profit margin: ~75%
```

---

## Security Considerations

1. **AI Prompt Injection Prevention**
```go
// Sanitize user input before including in prompts
func sanitizeForPrompt(input string) string {
    // Remove potential injection attempts
    input = strings.ReplaceAll(input, "```", "")
    input = strings.ReplaceAll(input, "SYSTEM:", "")
    input = strings.ReplaceAll(input, "Human:", "")
    return input
}
```

2. **Rate Limiting AI Endpoints**
```go
// Per-user limits
limiter := rate.NewLimiter(rate.Every(time.Minute), 10) // 10 AI calls/minute

func aiHandler(w http.ResponseWriter, r *http.Request) {
    userID := getUserID(r)
    if !limiter.Allow(userID) {
        http.Error(w, "Rate limit exceeded", 429)
        return
    }
    // Process AI request
}
```

3. **Cost Protection**
```go
// Monthly spending cap per user
const MaxAISpendPerUserPerMonth = 1.00 // $1.00

func checkBudget(userID string) bool {
    spent := redis.Get(ctx, fmt.Sprintf("ai_spend:%s:%s", userID, currentMonth()))
    return spent < MaxAISpendPerUserPerMonth
}
```

---

## Summary

| Component | Choice | Key Reason |
|-----------|--------|------------|
| Backend | Go | Cold start speed, memory efficiency, concurrency |
| Database | PostgreSQL | Relational data, geospatial queries, ACID |
| Cache | Redis | Session state, AI response caching |
| AI Provider | Claude | Structured output reliability, instruction following |
| Frontend | React + TypeScript | Component reuse, type safety, ecosystem |

**Current AI Strategy:** Prompt engineering with Claude 3.5 Sonnet
**Future AI Strategy:** Hybrid (deterministic algorithms + AI for creative/contextual tasks)
**Break-even:** ~4,000 monthly active users at 5% premium conversion
