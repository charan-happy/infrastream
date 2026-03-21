import { DevOpsEvent, DORAMetrics, DORAHistory, EventStats } from './types';

const repos = ['infrastream/api', 'infrastream/frontend', 'infrastream/worker', 'infrastream/infra'];
const authors = [
  { name: 'nagacharan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nagacharan' },
  { name: 'alice-dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice' },
  { name: 'bob-ops', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob' },
  { name: 'carol-sre', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol' },
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const eventTemplates: { type: DevOpsEvent['type']; title: string; severity: DevOpsEvent['severity']; status: DevOpsEvent['status'] }[] = [
  { type: 'push', title: 'feat: add real-time event streaming', severity: 'info', status: 'success' },
  { type: 'push', title: 'fix: resolve connection pooling issue', severity: 'info', status: 'success' },
  { type: 'pull_request', title: 'PR #42: Implement DORA metrics calculator', severity: 'info', status: 'success' },
  { type: 'pull_request', title: 'PR #38: Add Kafka consumer retry logic', severity: 'info', status: 'pending' },
  { type: 'deployment', title: 'Deploy v2.1.0 to production', severity: 'info', status: 'success' },
  { type: 'deployment', title: 'Deploy v2.0.9 to staging', severity: 'info', status: 'success' },
  { type: 'deployment', title: 'Deploy v2.0.8 rollback', severity: 'warning', status: 'failure' },
  { type: 'incident', title: 'High latency on /api/events endpoint', severity: 'critical', status: 'in_progress' },
  { type: 'incident', title: 'Database connection pool exhausted', severity: 'critical', status: 'success' },
  { type: 'alert', title: 'CPU usage above 85% on worker-01', severity: 'warning', status: 'pending' },
  { type: 'alert', title: 'Kafka consumer lag > 1000 messages', severity: 'warning', status: 'in_progress' },
  { type: 'build', title: 'CI: Build #1247 passed', severity: 'info', status: 'success' },
  { type: 'build', title: 'CI: Build #1246 failed - test timeout', severity: 'warning', status: 'failure' },
];

export function generateDemoEvents(count = 25): DevOpsEvent[] {
  const events: DevOpsEvent[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const template = randomFrom(eventTemplates);
    const author = randomFrom(authors);
    const repo = randomFrom(repos);
    const minutesAgo = Math.floor(Math.random() * 1440); // last 24 hours

    events.push({
      id: uuid(),
      type: template.type,
      source: 'github',
      repo,
      branch: Math.random() > 0.3 ? 'main' : 'development',
      title: template.title,
      description: `${template.title} in ${repo}`,
      severity: template.severity,
      status: template.status,
      author: author.name,
      avatar_url: author.avatar,
      metadata: {},
      created_at: new Date(now - minutesAgo * 60000).toISOString(),
      processed_at: new Date(now - minutesAgo * 60000 + 2000).toISOString(),
    });
  }

  return events.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function generateDORAMetrics(): DORAMetrics {
  return {
    deployment_frequency: +(2 + Math.random() * 6).toFixed(1),
    lead_time: +(1 + Math.random() * 23).toFixed(1),
    change_failure_rate: +(2 + Math.random() * 18).toFixed(1),
    mttr: +(0.5 + Math.random() * 4).toFixed(1),
    period: 'last_7_days',
  };
}

export function generateDORAHistory(days = 30): DORAHistory[] {
  const history: DORAHistory[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    history.push({
      date: date.toISOString().split('T')[0],
      deployment_frequency: +(1 + Math.random() * 8).toFixed(1),
      lead_time: +(2 + Math.random() * 20).toFixed(1),
      change_failure_rate: +(1 + Math.random() * 20).toFixed(1),
      mttr: +(0.3 + Math.random() * 5).toFixed(1),
    });
  }
  return history;
}

export function generateEventStats(): EventStats {
  return {
    total_events: Math.floor(1000 + Math.random() * 5000),
    events_today: Math.floor(20 + Math.random() * 80),
    success_rate: +(85 + Math.random() * 14).toFixed(1),
    active_incidents: Math.floor(Math.random() * 4),
    top_repos: repos.map((repo) => ({ repo, count: Math.floor(10 + Math.random() * 90) })).sort((a, b) => b.count - a.count),
  };
}
