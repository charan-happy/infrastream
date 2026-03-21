'use client';

import { useState, useEffect } from 'react';
import { MetricCard } from '@/components/MetricCard';
import { DORAChart } from '@/components/DORAChart';
import { Rocket, Clock, AlertTriangle, Wrench } from 'lucide-react';
import { ExportButton } from '@/components/ExportButton';
import type { DORAMetrics, DORAHistory } from '@/lib/types';

export default function MetricsPage() {
  const [dora, setDora] = useState<DORAMetrics | null>(null);
  const [history, setHistory] = useState<DORAHistory[]>([]);
  const [period, setPeriod] = useState('last_7_days');

  useEffect(() => {
    fetch(`/api/metrics/dora?history=true&period=${period}`)
      .then((r) => r.json())
      .then((d) => {
        setDora(d.metrics);
        setHistory(d.history || []);
      })
      .catch(() => {});
  }, [period]);

  const doraLevel = (metric: string, value: number): string => {
    const thresholds: Record<string, { elite: number; high: number; medium: number }> = {
      deployment_frequency: { elite: 7, high: 1, medium: 0.14 },
      lead_time: { elite: 1, high: 24, medium: 168 },
      change_failure_rate: { elite: 5, high: 10, medium: 15 },
      mttr: { elite: 1, high: 24, medium: 168 },
    };
    const t = thresholds[metric];
    if (!t) return 'N/A';
    if (metric === 'deployment_frequency') {
      return value >= t.elite ? 'Elite' : value >= t.high ? 'High' : value >= t.medium ? 'Medium' : 'Low';
    }
    return value <= t.elite ? 'Elite' : value <= t.high ? 'High' : value <= t.medium ? 'Medium' : 'Low';
  };

  const levelColor = (level: string) => {
    switch (level) {
      case 'Elite': return 'text-emerald-400';
      case 'High': return 'text-blue-400';
      case 'Medium': return 'text-amber-400';
      case 'Low': return 'text-red-400';
      default: return 'text-zinc-500';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">DORA Metrics</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Track your software delivery performance with the four key DORA metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton type="dora" />
          <div className="flex gap-2">
          {['last_7_days', 'last_30_days', 'last_90_days'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                period === p
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {p.replace('last_', '').replace('_', ' ')}
            </button>
          ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <MetricCard
            title="Deployment Frequency"
            value={dora?.deployment_frequency ?? '—'}
            unit="deploys/day"
            icon={Rocket}
            color="emerald"
          />
          {dora && (
            <p className={`text-center text-xs font-medium ${levelColor(doraLevel('deployment_frequency', dora.deployment_frequency))}`}>
              {doraLevel('deployment_frequency', dora.deployment_frequency)} Performer
            </p>
          )}
        </div>
        <div className="space-y-2">
          <MetricCard
            title="Lead Time for Changes"
            value={dora?.lead_time ?? '—'}
            unit="hours"
            icon={Clock}
            color="blue"
          />
          {dora && (
            <p className={`text-center text-xs font-medium ${levelColor(doraLevel('lead_time', dora.lead_time))}`}>
              {doraLevel('lead_time', dora.lead_time)} Performer
            </p>
          )}
        </div>
        <div className="space-y-2">
          <MetricCard
            title="Change Failure Rate"
            value={dora?.change_failure_rate ?? '—'}
            unit="%"
            icon={AlertTriangle}
            color="amber"
          />
          {dora && (
            <p className={`text-center text-xs font-medium ${levelColor(doraLevel('change_failure_rate', dora.change_failure_rate))}`}>
              {doraLevel('change_failure_rate', dora.change_failure_rate)} Performer
            </p>
          )}
        </div>
        <div className="space-y-2">
          <MetricCard
            title="Mean Time to Recovery"
            value={dora?.mttr ?? '—'}
            unit="hours"
            icon={Wrench}
            color="red"
          />
          {dora && (
            <p className={`text-center text-xs font-medium ${levelColor(doraLevel('mttr', dora.mttr))}`}>
              {doraLevel('mttr', dora.mttr)} Performer
            </p>
          )}
        </div>
      </div>

      {/* Individual metric charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="mb-4 text-sm font-semibold text-white">Deployment Frequency</h3>
          <DORAChart data={history} metric="deployment_frequency" />
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="mb-4 text-sm font-semibold text-white">Lead Time for Changes</h3>
          <DORAChart data={history} metric="lead_time" />
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="mb-4 text-sm font-semibold text-white">Change Failure Rate</h3>
          <DORAChart data={history} metric="change_failure_rate" />
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="mb-4 text-sm font-semibold text-white">Mean Time to Recovery</h3>
          <DORAChart data={history} metric="mttr" />
        </div>
      </div>
    </div>
  );
}
