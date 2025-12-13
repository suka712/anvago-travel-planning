# 🌏 Anvago - Travel the World Your Way

> AI-powered travel planning with live routing and seamless transportation integration

[![Made to win](https://img.shields.io/badge/Made%20to-%20Win-00b14f?style=for-the-badge)](https://grab.com)

## 🎯 Overview

Anvago transforms travel planning from tedious research into an intelligent, personalized journey. By combining AI-powered recommendations, real-time local data (weather, traffic), and seamless Grab integration, we create experiences that feel like having a local friend guide you through every destination.

**Currently featuring: Danang, Vietnam** 🇻🇳

## ✨ Key Features

- **🎮 Gamified Onboarding** - Fun persona picker, Tinder-style vibe swiper, interest selector
- **🤖 AI Itinerary Generation** - Personalized trips based on your preferences, weather, and traffic
- **📍 Interactive Trip Planning** - Drag-and-drop editor with real-time map visualization
- **🚗 Grab Integration** - Book transportation directly from your itinerary
- **🌦️ Weather-Smart Routing** - Automatic adjustments based on weather forecasts
- **📱 Live Trip Tracking** - Follow your journey with smart notifications
- **✨ Premium Features** - AI optimization, local gems discovery, advanced booking

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite + TailwindCSS v4
- Framer Motion (animations)
- React Query (TanStack)
- Mapbox GL JS
- Zustand (state management)

### Backend
- Node.js + Express + TypeScript
- Prisma ORM + PostgreSQL
- Passport.js (JWT + OAuth)
- Google Gemini AI
- OpenWeatherMap API

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 16+
- API Keys (see `env.example`)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/anvago-travel-planning-v2.git
cd anvago-travel-planning-v2

# Install dependencies
pnpm install

# Setup environment variables
cp env.example .env
# Edit .env with your API keys

# Setup database
pnpm db:push
pnpm db:seed

# Start development servers
pnpm dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Demo Credentials

```
Admin: admin@anvago.com / admin123
Demo User: demo@anvago.com / demo123
```

## 📁 Project Structure

```
anvago-travel-planning-v2/
├── docs/                    # Documentation
│   ├── DESIGN_SYSTEM.md    # UI/UX specifications
│   └── REQUIREMENTS.md     # Full PRD
├── packages/
│   ├── client/             # React frontend
│   │   ├── src/
│   │   │   ├── components/ # UI components
│   │   │   ├── pages/      # Route pages
│   │   │   ├── stores/     # Zustand stores
│   │   │   └── services/   # API clients
│   ├── server/             # Node.js backend
│   │   ├── src/
│   │   │   ├── routes/     # API routes
│   │   │   ├── services/   # Business logic
│   │   │   └── middleware/ # Auth, validation
│   │   └── prisma/         # Database schema
│   └── shared/             # Shared types
└── turbo.json              # Monorepo config
```

## 🎨 Design System

Anvago uses a bold, playful design language:

- **Colors**: Sky blue primary (#4FC3F7), black borders, offset shadows
- **Typography**: DM Sans font family
- **Components**: Cards with hover lift effects, buttons with press feedback
- **Animations**: Smooth transitions, staggered reveals

See `docs/DESIGN_SYSTEM.md` for full specifications.

## 📱 User Flows

1. **Onboarding** - Gamified questionnaire → AI generates itineraries
2. **Planning** - Drag-and-drop editor → Optimize with AI → Book transport
3. **Traveling** - Live tracking → Smart notifications → Adaptive scheduling

## 🔑 API Keys Needed

| Service | Purpose | Get it from |
|---------|---------|-------------|
| Google Places | Location data | Google Cloud Console |
| Mapbox | Maps & directions | mapbox.com |
| OpenWeatherMap | Weather data | openweathermap.org |
| Google Gemini | AI generation | Google AI Studio |

## 🗓️ Development Timeline

| Days | Focus |
|------|-------|
| 1-2 | Foundation (monorepo, DB, auth, UI components) ✅ |
| 3-4 | Onboarding flow + AI generation |
| 5-6 | Trip planning + Map integration |
| 7-8 | Active trip + Admin panel |
| 9 | Polish + Testing + Deployment |

## 👥 Team

Built with ❤️ for the Grab Hackathon 2024

## 📄 License

MIT

