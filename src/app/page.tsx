'use client';

import { useState, useEffect } from 'react';
import { MetricCard } from '@/components/MetricCard';
import { EventTimeline } from '@/components/EventTimeline';
import { DORAChart } from '@/components/DORAChart';
import {
  Rocket,
  Clock,
  AlertTriangle,
  Wrench,
  Activity,
  TrendingUp,
  Zap,
  Shield,
} from 'lucide-react';
import type { DORAMetrics, DORAHistory, EventStats } from '@/lib/types';

export default function Dashboard() {
  const [dora, setDora] = useState<DORAMetrics | null>(null);
  const [history, setHistory] = useState<DORAHistory[]>([]);
  const [stats, setStats] = useState<EventStats | null>(null);

  useEffect(() => {
    fetch('/api/metrics/dora?history=true')
      .then((r) => r.json())
      .then((d) => {
        setDora(d.metrics);
        setHistory(d.history || []);
      })
      .catch(() => {});

    // Get stats from events
    fetch('/api/events?limit=100')
      .then((r) => r.json())
      .then((d) => {
        const events = d.events || [];
        const today = new Date().toISOString().split('T')[0];
        const todayEvents = events.filter((e: { created_at: string }) => e.created_at.startsWith(today));
        const successful = events.filter((e: { status: string }) => e.status === 'success');
        const incidents = events.filter((e: { type: string; status: string }) => e.type === 'incident' && e.status !== 'success');

        setStats({
          total_events: events.length,
          events_today: todayEvents.length,
          success_rate: events.length > 0 ? +((successful.length / events.length) * 100).toFixed(1) : 0,
          active_incidents: incidents.length,
          top_repos: [],
        });
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Real-time DevOps event intelligence
        </p>
      </div>

      {/* DORA Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Deploy Frequency"
          value={dora?.deployment_frequency ?? '—'}
          unit="/day"
          icon={Rocket}
          color="emerald"
          trend="up"
          trendValue="+12%"
        />
        <MetricCard
          title="Lead Time"
          value={dora?.lead_time ?? '—'}
          unit="hours"
          icon={Clock}
          color="blue"
          trend="down"
          trendValue="-8%"
        />
        <MetricCard
          title="Change Failure Rate"
          value={dora?.change_failure_rate ?? '—'}
          unit="%"
          icon={AlertTriangle}
          color="amber"
          trend="down"
          trendValue="-3%"
        />
        <MetricCard
          title="MTTR"
          value={dora?.mttr ?? '—'}
          unit="hours"
          icon={Wrench}
          color="red"
          trend="down"
          trendValue="-15%"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Events"
          value={stats?.total_events ?? '—'}
          icon={Activity}
          color="purple"
        />
        <MetricCard
          title="Events Today"
          value={stats?.events_today ?? '—'}
          icon={Zap}
          color="emerald"
        />
        <MetricCard
          title="Success Rate"
          value={stats?.success_rate ?? '—'}
          unit="%"
          icon={TrendingUp}
          color="blue"
        />
        <MetricCard
          title="Active Incidents"
          value={stats?.active_incidents ?? '—'}
          icon={Shield}
          color="red"
        />
      </div>

      {/* DORA Trend Chart */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">DORA Metrics Trend</h3>
        {history.length > 0 ? (
          <DORAChart data={history} />
        ) : (
          <div className="flex h-72 items-center justify-center text-sm text-zinc-600">
            Loading trend data...
          </div>
        )}
      </div>

      {/* Event Stream */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">Live Event Stream</h3>
        <EventTimeline />
      </div>
    </div>
  );
}
