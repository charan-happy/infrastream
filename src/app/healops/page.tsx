'use client';

import { useState, useEffect } from 'react';
import { MetricCard } from '@/components/MetricCard';
import {
  HeartPulse,
  Shield,
  Zap,
  Clock,
  Bot,
  TrendingUp,
  GitPullRequest,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Wrench,
  Lock,
  Package,
  Settings,
  Gauge,
  Server,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { clsx } from 'clsx';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts';

interface HealOpsStats {
  total_healings: number;
  auto_fixed: number;
  manual_required: number;
  success_rate: number;
  avg_time_to_heal: number;
  issues_prevented: number;
  repos_monitored: number;
  health_score: number;
}

interface RepoHealth {
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

interface HealingEvent {
  id: string;
  repo: string;
  type: string;
  status: string;
  title: string;
  severity: string;
  detected_at: string;
  healed_at: string | null;
  time_to_heal: number | null;
  auto_fix: boolean;
  pr_number: number | null;
  confidence: number;
}

interface HealingTimeline {
  date: string;
  detected: number;
  healed: number;
  failed: number;
  auto_fixed: number;
  manual_fixed: number;
}

interface DORAComparison {
  metric: string;
  before_healops: number;
  after_healops: number;
  improvement: number;
  unit: string;
}

const typeIcons: Record<string, typeof Shield> = {
  security_fix: Lock,
  dependency_update: Package,
  config_fix: Settings,
  code_quality: Gauge,
  performance_fix: Zap,
  infrastructure: Server,
};

const severityColors: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-400',
  high: 'bg-amber-500/10 text-amber-400',
  medium: 'bg-blue-500/10 text-blue-400',
  low: 'bg-zinc-500/10 text-zinc-400',
};

const statusIcons: Record<string, typeof CheckCircle> = {
  healed: CheckCircle,
  failed: XCircle,
  detected: AlertTriangle,
  diagnosing: Wrench,
  healing: Wrench,
};

export default function HealOpsPage() {
  const [stats, setStats] = useState<HealOpsStats | null>(null);
  const [repoHealth, setRepoHealth] = useState<RepoHealth[]>([]);
  const [timeline, setTimeline] = useState<HealingTimeline[]>([]);
  const [doraComparison, setDoraComparison] = useState<DORAComparison[]>([]);
  const [events, setEvents] = useState<HealingEvent[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/healops/stats').then((r) => r.json()).then((d) => {
      setStats(d.stats);
      setRepoHealth(d.repo_health || []);
      setTimeline(d.timeline || []);
      setDoraComparison(d.dora_comparison || []);
      if (d.repo_health?.length > 0) setSelectedRepo(d.repo_health[0].repo);
    });
    fetch('/api/healops/events').then((r) => r.json()).then((d) => setEvents(d.events || []));
  }, []);

  const selectedRepoData = repoHealth.find((r) => r.repo === selectedRepo);
  const radarData = selectedRepoData ? [
    { category: 'Security', score: selectedRepoData.categories.security },
    { category: 'Dependencies', score: selectedRepoData.categories.dependencies },
    { category: 'Code Quality', score: selectedRepoData.categories.code_quality },
    { category: 'Configuration', score: selectedRepoData.categories.configuration },
    { category: 'Performance', score: selectedRepoData.categories.performance },
  ] : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
          <HeartPulse className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">HealOps Analytics</h2>
          <p className="text-sm text-zinc-500">
            Self-healing intelligence from <span className="text-emerald-400">healops.online</span>
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Issues Healed" value={stats?.total_healings ?? '—'} icon={HeartPulse} color="emerald" trend="up" trendValue="+23%" />
        <MetricCard title="Auto-Fix Rate" value={stats ? `${((stats.auto_fixed / stats.total_healings) * 100).toFixed(0)}%` : '—'} icon={Bot} color="blue" trend="up" trendValue="+8%" />
        <MetricCard title="Avg Time to Heal" value={stats?.avg_time_to_heal ?? '—'} unit="min" icon={Clock} color="purple" trend="down" trendValue="-35%" />
        <MetricCard title="Health Score" value={stats?.health_score ?? '—'} unit="/100" icon={Shield} color="emerald" trend="up" trendValue="+12" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Success Rate" value={stats?.success_rate ?? '—'} unit="%" icon={CheckCircle} color="emerald" />
        <MetricCard title="Issues Prevented" value={stats?.issues_prevented ?? '—'} icon={Shield} color="blue" />
        <MetricCard title="Repos Monitored" value={stats?.repos_monitored ?? '—'} icon={Server} color="purple" />
        <MetricCard title="Manual Required" value={stats?.manual_required ?? '—'} icon={Wrench} color="amber" />
      </div>

      {/* DORA Before/After Comparison */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="mb-2 text-lg font-semibold text-white">DORA Impact: Before vs After HealOps</h3>
        <p className="mb-6 text-xs text-zinc-500">How HealOps improved your engineering velocity</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {doraComparison.map((d) => (
            <div key={d.metric} className="rounded-xl border border-zinc-800 bg-zinc-800/30 p-4">
              <p className="text-xs text-zinc-500">{d.metric}</p>
              <div className="mt-3 flex items-end gap-3">
                <div>
                  <p className="text-[10px] text-zinc-600">Before</p>
                  <p className="text-lg font-bold text-zinc-500 line-through">{d.before_healops}</p>
                </div>
                <div className="flex items-center gap-1">
                  {d.improvement > 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-emerald-400" />
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-emerald-400">After</p>
                  <p className="text-2xl font-bold text-white">{d.after_healops}</p>
                </div>
              </div>
              <p className="mt-1 text-xs text-zinc-500">{d.unit}</p>
              <div className={clsx(
                'mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium',
                'bg-emerald-500/10 text-emerald-400'
              )}>
                {d.improvement > 0 ? '+' : ''}{d.improvement}% improvement
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Healing Timeline Chart */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Healing Activity (30 days)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="date" stroke="#52525b" fontSize={11} tickFormatter={(v) => { const d = new Date(v); return `${d.getMonth()+1}/${d.getDate()}`; }} />
              <YAxis stroke="#52525b" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="auto_fixed" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.4} name="Auto Fixed" />
              <Area type="monotone" dataKey="manual_fixed" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Manual Fixed" />
              <Area type="monotone" dataKey="failed" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="Failed" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Repo Health Cards + Radar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">Repository Health</h3>
          {repoHealth.map((r) => (
            <button
              key={r.repo}
              onClick={() => setSelectedRepo(r.repo)}
              className={clsx(
                'w-full rounded-xl border p-4 text-left transition-colors',
                selectedRepo === r.repo ? 'border-emerald-600 bg-zinc-900' : 'border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/60'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-white">{r.repo}</span>
                <span className={clsx(
                  'rounded-full px-2.5 py-1 text-xs font-bold',
                  r.health_score >= 80 ? 'bg-emerald-500/10 text-emerald-400' :
                  r.health_score >= 60 ? 'bg-amber-500/10 text-amber-400' :
                  'bg-red-500/10 text-red-400'
                )}>
                  {r.health_score}/100
                </span>
              </div>
              <div className="mt-2 flex gap-4 text-[10px] text-zinc-500">
                <span>Found: {r.issues_found}</span>
                <span>Fixed: {r.issues_fixed}</span>
                <span>Auto: {r.auto_fix_rate}%</span>
              </div>
            </button>
          ))}
        </div>

        {selectedRepoData && (
          <div className="lg:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="mb-4 text-sm font-semibold text-white">
              <span className="font-mono text-emerald-400">{selectedRepoData.repo}</span> — Health Radar
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#27272a" />
                  <PolarAngleAxis dataKey="category" stroke="#71717a" fontSize={11} />
                  <Radar name="Score" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Recent Healing Events */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Recent Healing Events</h3>
        <div className="space-y-2">
          {events.slice(0, 12).map((event) => {
            const TypeIcon = typeIcons[event.type] || Shield;
            const StatusIcon = statusIcons[event.status] || AlertTriangle;
            return (
              <div key={event.id} className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900/30 p-4 transition-colors hover:bg-zinc-900/60">
                <div className={clsx('rounded-lg p-2', severityColors[event.severity])}>
                  <TypeIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-white">{event.title}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                    <span className="font-mono">{event.repo}</span>
                    {event.auto_fix && <span className="text-emerald-400">auto-fix</span>}
                    {event.pr_number && <span className="text-purple-400">PR #{event.pr_number}</span>}
                    <span>confidence: {event.confidence}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIcon className={clsx('h-4 w-4',
                    event.status === 'healed' ? 'text-emerald-400' :
                    event.status === 'failed' ? 'text-red-400' :
                    'text-amber-400'
                  )} />
                  <span className={clsx('text-xs font-medium',
                    event.status === 'healed' ? 'text-emerald-400' :
                    event.status === 'failed' ? 'text-red-400' :
                    'text-amber-400'
                  )}>{event.status}</span>
                </div>
                <div className="text-right">
                  {event.time_to_heal && (
                    <p className="text-xs text-zinc-400">{event.time_to_heal}m to heal</p>
                  )}
                  <p className="text-[10px] text-zinc-600">
                    {new Date(event.detected_at).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Integration Guide */}
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-emerald-400">
          <Zap className="h-5 w-5" />
          Connect HealOps to InfraStream
        </h3>
        <p className="mt-2 text-sm text-zinc-400">
          Send healing events from your HealOps instance to InfraStream for unified analytics.
        </p>
        <div className="mt-4 rounded-lg bg-zinc-900 p-4">
          <p className="mb-2 text-xs text-zinc-500">POST to your InfraStream webhook:</p>
          <pre className="text-xs text-emerald-400 overflow-x-auto">{`curl -X POST https://your-infrastream.vercel.app/api/webhooks/healops \\
  -H "Content-Type: application/json" \\
  -H "x-healops-key: your-api-key" \\
  -d '{
    "event_type": "healing_complete",
    "repo": "org/repo",
    "title": "Fixed CVE-2026-1234",
    "severity": "critical",
    "status": "healed",
    "healing_type": "security_fix",
    "confidence": 95,
    "auto_fix": true,
    "pr_number": 142,
    "time_to_heal": 8
  }'`}</pre>
        </div>
      </div>
    </div>
  );
}
