# InfraStream

**Real-time DevOps Event Intelligence Platform** powered by [Aiven](https://aiven.io) free tier services.

Built for the [Aiven Free Tier Competition](https://aiven.io/free-tier-competition) #AivenFreeTier

## What it does

InfraStream captures DevOps events from GitHub webhooks and transforms them into actionable intelligence:

- **Live Event Stream** - Real-time feed of pushes, PRs, deployments, incidents, and CI builds
- **DORA Metrics** - Automated calculation of Deployment Frequency, Lead Time, Change Failure Rate, and MTTR
- **Performance Classification** - Elite/High/Medium/Low performer ratings based on DORA benchmarks
- **Trend Analysis** - 7/30/90 day historical charts for all metrics

## Aiven Services Used

| Service | Purpose |
|---------|---------|
| **Apache Kafka** | Event bus - GitHub webhooks are produced to `devops-events` topic |
| **PostgreSQL** | Event store - persistent storage + DORA metric calculations via SQL |
| **Valkey** | Real-time cache - recent events list, pub/sub for SSE streaming |

All three services run on Aiven's free tier.

## Architecture

```
GitHub Repo → Webhook → InfraStream API → Kafka → Worker → PostgreSQL
                                             ↓                    ↓
                                          Valkey          DORA Calculator
                                             ↓                    ↓
                                        SSE Stream ←←←←←← REST API
                                             ↓
                                      Live Dashboard
```

## Quick Start

```bash
# Clone and install
git clone https://github.com/charan-happy/infrastream.git
cd infrastream
npm install

# Run in demo mode (no Aiven services needed)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - the app works immediately with demo data.

## Connect to Aiven

1. Create free tier services at [aiven.io](https://aiven.io):
   - Apache Kafka
   - PostgreSQL
   - Valkey

2. Copy `.env.example` to `.env.local` and fill in your Aiven credentials

3. Create a Kafka topic named `devops-events`

4. Add a GitHub webhook pointing to `https://your-domain/api/webhooks/github`

5. Restart the dev server - events will flow through Kafka → PostgreSQL → Dashboard

## Tech Stack

- **Next.js 16** - App Router, Server Components, API Routes
- **Tailwind CSS v4** - Dark theme dashboard
- **Recharts** - DORA metric trend charts
- **KafkaJS** - Apache Kafka client
- **node-postgres** - PostgreSQL client
- **ioredis** - Valkey/Redis client

## The Story

As a DevOps engineer, I live the pain of scattered observability daily. Events from GitHub, CI/CD, monitoring, and incident management live in different tools with no unified view. InfraStream is the dashboard I wish I had - a single pane of glass that streams every DevOps event in real-time and automatically calculates the DORA metrics that matter.

Aiven's free tier made this possible by providing production-grade Kafka, PostgreSQL, and Valkey without any infrastructure management overhead. The event-driven architecture (webhook → Kafka → PostgreSQL) with Valkey as the real-time layer is exactly how I'd build this at scale - but running on free tier.

## License

MIT

---

Built with Aiven Free Tier #AivenFreeTier
