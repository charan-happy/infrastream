# InfraStream - Real-time DevOps Event Intelligence

## Architecture

```
GitHub Webhooks → /api/webhooks/github → Aiven Kafka → Worker → Aiven PostgreSQL
                                              ↓                        ↓
                                       Aiven Valkey (cache)    DORA Metrics
                                              ↓                        ↓
                                         SSE Stream ← ← ← ← ← API Routes
                                              ↓
                                     Next.js Dashboard (real-time)
```

## Tech Stack
- **Frontend**: Next.js 16 (App Router), Tailwind CSS v4, Recharts, Lucide Icons
- **Event Bus**: Aiven Kafka (free tier) - devops-events topic
- **Database**: Aiven PostgreSQL (free tier) - event store + DORA metrics
- **Cache**: Aiven Valkey (free tier) - real-time event cache + pub/sub
- **Demo Mode**: Works without any Aiven services using mock data

## Project Structure
```
src/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── events/page.tsx       # Event explorer
│   ├── metrics/page.tsx      # DORA metrics detail
│   ├── settings/page.tsx     # Service config + webhook setup
│   └── api/
│       ├── health/           # Service health check
│       ├── events/           # Event CRUD
│       ├── metrics/dora/     # DORA metrics calculator
│       ├── webhooks/github/  # GitHub webhook receiver
│       ├── stream/           # SSE real-time stream
│       └── worker/consume/   # Kafka consumer trigger
├── components/
│   ├── Sidebar.tsx           # Navigation
│   ├── MetricCard.tsx        # Stat card with trend
│   ├── EventCard.tsx         # Event display
│   ├── DORAChart.tsx         # DORA trend chart
│   ├── EventTimeline.tsx     # Live event feed with filters
│   └── ServiceStatus.tsx     # Aiven service indicators
└── lib/
    ├── types.ts              # TypeScript types
    ├── kafka.ts              # Kafka producer/consumer
    ├── db.ts                 # PostgreSQL pool + schema
    ├── valkey.ts             # Valkey cache + pub/sub
    └── demo-data.ts          # Mock data generator

## Key Features
1. **Real-time event streaming** - SSE from Valkey pub/sub
2. **DORA metrics** - Calculated from deployment/incident events
3. **GitHub webhook integration** - Push, PR, deploy, issue, CI events
4. **Demo mode** - Full UI works without any external services
5. **Dark theme** - Professional DevOps dashboard aesthetic

## Environment Variables
See .env.example for all required variables.

## Development
```bash
npm run dev    # Start dev server on :3000
npm run build  # Production build
```
```
