<p align="center">
  <img src="https://img.shields.io/badge/⚡-InfraStream-10b981?style=for-the-badge&labelColor=000000" alt="InfraStream" />
</p>

<h1 align="center">InfraStream</h1>

<p align="center">
  <strong>Real-time DevOps Event Intelligence — Your Single Pane of Glass for DORA Metrics, Incident Correlation, and Deployment Analytics</strong>
</p>

<p align="center">
  <a href="https://aiven.io/free-tier-competition"><img src="https://img.shields.io/badge/Aiven-Free%20Tier%20Competition-ff5733?style=flat-square&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIi8+PC9zdmc+" alt="Aiven Competition" /></a>
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Kafka-KafkaJS-231f20?style=flat-square&logo=apachekafka&logoColor=white" alt="Kafka" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169e1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Valkey-Cache-dc382d?style=flat-square&logo=redis&logoColor=white" alt="Valkey" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT License" />
</p>

<p align="center">
  <a href="https://infrastream.healops.online">Live Demo</a> · <a href="https://github.com/charan-happy/infrastream">GitHub</a> · <a href="#quick-start">Quick Start</a> · <a href="#api-reference">API Docs</a>
</p>

---

## The Problem

DevOps teams are drowning in tools. A typical engineering org juggles **10+ platforms** daily:

| Category | Tools |
|----------|-------|
| Source Control | GitHub, GitLab, Bitbucket |
| CI/CD | GitHub Actions, Jenkins, CircleCI, ArgoCD |
| Monitoring | Datadog, Grafana, Prometheus, New Relic |
| Incidents | PagerDuty, Opsgenie, Statuspage |
| Communication | Slack, Discord, Teams |

The result?

- **No single pane of glass** — engineers context-switch between 5+ tabs to understand what happened
- **DORA metrics require expensive tools** — Sleuth, LinearB, and Swarmia charge $20-50/dev/month
- **Incident-deploy correlation is manual** — "Was it the last deploy?" requires digging through 3 dashboards
- **Cost-per-deploy is invisible** — nobody knows what each deployment actually costs
- **Team performance is a black box** — no deploy streaks, no contributor leaderboards, no data-driven standups

## The Solution

**InfraStream** is a real-time DevOps event intelligence platform that unifies all your engineering events into a single, live-streaming dashboard — at **$0/month** using Aiven's free tier.

One webhook. All your data. Zero vendor lock-in.

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  GitHub Repos   │────▶│  GitHub Webhook │────▶│  InfraStream    │
│  (push, PR,     │     │  (x-hub-sig256) │     │  /api/webhooks/ │
│   deploy, CI)   │     │                 │     │  github         │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
┌─────────────────┐                                      │
│                 │                              ┌───────▼────────┐
│  HealOps        │─────────────────────────────▶│                │
│  (self-healing  │  POST /api/webhooks/healops  │  Event Router  │
│   platform)     │                              │                │
│                 │                              └──┬──────┬──────┘
└─────────────────┘                                 │      │
                                                    │      │
                        ┌───────────────────────────┘      │
                        │                                  │
                ┌───────▼────────┐                ┌───────▼────────┐
                │                │                │                │
                │  Aiven Kafka   │                │  Aiven Valkey  │
                │  ─────────────│                │  ─────────────│
                │  Topic:        │                │  • Recent      │
                │  devops-events │                │    events list │
                │                │                │  • Pub/Sub for │
                │  (event bus    │                │    SSE stream  │
                │   when avail.) │                │  • API cache   │
                │                │                │    (TTL: 300s) │
                └───────┬────────┘                └───────┬────────┘
                        │                                  │
                ┌───────▼────────┐                         │
                │                │                         │
                │  Worker        │                         │
                │  /api/worker/  │                         │
                │  consume       │                         │
                │                │                         │
                └───────┬────────┘                         │
                        │                                  │
                ┌───────▼────────┐                ┌───────▼────────┐
                │                │                │                │
                │  Aiven         │                │  SSE Stream    │
                │  PostgreSQL    │                │  /api/stream   │
                │  ─────────────│                │  ─────────────│
                │  • events      │───────────────▶│  Real-time     │
                │  • dora_       │  SQL queries   │  event push    │
                │    snapshots   │                │  to browser    │
                │  • indexes on  │                │                │
                │    type, repo, │                └───────┬────────┘
                │    created_at  │                        │
                │                │                ┌───────▼────────┐
                └────────────────┘                │                │
                                                  │  Next.js       │
                                                  │  Dashboard     │
                                                  │  ─────────────│
                                                  │  9 pages       │
                                                  │  Dark theme    │
                                                  │  Live updates  │
                                                  │                │
                                                  └────────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 16 (App Router) | Server components, API routes, SSE streaming |
| **Language** | TypeScript 5 | End-to-end type safety |
| **UI** | Tailwind CSS v4 | Dark-themed DevOps dashboard |
| **Charts** | Recharts 3 | DORA trend lines, cost breakdowns, healing timelines |
| **Icons** | Lucide React | 11 navigation icons, status indicators |
| **Event Bus** | Aiven Kafka (KafkaJS) | Durable event streaming via `devops-events` topic |
| **Database** | Aiven PostgreSQL (node-postgres) | Event store, DORA calculations via SQL aggregation |
| **Cache** | Aiven Valkey (ioredis) | Real-time event cache, pub/sub for SSE, API response caching |
| **Date Utils** | date-fns 4 | Timestamp formatting and relative time |

---

## Features

### 1. Real-time Event Streaming

Events flow from GitHub webhooks through Kafka into your browser via **Server-Sent Events (SSE)**. The `/api/stream` endpoint polls PostgreSQL for new events every 3 seconds and pushes them to connected clients. Valkey pub/sub provides the real-time bridge — every webhook received is immediately published to all connected dashboards.

Supported event types: `push`, `pull_request`, `deployment`, `incident`, `alert`, `build`

### 2. DORA Metrics (Auto-Calculated)

All four DORA metrics are computed directly from your event data via SQL aggregation:

| Metric | How It's Calculated | Classification |
|--------|-------------------|----------------|
| **Deployment Frequency** | `COUNT(deployments) / days` | Elite: multiple/day, High: daily, Medium: weekly, Low: monthly |
| **Lead Time for Changes** | Time from PR merge to production deploy | Elite: <1hr, High: <1day, Medium: <1week, Low: >1month |
| **Change Failure Rate** | `failed_deploys / total_deploys * 100` | Elite: 0-5%, High: 5-10%, Medium: 10-15%, Low: >15% |
| **Mean Time to Recovery** | `AVG(incident_resolved - incident_created)` | Elite: <1hr, High: <1day, Medium: <1week, Low: >1month |

Supports `last_7_days`, `last_30_days`, and `last_90_days` period selection with full historical trend charts.

### 3. Incident-Deploy Correlation

Visual timelines that answer the question every on-call engineer asks: **"Was it the last deploy?"**

Each incident shows:
- **Suspected deploy** — the deployment closest to incident creation with commit details
- **TTD** (Time to Detect) — minutes from deploy to first alert
- **TTR** (Time to Resolve) — minutes from incident creation to resolution
- **Affected services** — which components were impacted
- **Full timeline** — deploy → alert → incident → investigation → resolution, step by step

### 4. Cost-per-Deploy Tracking

Track the true cost of every deployment across three dimensions:

| Cost Type | Source |
|-----------|--------|
| **Build Cost** | CI minutes x $0.008/min |
| **Compute Cost** | Deployment compute resources |
| **Infra Cost** | Infrastructure overhead |

Includes per-repo cost summaries, cost trend analysis (percentage change), and a 30-day cost history chart with build/compute/infra breakdown.

### 5. Team Leaderboard

Data-driven team insights for standups and retrospectives:

- **Deploy count** per team member (successful vs. failed)
- **Deploy streaks** — consecutive successful deployments
- **PRs merged** and **commits** count
- **Incidents resolved** — who's putting out the fires
- **Average lead time** — individual developer velocity

### 6. Multi-Repo Aggregation

See all your repositories in one view with per-repo DORA metrics:

- Total events, deployments, and incidents per repository
- Per-repo success rate percentage
- Individual DORA metrics (deployment frequency, lead time, CFR, MTTR)
- Last deploy timestamp
- Sorted by activity level

### 7. HealOps Integration

Deep integration with [HealOps](https://healops.online), a self-healing code platform:

- **Before/After DORA comparison** — measurable improvement after enabling auto-healing
- **Healing events feed** — security fixes, dependency updates, config fixes, code quality, performance fixes
- **Repo health radar** — per-repo health scores across 5 categories (security, dependencies, code quality, configuration, performance)
- **Healing timeline** — 30-day view of detected vs. healed vs. failed issues
- **Auto-fix rate** — percentage of issues resolved automatically via PR
- **Confidence scores** — AI confidence level for each healing action (0-100%)

### 8. Slack & Discord Notifications

Configure notification channels to alert your team on critical events:

- **Channel types**: Slack (Block Kit attachments) and Discord (rich embeds)
- **Event filters**: Choose which event types trigger notifications (incident, deployment, etc.)
- **Severity filters**: Only notify on critical, warning, or all severities
- **Color-coded**: Red for critical, amber for warning, green for info
- **Test notifications**: Send a test alert to verify webhook configuration

### 9. CSV & JSON Export

Export your data for external analysis:

| Export Type | Formats | Fields |
|-------------|---------|--------|
| **Events** | CSV, JSON | ID, type, repo, branch, title, status, severity, author, timestamp |
| **DORA Metrics** | CSV, JSON | Date, deployment frequency, lead time, CFR, MTTR |

Downloaded files are timestamped: `infrastream-events-2026-03-22.csv`

### 10. Grafana Dashboards (21 Panels)

Pre-built Grafana dashboard with full DevOps observability:

| Panel | Type | Description |
|-------|------|-------------|
| Deployment Frequency | Time series | Deploys per day over time |
| Lead Time for Changes | Time series | Hours from commit to production |
| Change Failure Rate | Gauge | Current failure percentage |
| MTTR | Stat | Mean time to recovery |
| Events by Type | Pie chart | Push, PR, deploy, incident, alert, build distribution |
| Events by Severity | Bar chart | Info, warning, critical breakdown |
| Events by Repository | Table | Per-repo event counts |
| Active Incidents | Stat | Currently open incidents |
| Success Rate | Gauge | Overall deployment success percentage |
| Deploy Cost Trend | Time series | Daily cost breakdown (build, compute, infra) |
| Top Deployers | Bar chart | Team member deployment counts |
| Deploy Streaks | Table | Consecutive successful deploy leaderboard |
| Incident Timeline | Annotations | Overlay incidents on deploy chart |
| Repo Health Scores | Heatmap | HealOps health scores per repository |
| Healing Activity | Time series | Issues detected vs. healed over time |
| Auto-Fix Rate | Gauge | Percentage of auto-healed issues |
| Cost per Deploy | Stat | Average cost across all deploys |
| PR Merge Rate | Time series | PRs merged per day |
| Build Success Rate | Gauge | CI pass/fail ratio |
| Event Throughput | Time series | Total events per minute |
| User Activity | Table | Per-user actions, last active, top repos |

---

## Aiven Services — How Each Is Used

### Apache Kafka (Event Bus)

```
Topic: devops-events
Client ID: infrastream
Auth: SASL/PLAIN over SSL
```

- Receives every webhook event as a Kafka message with the event ID as the key
- Worker consumer group (`infrastream-worker`) processes messages and stores them in PostgreSQL
- Provides durable, ordered event streaming — if the worker is down, events queue in Kafka
- **Graceful degradation**: If Kafka is unavailable, events are written directly to PostgreSQL

### PostgreSQL (Event Store + DORA Engine)

```sql
-- Core tables
events (id UUID, type, source, repo, branch, title, description,
        severity, status, author, avatar_url, metadata JSONB,
        created_at TIMESTAMPTZ, processed_at TIMESTAMPTZ)

dora_snapshots (id SERIAL, period, deployment_frequency,
               lead_time, change_failure_rate, mttr, calculated_at)

-- Performance indexes
idx_events_type, idx_events_repo, idx_events_created, idx_events_severity
```

- All DORA metrics are calculated via SQL aggregation queries against the events table
- JSONB metadata column stores the full GitHub webhook payload for audit trails
- Connection pooling with max 5 connections and SSL enabled
- Schema auto-initializes on first connection via `initSchema()`

### Valkey (Real-time Layer)

```
Namespace: infrastream:*
Protocol: Redis (ioredis) over TLS
```

| Key Pattern | Type | TTL | Purpose |
|-------------|------|-----|---------|
| `infrastream:recent_events` | List | None | Last 100 events for instant dashboard load |
| `infrastream:events` | Pub/Sub | N/A | Real-time event broadcast to SSE clients |
| `infrastream:events:*` | String | 30s | Cached API responses for event queries |
| `infrastream:dora:*` | String | 60s | Cached DORA metric calculations |

- Every webhook immediately publishes to Valkey for sub-second dashboard updates
- Recent events list is capped at 100 entries via `LTRIM`
- API response caching reduces PostgreSQL load for repeated queries

---

## Data Flow

```
                            ┌─────────────────────────────────┐
                            │         WEBHOOK INGRESS         │
                            └──────────────┬──────────────────┘
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    │                                             │
          ┌─────────▼─────────┐                       ┌──────────▼──────────┐
          │  GitHub Webhook   │                       │  HealOps Webhook    │
          │  ────────────────│                       │  ─────────────────│
          │  POST /api/       │                       │  POST /api/         │
          │  webhooks/github  │                       │  webhooks/healops   │
          │                   │                       │                     │
          │  • HMAC-SHA256    │                       │  • API key auth     │
          │    signature      │                       │  • Event type       │
          │    verification   │                       │    mapping          │
          │  • Event type     │                       │  • Auto-notify on   │
          │    mapping        │                       │    critical events  │
          └─────────┬─────────┘                       └──────────┬──────────┘
                    │                                             │
                    └──────────────────────┬──────────────────────┘
                                           │
                              ┌────────────▼────────────┐
                              │    UNIFIED EVENT MAP    │
                              │  ─────────────────────│
                              │  { type, source, repo, │
                              │    branch, title,       │
                              │    severity, status,    │
                              │    author, metadata }   │
                              └──────┬─────────┬────────┘
                                     │         │
                    ┌────────────────┘         └────────────────┐
                    │                                           │
          ┌─────────▼─────────┐                     ┌──────────▼──────────┐
          │  Kafka Producer   │                     │  Valkey Publisher    │
          │  (if available)   │                     │  (always)           │
          │                   │                     │                     │
          │  Fallback: direct │                     │  • LPUSH to recent  │
          │  PG insert        │                     │    events list      │
          │                   │                     │  • PUBLISH to SSE   │
          └─────────┬─────────┘                     │    channel          │
                    │                               └──────────┬──────────┘
          ┌─────────▼─────────┐                                │
          │  Kafka Consumer   │                     ┌──────────▼──────────┐
          │  Worker           │                     │  SSE Stream         │
          │  ────────────────│                     │  /api/stream        │
          │  INSERT INTO      │                     │  ─────────────────│
          │  events table     │                     │  ReadableStream     │
          └─────────┬─────────┘                     │  → Browser          │
                    │                               └─────────────────────┘
          ┌─────────▼─────────┐
          │  API Routes       │
          │  ────────────────│
          │  Cache → DB →     │
          │  Demo fallback    │
          └─────────┬─────────┘
                    │
          ┌─────────▼─────────┐
          │  Dashboard Pages  │
          │  (9 pages)        │
          └───────────────────┘
```

---

## Quick Start

### Demo Mode (No Aiven Required)

```bash
# Clone the repository
git clone https://github.com/charan-happy/infrastream.git
cd infrastream

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the app works immediately with realistic demo data. No Aiven credentials, no database setup, no configuration needed.

Demo mode generates realistic events, DORA metrics, incident correlations, cost data, team stats, and HealOps healing events.

### Production Build

```bash
npm run build
npm start
```

---

## Production Setup (Aiven Services)

### 1. Create Aiven Free Tier Services

Sign up at [aiven.io](https://aiven.io) and create three free-tier services:

- **Apache Kafka** — create a topic named `devops-events`
- **PostgreSQL** — schema auto-initializes on first connection
- **Valkey** — no configuration needed

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Fill in your Aiven credentials:

```env
# Aiven Kafka (Free Tier)
KAFKA_BROKER=kafka-xxx.aiven.com:12345
KAFKA_USERNAME=avnadmin
KAFKA_PASSWORD=your-kafka-password

# Aiven PostgreSQL (Free Tier)
PG_CONNECTION_URI=postgres://avnadmin:your-password@pg-xxx.aiven.com:12345/defaultdb?sslmode=require

# Aiven Valkey (Free Tier)
VALKEY_URI=rediss://default:your-password@valkey-xxx.aiven.com:12345

# GitHub Webhook Secret (optional, for signature verification)
GITHUB_WEBHOOK_SECRET=your-webhook-secret

# HealOps API Key (optional, for webhook auth)
HEALOPS_API_KEY=your-healops-key
```

### 3. Configure GitHub Webhook

In your GitHub repository settings:

- **Payload URL**: `https://your-domain/api/webhooks/github`
- **Content type**: `application/json`
- **Secret**: (same as `GITHUB_WEBHOOK_SECRET`)
- **Events**: Select "Send me everything" or choose: Pushes, Pull requests, Deployments, Issues, Check runs

### 4. Start the Server

```bash
npm run dev    # Development
npm run build && npm start  # Production
```

The `/api/health` endpoint will show connection status for all three Aiven services.

---

## API Reference

### Webhook Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/webhooks/github` | GitHub webhook receiver — maps push, PR, deploy, issue, check events |
| `POST` | `/api/webhooks/healops` | HealOps webhook receiver — maps healing events to DevOps events |

### Data Endpoints

| Method | Endpoint | Query Params | Description |
|--------|----------|-------------|-------------|
| `GET` | `/api/events` | `type`, `repo`, `severity`, `limit`, `offset` | List events with filtering and pagination |
| `GET` | `/api/metrics/dora` | `period` (7/30/90 days), `history=true` | DORA metrics with optional trend history |
| `GET` | `/api/repos` | — | Per-repo summaries with individual DORA scores |
| `GET` | `/api/incidents` | — | Incident-deploy correlations with timelines |
| `GET` | `/api/costs` | `view` (deploys/repos/history), `days` | Deployment cost tracking and breakdowns |
| `GET` | `/api/team` | — | Team member stats, streaks, and leaderboard |
| `GET` | `/api/stream` | — | SSE endpoint — real-time event stream (5 min timeout) |
| `GET` | `/api/health` | — | Service health check (Kafka, PostgreSQL, Valkey) |
| `GET` | `/api/export` | `type` (events/dora), `format` (csv/json) | Export data as CSV or JSON download |

### HealOps Endpoints

| Method | Endpoint | Query Params | Description |
|--------|----------|-------------|-------------|
| `GET` | `/api/healops/stats` | — | HealOps stats, repo health, timeline, DORA comparison |
| `GET` | `/api/healops/events` | `type`, `status`, `limit` | Healing events with filtering |

### Notification Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/notifications` | List all notification channels |
| `POST` | `/api/notifications` | Create a new Slack/Discord channel |
| `PUT` | `/api/notifications` | Update channel configuration |
| `DELETE` | `/api/notifications?id=` | Remove a notification channel |
| `POST` | `/api/notifications/test` | Send a test notification to all enabled channels |

### Worker Endpoint

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/worker/consume` | Trigger Kafka consumer to process queued events |

---

## Pages

### 1. Dashboard (`/`)
The command center. Live event timeline with real-time SSE updates, DORA metric summary cards with trend indicators, service status badges (Kafka, PostgreSQL, Valkey), and top repository activity.

### 2. Events (`/events`)
Full event explorer with filtering by type (push, PR, deployment, incident, alert, build), repository, and severity. Paginated list with event cards showing author avatars, timestamps, and status badges.

### 3. DORA Metrics (`/metrics`)
Deep dive into all four DORA metrics with period selection (7/30/90 days). Recharts trend lines show historical performance. Each metric displays its DORA classification (Elite/High/Medium/Low) with color coding.

### 4. Repositories (`/repos`)
Multi-repo aggregation view. Each repository shows total events, deployment count, incident count, success rate, and individual DORA metrics. Sorted by activity level for quick prioritization.

### 5. Incidents (`/incidents`)
Incident-deploy correlation dashboard. Visual timelines show the sequence from deploy to alert to incident to resolution. TTD and TTR metrics prominently displayed. Suspected deploys linked with commit messages and authors.

### 6. Cost Tracking (`/costs`)
Deployment cost analytics with three views: per-deploy cost breakdown (build, compute, infra), per-repo cost summary with trend analysis, and a 30-day cost history chart with stacked area visualization.

### 7. Team (`/team`)
Team leaderboard showing deployments, PRs merged, commits, incidents resolved, and deploy streaks per member. Avatar-based cards with individual lead time metrics for data-driven standups.

### 8. HealOps (`/healops`)
HealOps integration dashboard. Before/after DORA comparison chart showing measurable improvement. Repo health radar with scores across 5 categories. Healing event timeline with status indicators (detected, diagnosing, healing, healed, failed). Auto-fix rate and confidence scores.

### 9. Settings (`/settings`)
Service configuration page. Shows connection status for all three Aiven services. Webhook URL display for easy GitHub setup. Notification channel management (add/edit/remove Slack and Discord webhooks). Test notification trigger.

---

## HealOps Integration

[HealOps](https://healops.online) is a self-healing code platform that automatically detects and fixes issues in your repositories. InfraStream provides deep integration through a dedicated webhook endpoint.

### Webhook API

```bash
curl -X POST https://infrastream.healops.online/api/webhooks/healops \
  -H "Content-Type: application/json" \
  -H "x-healops-key: your-api-key" \
  -d '{
    "event_type": "healing_complete",
    "repo": "charan-happy/healops-test-repo",
    "branch": "main",
    "title": "Fixed CVE-2026-1234: XSS vulnerability",
    "description": "Auto-patched input sanitization",
    "severity": "critical",
    "status": "healed",
    "healing_type": "security_fix",
    "confidence": 95,
    "auto_fix": true,
    "pr_number": 142,
    "pr_url": "https://github.com/charan-happy/healops-test-repo/pull/142",
    "time_to_heal": 12
  }'
```

### Event Type Mapping

| HealOps Event | InfraStream Type | Description |
|---------------|-----------------|-------------|
| `issue_detected` | `alert` | New issue found during scan |
| `healing_started` | `build` | Healing process initiated |
| `healing_complete` | `deployment` | Issue successfully healed |
| `healing_failed` | `incident` | Healing attempt failed |
| `pr_created` | `pull_request` | Fix PR created |
| `scan_complete` | `push` | Repository scan finished |

### What Data Flows

- **Healing events**: Security fixes, dependency updates, config fixes, code quality improvements, performance fixes, infrastructure issues
- **Repo health scores**: Per-repo health across security, dependencies, code quality, configuration, and performance (0-100 scale)
- **DORA impact**: Before/after comparison showing deployment frequency improvement (+300%), lead time reduction (-86%), CFR reduction (-74%), MTTR reduction (-82%)
- **Auto-fix metrics**: Percentage of issues resolved automatically, confidence scores, time-to-heal

---

## Grafana Dashboard

InfraStream is designed to work with Grafana for production monitoring. Connect Grafana to the same Aiven PostgreSQL instance and use these 21 panels:

### DORA Metrics Row
| # | Panel | Type | Query |
|---|-------|------|-------|
| 1 | Deployment Frequency | Time series | `SELECT date_trunc('day', created_at), COUNT(*) FROM events WHERE type='deployment' AND status='success' GROUP BY 1` |
| 2 | Lead Time for Changes | Time series | `SELECT date_trunc('day', created_at), AVG(EXTRACT(EPOCH FROM (processed_at - created_at))/3600) FROM events WHERE type='deployment' GROUP BY 1` |
| 3 | Change Failure Rate | Gauge | `SELECT (failed::float / total * 100) FROM (SELECT COUNT(*) FILTER (WHERE status='failure') as failed, COUNT(*) as total FROM events WHERE type='deployment') t` |
| 4 | MTTR | Stat | `SELECT AVG(EXTRACT(EPOCH FROM (processed_at - created_at))/3600) FROM events WHERE type='incident' AND processed_at IS NOT NULL` |

### Events Overview Row
| # | Panel | Type | Query |
|---|-------|------|-------|
| 5 | Events by Type | Pie chart | `SELECT type, COUNT(*) FROM events GROUP BY type` |
| 6 | Events by Severity | Bar chart | `SELECT severity, COUNT(*) FROM events GROUP BY severity` |
| 7 | Events by Repository | Table | `SELECT repo, COUNT(*) FROM events GROUP BY repo ORDER BY 2 DESC` |
| 8 | Active Incidents | Stat | `SELECT COUNT(*) FROM events WHERE type='incident' AND status!='success'` |
| 9 | Success Rate | Gauge | `SELECT (COUNT(*) FILTER (WHERE status='success')::float / COUNT(*) * 100) FROM events` |

### Deployment Analytics Row
| # | Panel | Type |
|---|-------|------|
| 10 | Deploy Cost Trend | Time series |
| 11 | Top Deployers | Bar chart |
| 12 | Deploy Streaks | Table |
| 13 | Incident Timeline | Annotations overlay |

### HealOps Row
| # | Panel | Type |
|---|-------|------|
| 14 | Repo Health Scores | Heatmap |
| 15 | Healing Activity | Time series |
| 16 | Auto-Fix Rate | Gauge |

### Operations Row
| # | Panel | Type |
|---|-------|------|
| 17 | Cost per Deploy | Stat |
| 18 | PR Merge Rate | Time series |
| 19 | Build Success Rate | Gauge |
| 20 | Event Throughput | Time series |
| 21 | User Activity | Table |

---

## Project Structure

```
infrastream/
├── src/
│   ├── app/
│   │   ├── layout.tsx                         # Root layout with Sidebar
│   │   ├── page.tsx                           # Dashboard (home)
│   │   ├── events/page.tsx                    # Event explorer
│   │   ├── metrics/page.tsx                   # DORA metrics deep dive
│   │   ├── repos/page.tsx                     # Multi-repo aggregation
│   │   ├── incidents/page.tsx                 # Incident-deploy correlation
│   │   ├── costs/page.tsx                     # Cost tracking analytics
│   │   ├── team/page.tsx                      # Team leaderboard
│   │   ├── healops/page.tsx                   # HealOps integration
│   │   ├── settings/page.tsx                  # Service config & notifications
│   │   ├── globals.css                        # Tailwind CSS v4
│   │   └── api/
│   │       ├── health/route.ts                # GET  — service health check
│   │       ├── events/route.ts                # GET  — filtered event list
│   │       ├── metrics/dora/route.ts          # GET  — DORA metrics + history
│   │       ├── repos/route.ts                 # GET  — per-repo summaries
│   │       ├── incidents/route.ts             # GET  — incident correlations
│   │       ├── costs/route.ts                 # GET  — deploy cost data
│   │       ├── team/route.ts                  # GET  — team leaderboard
│   │       ├── stream/route.ts                # GET  — SSE real-time stream
│   │       ├── export/route.ts                # GET  — CSV/JSON export
│   │       ├── notifications/
│   │       │   ├── route.ts                   # CRUD — notification channels
│   │       │   └── test/route.ts              # POST — test notification
│   │       ├── webhooks/
│   │       │   ├── github/route.ts            # POST — GitHub webhook
│   │       │   └── healops/route.ts           # POST — HealOps webhook
│   │       ├── healops/
│   │       │   ├── stats/route.ts             # GET  — HealOps statistics
│   │       │   └── events/route.ts            # GET  — healing events
│   │       └── worker/
│   │           └── consume/route.ts           # POST — Kafka consumer trigger
│   ├── components/
│   │   ├── Sidebar.tsx                        # Navigation (7 main + integrations)
│   │   ├── MetricCard.tsx                     # Stat card with trend indicator
│   │   ├── EventCard.tsx                      # Event display with avatar
│   │   ├── DORAChart.tsx                      # DORA trend line chart
│   │   ├── EventTimeline.tsx                  # Live event feed with filters
│   │   ├── ExportButton.tsx                   # CSV/JSON download trigger
│   │   └── ServiceStatus.tsx                  # Aiven service indicators
│   └── lib/
│       ├── types.ts                           # DevOpsEvent, DORAMetrics, etc.
│       ├── kafka.ts                           # Kafka producer/consumer (KafkaJS)
│       ├── db.ts                              # PostgreSQL pool + schema init
│       ├── valkey.ts                          # Valkey cache + pub/sub (ioredis)
│       ├── notifications.ts                   # Slack/Discord webhook sender
│       ├── demo-data.ts                       # Core demo event generator
│       ├── demo-data-extended.ts              # Cost + team demo data
│       ├── demo-data-incidents.ts             # Incident correlation demo data
│       └── demo-data-healops.ts               # HealOps healing event demo data
├── public/                                     # Static assets
├── certificates/                               # Aiven SSL certificates
├── .env.example                                # Environment template
├── CLAUDE.md                                   # Architecture reference
├── package.json                                # Dependencies
├── tsconfig.json                               # TypeScript config
├── next.config.ts                              # Next.js config
├── postcss.config.mjs                          # PostCSS + Tailwind
└── eslint.config.mjs                           # ESLint config
```

---

## The Story

As a DevOps engineer with 4 years of experience, I've worked across startups managing infrastructure on AWS, Oracle Cloud, and Kubernetes. The one pain point that never goes away is the **fragmentation of DevOps data**.

Every morning, I open GitHub to check PRs, switch to the CI dashboard to verify builds, jump to Slack for incident alerts, open the monitoring tool for metrics, and then manually piece together what happened overnight. When something breaks in production, the first 15 minutes of every incident is spent answering: "What changed? Who deployed? When? To which service?"

DORA metrics — the gold standard for engineering team performance — require expensive platforms. Sleuth, LinearB, Swarmia, and Jellyfish all charge per-developer, putting them out of reach for small teams and startups.

**InfraStream was born from this frustration.**

I wanted to prove that you can build a production-grade DevOps intelligence platform using only free-tier services. Aiven's free tier gave me exactly the three building blocks I needed:

- **Kafka** for durable event streaming — the same architecture used at Netflix, Uber, and LinkedIn
- **PostgreSQL** for persistent storage and SQL-powered DORA calculations
- **Valkey** for the real-time layer that makes the dashboard feel alive

The integration with [HealOps](https://healops.online) — my self-healing code platform — shows the full loop: detect issues, auto-fix them, and measure the DORA impact. Before HealOps, the demo repo had a deployment frequency of 1.2/day and 22% change failure rate. After enabling auto-healing: 4.8 deploys/day, 5.8% CFR, and MTTR dropped from 4.5 hours to 48 minutes.

This is the dashboard I wish I had on day one of my career. Now it exists, and it costs $0/month.

---

## Competition

<p align="center">
  <strong>Built for the <a href="https://aiven.io/free-tier-competition">#AivenFreeTier Competition</a></strong><br/>
  Prize: $1,000 · Deadline: March 31, 2026
</p>

InfraStream demonstrates that Aiven's free tier is powerful enough to run a real-time, event-driven application with:

- **Kafka** as a durable event bus for webhook ingestion
- **PostgreSQL** as the analytical engine for DORA metric calculation
- **Valkey** as the real-time pub/sub and caching layer

All three services work together in a production-grade architecture, with graceful degradation when individual services are unavailable (the app falls back to demo mode automatically).

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with ❤️ by <a href="https://www.linkedin.com/in/nagacharan-gudiyatham/">Nagacharan G</a><br/>
  <a href="https://infrastream.healops.online">Live Demo</a> · <a href="https://healops.online">HealOps Platform</a> · <a href="https://github.com/charan-happy/infrastream">GitHub</a>
</p>

<p align="center">
  <sub>Powered by <a href="https://aiven.io">Aiven</a> Free Tier · #AivenFreeTier</sub>
</p>
