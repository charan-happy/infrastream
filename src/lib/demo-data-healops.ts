export type HealingStatus = 'detected' | 'diagnosing' | 'healing' | 'healed' | 'failed';
export type HealingType = 'security_fix' | 'dependency_update' | 'config_fix' | 'code_quality' | 'performance_fix' | 'infrastructure';

export interface HealingEvent {
  id: string;
  repo: string;
  type: HealingType;
  status: HealingStatus;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detected_at: string;
  healed_at: string | null;
  time_to_heal: number | null; // minutes
  auto_fix: boolean;
  pr_number: number | null;
  pr_url: string | null;
  commit_sha: string | null;
  confidence: number; // 0-100
}

export interface HealOpsStats {
  total_healings: number;
  auto_fixed: number;
  manual_required: number;
  success_rate: number;
  avg_time_to_heal: number; // minutes
  issues_prevented: number;
  repos_monitored: number;
  health_score: number; // 0-100
}

export interface RepoHealth {
  repo: string;
  health_score: number;
  issues_found: number;
  issues_fixed: number;
  auto_fix_rate: number;
  last_scan: string;
  categories: {
    security: number;
    dependencies: number;
    code_quality: number;
    configuration: number;
    performance: number;
  };
}

export interface HealingTimeline {
  date: string;
  detected: number;
  healed: number;
  failed: number;
  auto_fixed: number;
  manual_fixed: number;
}

export interface DORAComparison {
  metric: string;
  before_healops: number;
  after_healops: number;
  improvement: number;
  unit: string;
}

const repos = ['charan-happy/healops-test-repo', 'infrastream/api', 'infrastream/frontend', 'infrastream/worker'];

const healingTemplates: { type: HealingType; title: string; severity: HealingEvent['severity']; confidence: number }[] = [
  { type: 'security_fix', title: 'CVE-2026-1234: XSS vulnerability in input handler', severity: 'critical', confidence: 95 },
  { type: 'security_fix', title: 'Exposed API key in config file', severity: 'critical', confidence: 99 },
  { type: 'security_fix', title: 'SQL injection risk in query builder', severity: 'high', confidence: 88 },
  { type: 'dependency_update', title: 'Update lodash from 4.17.19 to 4.17.21 (security patch)', severity: 'high', confidence: 97 },
  { type: 'dependency_update', title: 'Update next.js to latest patch version', severity: 'medium', confidence: 92 },
  { type: 'dependency_update', title: 'Remove deprecated uuid@3.x, upgrade to uuid@9', severity: 'low', confidence: 96 },
  { type: 'config_fix', title: 'Missing CORS headers in production config', severity: 'high', confidence: 91 },
  { type: 'config_fix', title: 'Docker healthcheck not configured', severity: 'medium', confidence: 94 },
  { type: 'config_fix', title: '.env.production missing from .gitignore', severity: 'critical', confidence: 99 },
  { type: 'code_quality', title: 'Unused imports increasing bundle size by 12%', severity: 'low', confidence: 85 },
  { type: 'code_quality', title: 'N+1 query detected in event loader', severity: 'high', confidence: 78 },
  { type: 'code_quality', title: 'Missing error boundary in dashboard component', severity: 'medium', confidence: 82 },
  { type: 'performance_fix', title: 'Unoptimized database queries causing 3s latency', severity: 'high', confidence: 87 },
  { type: 'performance_fix', title: 'Missing index on events.created_at column', severity: 'medium', confidence: 93 },
  { type: 'infrastructure', title: 'Kubernetes pod memory limit too low (OOMKilled)', severity: 'high', confidence: 90 },
  { type: 'infrastructure', title: 'SSL certificate expiring in 7 days', severity: 'critical', confidence: 99 },
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

function shortSha(): string {
  return Math.random().toString(16).substring(2, 9);
}

export function generateHealingEvents(count = 20): HealingEvent[] {
  const events: HealingEvent[] = [];
  const now = Date.now();
  const statuses: HealingStatus[] = ['detected', 'diagnosing', 'healing', 'healed', 'healed', 'healed', 'healed', 'failed'];

  for (let i = 0; i < count; i++) {
    const template = randomFrom(healingTemplates);
    const repo = randomFrom(repos);
    const status = randomFrom(statuses);
    const minutesAgo = Math.floor(Math.random() * 10080); // last 7 days
    const detected = new Date(now - minutesAgo * 60000);
    const isHealed = status === 'healed';
    const tth = isHealed ? 3 + Math.floor(Math.random() * 120) : null;
    const autoFix = Math.random() > 0.25; // 75% auto-fix rate
    const prNum = (isHealed || status === 'healing') ? 100 + Math.floor(Math.random() * 200) : null;

    events.push({
      id: uuid(),
      repo,
      type: template.type,
      status,
      title: template.title,
      description: `${template.title} detected in ${repo}`,
      severity: template.severity,
      detected_at: detected.toISOString(),
      healed_at: isHealed ? new Date(detected.getTime() + (tth || 30) * 60000).toISOString() : null,
      time_to_heal: tth,
      auto_fix: autoFix,
      pr_number: prNum,
      pr_url: prNum ? `https://github.com/${repo}/pull/${prNum}` : null,
      commit_sha: isHealed ? shortSha() : null,
      confidence: template.confidence + Math.floor(Math.random() * 5 - 2),
    });
  }

  return events.sort((a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime());
}

export function generateHealOpsStats(): HealOpsStats {
  const total = 45 + Math.floor(Math.random() * 30);
  const autoFixed = Math.floor(total * (0.7 + Math.random() * 0.15));
  return {
    total_healings: total,
    auto_fixed: autoFixed,
    manual_required: total - autoFixed,
    success_rate: +(88 + Math.random() * 10).toFixed(1),
    avg_time_to_heal: +(8 + Math.random() * 25).toFixed(1),
    issues_prevented: Math.floor(total * 0.6),
    repos_monitored: repos.length,
    health_score: Math.floor(75 + Math.random() * 20),
  };
}

export function generateRepoHealth(): RepoHealth[] {
  return repos.map((repo) => {
    const found = 5 + Math.floor(Math.random() * 20);
    const fixed = Math.floor(found * (0.7 + Math.random() * 0.25));
    return {
      repo,
      health_score: Math.floor(60 + Math.random() * 35),
      issues_found: found,
      issues_fixed: fixed,
      auto_fix_rate: +((fixed / found) * 100).toFixed(1),
      last_scan: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString(),
      categories: {
        security: Math.floor(70 + Math.random() * 25),
        dependencies: Math.floor(60 + Math.random() * 35),
        code_quality: Math.floor(55 + Math.random() * 40),
        configuration: Math.floor(65 + Math.random() * 30),
        performance: Math.floor(50 + Math.random() * 45),
      },
    };
  }).sort((a, b) => b.health_score - a.health_score);
}

export function generateHealingTimeline(days = 30): HealingTimeline[] {
  const timeline: HealingTimeline[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const detected = 1 + Math.floor(Math.random() * 6);
    const autoFixed = Math.floor(detected * (0.6 + Math.random() * 0.3));
    const manualFixed = Math.floor((detected - autoFixed) * (0.5 + Math.random() * 0.4));
    const failed = detected - autoFixed - manualFixed;
    timeline.push({
      date: date.toISOString().split('T')[0],
      detected,
      healed: autoFixed + manualFixed,
      failed: Math.max(0, failed),
      auto_fixed: autoFixed,
      manual_fixed: manualFixed,
    });
  }
  return timeline;
}

export function generateDORAComparison(): DORAComparison[] {
  return [
    { metric: 'Deployment Frequency', before_healops: 1.2, after_healops: 4.8, improvement: 300, unit: 'deploys/day' },
    { metric: 'Lead Time', before_healops: 48, after_healops: 6.5, improvement: -86, unit: 'hours' },
    { metric: 'Change Failure Rate', before_healops: 22, after_healops: 5.8, improvement: -74, unit: '%' },
    { metric: 'MTTR', before_healops: 4.5, after_healops: 0.8, improvement: -82, unit: 'hours' },
  ];
}
