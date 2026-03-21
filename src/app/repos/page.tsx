'use client';

import { useState, useEffect } from 'react';
import { MetricCard } from '@/components/MetricCard';
import { DORAChart } from '@/components/DORAChart';
import { GitBranch, Rocket, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { generateDORAHistory } from '@/lib/demo-data';
import type { DORAHistory } from '@/lib/types';

interface RepoSummary {
  repo: string;
  total_events: number;
  deployments: number;
  incidents: number;
  success_rate: number;
  last_deploy: string | null;
  dora: {
    deployment_frequency: number;
    lead_time: number;
    change_failure_rate: number;
    mttr: number;
  };
}

export default function ReposPage() {
  const [repos, setRepos] = useState<RepoSummary[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [history, setHistory] = useState<DORAHistory[]>([]);

  useEffect(() => {
    fetch('/api/repos').then((r) => r.json()).then((d) => {
      setRepos(d.repos || []);
      if (d.repos?.length > 0) setSelected(d.repos[0].repo);
    });
  }, []);

  useEffect(() => {
    if (selected) {
      setHistory(generateDORAHistory(30));
    }
  }, [selected]);

  const totalRepos = repos.length;
  const totalDeploys = repos.reduce((s, r) => s + r.deployments, 0);
  const totalIncidents = repos.reduce((s, r) => s + r.incidents, 0);
  const avgSuccess = repos.length > 0
    ? +(repos.reduce((s, r) => s + r.success_rate, 0) / repos.length).toFixed(1)
    : 0;

  const selectedRepo = repos.find((r) => r.repo === selected);

  const doraLevel = (metric: string, value: number): { level: string; color: string } => {
    const thresholds: Record<string, { elite: number; high: number; medium: number }> = {
      deployment_frequency: { elite: 7, high: 1, medium: 0.14 },
      lead_time: { elite: 1, high: 24, medium: 168 },
      change_failure_rate: { elite: 5, high: 10, medium: 15 },
      mttr: { elite: 1, high: 24, medium: 168 },
    };
    const t = thresholds[metric];
    if (!t) return { level: 'N/A', color: 'text-zinc-500' };
    let level: string;
    if (metric === 'deployment_frequency') {
      level = value >= t.elite ? 'Elite' : value >= t.high ? 'High' : value >= t.medium ? 'Medium' : 'Low';
    } else {
      level = value <= t.elite ? 'Elite' : value <= t.high ? 'High' : value <= t.medium ? 'Medium' : 'Low';
    }
    const colors: Record<string, string> = { Elite: 'text-emerald-400', High: 'text-blue-400', Medium: 'text-amber-400', Low: 'text-red-400' };
    return { level, color: colors[level] || 'text-zinc-500' };
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Repositories</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Compare DORA metrics and event activity across all repositories
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Repos" value={totalRepos} icon={GitBranch} color="purple" />
        <MetricCard title="Total Deploys" value={totalDeploys} icon={Rocket} color="emerald" />
        <MetricCard title="Total Incidents" value={totalIncidents} icon={AlertTriangle} color="red" />
        <MetricCard title="Avg Success Rate" value={avgSuccess} unit="%" icon={CheckCircle} color="blue" />
      </div>

      {/* Repo Comparison Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Repository Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left text-zinc-500">
                <th className="pb-3 font-medium">Repository</th>
                <th className="pb-3 font-medium text-center">Events</th>
                <th className="pb-3 font-medium text-center">Deploys</th>
                <th className="pb-3 font-medium text-center">Incidents</th>
                <th className="pb-3 font-medium text-center">Success</th>
                <th className="pb-3 font-medium text-center">Deploy Freq</th>
                <th className="pb-3 font-medium text-center">Lead Time</th>
                <th className="pb-3 font-medium text-center">CFR</th>
                <th className="pb-3 font-medium text-center">MTTR</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {repos.map((r) => (
                <tr
                  key={r.repo}
                  className={clsx(
                    'border-b border-zinc-800/50 cursor-pointer transition-colors',
                    selected === r.repo ? 'bg-zinc-800/50' : 'hover:bg-zinc-800/30'
                  )}
                  onClick={() => setSelected(r.repo)}
                >
                  <td className="py-3 font-mono text-xs text-white">{r.repo}</td>
                  <td className="py-3 text-center text-zinc-300">{r.total_events}</td>
                  <td className="py-3 text-center text-emerald-400">{r.deployments}</td>
                  <td className="py-3 text-center text-red-400">{r.incidents}</td>
                  <td className="py-3 text-center text-zinc-300">{r.success_rate}%</td>
                  <td className="py-3 text-center">
                    <span className={doraLevel('deployment_frequency', r.dora.deployment_frequency).color}>
                      {r.dora.deployment_frequency}/d
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span className={doraLevel('lead_time', r.dora.lead_time).color}>
                      {r.dora.lead_time}h
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span className={doraLevel('change_failure_rate', r.dora.change_failure_rate).color}>
                      {r.dora.change_failure_rate}%
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span className={doraLevel('mttr', r.dora.mttr).color}>
                      {r.dora.mttr}h
                    </span>
                  </td>
                  <td className="py-3">
                    <ArrowRight className="h-4 w-4 text-zinc-600" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected repo DORA chart */}
      {selectedRepo && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              <span className="font-mono text-emerald-400">{selectedRepo.repo}</span> — DORA Trend
            </h3>
            <div className="flex gap-3">
              {(['deployment_frequency', 'lead_time', 'change_failure_rate', 'mttr'] as const).map((m) => {
                const { level, color } = doraLevel(m, selectedRepo.dora[m]);
                return (
                  <div key={m} className="text-center">
                    <p className={`text-sm font-bold ${color}`}>{level}</p>
                    <p className="text-[10px] text-zinc-500">{m.replace(/_/g, ' ')}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <DORAChart data={history} />
        </div>
      )}
    </div>
  );
}
