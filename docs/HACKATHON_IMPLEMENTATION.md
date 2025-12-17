# Implementation

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
│ • Users         │ │ • Itinerary     │ │ • Trip State    │
│ • Itineraries   │ │   Generation    │ │ • Location      │
│ • Locations     │ │ • Optimization  │ │   Updates       │
│ • Trips         │ │ • Smart Replace │ │ • Notifications │
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
│  │ • Trips         │  │                 │  │                 │          │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Why Go for Backend?

| Factor | Go | Node.js |
|--------|-----|---------|
| **Performance** | Compiled, 10-40x faster | Interpreted, V8 overhead |
| **Concurrency** | Native goroutines | Event loop, callback-based |
| **Memory** | ~10MB per service | ~50-100MB per service |
| **Type Safety** | Compile-time errors | Runtime errors |
| **Deployment** | Single binary | Node modules + runtime |

**For Anvago specifically:**
- Route optimization requires heavy computation → Go excels
- Real-time trip tracking needs concurrent connections → goroutines handle thousands easily
- AI API calls benefit from Go's HTTP client performance

### Why React?

- **Component reuse**: Same UI components across web and mobile (React Native)
- **Ecosystem**: Rich library support for maps, animations, drag-and-drop
- **Developer velocity**: Fast iteration for hackathon timeline
- **TypeScript**: Catch frontend bugs before runtime

### Why PostgreSQL?

- **Reliability**: ACID transactions for booking and payment safety
- **JSON support**: Store flexible data (user preferences, AI responses) without schema changes
- **Geospatial**: Native support for location queries (latitude/longitude indexing)
- **Scalability**: Proven at scale (Instagram, Spotify, Uber)

---

## Core Features Implementation

### 1. AI-Powered Itinerary Generation

**Flow:**
```
User Preferences → Backend → Claude API → Parse & Store → Return to Client
```

**What we send to Claude:**
```
User wants: 3 days in Danang
- Persona: Solo traveler
- Vibe: Chill & Relax
- Interests: Beach, Local Food, Photography
- Budget: Mid-range
- Activity Level: Moderate

Available locations in database: [list of 200+ curated locations with metadata]

Generate a 3-day itinerary optimized for this user.
```

**What Claude returns:**
```json
{
  "days": [
    {
      "day": 1,
      "theme": "Beach & Local Flavors",
      "items": [
        { "locationId": "loc_123", "startTime": "06:00", "duration": 120, "reason": "Best sunrise spot, matches photography interest" },
        { "locationId": "loc_456", "startTime": "08:30", "duration": 45, "reason": "Highly-rated local breakfast, fits budget" }
      ]
    }
  ],
  "totalCost": 850000,
  "walkingDistance": "4.2km"
}
```

**Why Claude over other LLMs:**
- Best at following complex instructions
- Structured JSON output is reliable
- Understands context (vibe, persona) better than competitors

### 2. AI Optimization

**Types of optimization:**
| Type | What it does | Algorithm |
|------|--------------|-----------|
| **Route** | Minimize travel time between stops | Nearest-neighbor + AI refinement |
| **Budget** | Reduce costs while keeping quality | Filter + re-rank by price/rating ratio |
| **Time** | Fit more activities | Compress durations, remove low-value stops |
| **Walking** | Reduce physical effort | Cluster nearby locations together |

**Implementation:**
1. **Heuristic pass**: Fast algorithm gives baseline optimization
2. **AI refinement**: Claude reviews and improves with reasoning
3. **Return diff**: Show user what changed and why

### 3. Smart Replace

**Context-aware suggestions:**
```
Current item: "Bánh Mì Bà Lan" (breakfast, 8:30 AM)
Previous: "My Khe Beach" (beach, sunrise)
Next: "Han Market" (shopping, 10:00 AM)

AI considers:
- Same meal time → suggest other breakfast spots
- Near beach → suggest places in that area
- Before shopping → suggest something energizing
```

**Categories returned:**
- Similar (same category, comparable rating)
- Higher Rated (quality upgrade)
- Budget Friendly (cost reduction)
- Local Hidden Gems (authenticity focus)
- Best for This Moment (context-aware)

---

## Live Trip Tracking

### Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Mobile    │◄───────►│  WebSocket  │◄───────►│   Redis     │
│   Client    │         │   Server    │         │   Pub/Sub   │
└─────────────┘         └─────────────┘         └─────────────┘
                               │
                               ▼
                        ┌─────────────┐
                        │ PostgreSQL  │
                        │ (Persist)   │
                        └─────────────┘
```

### State Management

**Trip state stored in Redis (fast reads/writes):**
```json
{
  "tripId": "trip_abc123",
  "status": "active",
  "currentDay": 1,
  "currentStopIndex": 2,
  "stops": [
    { "id": "stop_1", "status": "completed", "completedAt": "2024-01-15T08:30:00Z" },
    { "id": "stop_2", "status": "completed", "completedAt": "2024-01-15T10:15:00Z" },
    { "id": "stop_3", "status": "current", "arrivedAt": "2024-01-15T11:00:00Z" },
    { "id": "stop_4", "status": "upcoming" }
  ],
  "lastUpdated": "2024-01-15T11:00:00Z"
}
```

**Persisted to PostgreSQL:**
- On every status change (completed, skipped)
- Every 5 minutes for active trips
- On trip completion

### Real-time Updates

**WebSocket events:**
```
Client → Server:
- stop:complete { stopId }
- stop:skip { stopId }
- day:advance
- location:update { lat, lng }

Server → Client:
- trip:state { full state }
- weather:alert { message, affectedStops }
- reroute:suggestion { reason, alternative }
```

### Smart Rerouting

**Triggers:**
1. Weather change (rain forecast)
2. User running late (> 30 min behind schedule)
3. Location closed unexpectedly
4. User skips multiple stops

**Process:**
```
Trigger detected
    → Query available alternatives from database
    → Send to Claude with context
    → Claude suggests swap with reasoning
    → Push suggestion to client via WebSocket
    → User accepts/rejects
    → Update trip state
```

---

## Cost Analysis

### AI Costs (Claude API)

| Operation | Tokens (avg) | Cost per call | Monthly (10K users) |
|-----------|--------------|---------------|---------------------|
| Generate itinerary | ~2,000 | $0.006 | $600 |
| Optimize itinerary | ~1,500 | $0.0045 | $450 |
| Smart replace | ~800 | $0.0024 | $240 |
| Smart reroute | ~1,000 | $0.003 | $150 |

**Total AI cost: ~$1,440/month for 10,000 active users**

### Infrastructure Costs

| Service | Specification | Monthly Cost |
|---------|---------------|--------------|
| Go API (2 instances) | 2 vCPU, 4GB RAM | $40 |
| PostgreSQL | 2 vCPU, 8GB RAM, 100GB | $50 |
| Redis | 1GB | $15 |
| Object Storage | 50GB | $5 |
| **Total** | | **~$110/month** |

### Cost per User

```
10,000 monthly active users:
- Infrastructure: $110
- AI costs: $1,440
- Total: $1,550

Cost per user: $0.155/month
```

**Revenue needed to break even:**
- Freemium: 5% convert to $5/month premium = $2,500 revenue
- Or: $0.50 per itinerary generation fee

---

## Data Flow Examples

### Creating an Itinerary

```
1. Client: POST /api/itineraries/generate
   Body: { destination, duration, preferences }

2. API Server:
   - Validate request
   - Fetch relevant locations from PostgreSQL
   - Build Claude prompt with locations + preferences
   - Call Claude API
   - Parse response
   - Store itinerary in PostgreSQL
   - Return itinerary to client

3. Client: Displays itinerary in Plan view
```

### Live Trip Progress

```
1. Client: WebSocket connect to /ws/trip/{tripId}

2. Server:
   - Authenticate connection
   - Load trip state from Redis
   - Subscribe to trip's Redis pub/sub channel
   - Send current state to client

3. User completes stop:
   Client → Server: { event: "stop:complete", stopId: "stop_3" }

4. Server:
   - Update Redis state
   - Persist to PostgreSQL
   - Check for schedule impact
   - If needed, trigger reroute suggestion
   - Broadcast new state to all connected clients (companions)

5. Client: Updates UI with new state
```

---

## Security Considerations

- **Authentication**: JWT tokens with short expiry (15 min), refresh tokens in HTTP-only cookies
- **API Rate Limiting**: 100 requests/minute per user (prevents AI cost abuse)
- **Data Encryption**: TLS in transit, AES-256 at rest for sensitive data
- **Input Validation**: All user input sanitized before database queries or AI prompts

---

## Scalability Path

**Current (Hackathon):**
- Single server, single database
- Handles ~1,000 concurrent users

**Phase 2 (Launch):**
- Horizontal scaling with load balancer
- Read replicas for PostgreSQL
- Redis cluster for session distribution
- Handles ~50,000 concurrent users

**Phase 3 (Scale):**
- Microservices split (Core, AI, Real-time)
- Database sharding by region
- CDN for static assets
- Handles ~500,000+ concurrent users

---

## Key Technical Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Backend language | Go | Performance for optimization algorithms, native concurrency |
| Frontend framework | React | Code sharing with mobile, rich ecosystem |
| Database | PostgreSQL | Reliability, JSON flexibility, geospatial support |
| AI provider | Claude (Anthropic) | Best instruction following, reliable JSON output |
| Real-time | WebSocket + Redis Pub/Sub | Low latency, scalable broadcast |
| Caching | Redis | Fast trip state access, session management |
| Hosting | Cloud Run / Railway | Easy deployment, auto-scaling |
