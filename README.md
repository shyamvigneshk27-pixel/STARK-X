# Traveloop — AI Travel Planner 🌍

Traveloop is a production-ready, full-stack web application designed to help users plan their dream trips. It features **ARIA**, an advanced AI travel co-pilot that generates detailed itineraries, including cost estimates, activities, and duration, based on simple user prompts.

## ✨ Features
- **ARIA AI Co-Pilot**: Anthropic-powered conversational AI with seamless fallback to OpenAI GPT-4o. Streams responses directly to the client via SSE.
- **Cinematic 3D UI**: Stunning glassmorphism design system built with Tailwind CSS, Framer Motion, and an interactive Three.js 3D globe.
- **Budget Dashboard**: Visualize spending across categories and cities using interactive Recharts components.
- **Interactive Routing**: See your entire trip mapped out dynamically with Leaflet.js and CartoDB dark tiles.
- **Robust Infrastructure**: Fully containerized with Docker, leveraging PostgreSQL for persistence and Redis for caching and rate limiting.

## 🛠️ Technology Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Zustand, Three.js (@react-three/fiber), Leaflet, Recharts.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, Redis, Winston (logging), Zod (validation).
- **AI**: `@anthropic-ai/sdk` (Claude 3.5 Sonnet) & `openai` (GPT-4o fallback).
- **Deployment**: Docker Compose.

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local development)

### Environment Setup
1. Clone the repository.
2. Copy the example `.env` files in both `client/` and `server/`:
   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```
3. Update `server/.env` with your API keys:
   ```
   OPENAI_API_KEY=your_openai_key
   ANTHROPIC_API_KEY=your_anthropic_key
   JWT_SECRET=your_secure_random_string
   ```

### Running with Docker (Production Mode)
```bash
docker-compose up --build -d
```
The application will be available at `http://localhost:80` (or `http://localhost:4173` if running the client manually). The backend API runs on port `4000`.

### Local Development
**1. Start Infra (DB + Redis)**
```bash
docker-compose up db redis -d
```
**2. Start Server**
```bash
cd server
npm install
npx prisma db push
npm run dev
```
**3. Start Client**
```bash
cd client
npm install
npm run dev
```

## 🧪 Testing
A comprehensive PowerShell QA script is included to test end-to-end workflows.
```powershell
cd server
.\qa_test.ps1
```

## 👥 Demo Account
- **Email:** demo@traveloop.com
- **Password:** Demo@1234
