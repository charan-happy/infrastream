'use client';

import { useState, useEffect } from 'react';
import { MetricCard } from '@/components/MetricCard';
import { DollarSign, TrendingDown, Layers, Clock } from 'lucide-react';
import type { DeployCost, RepoCostSummary } from '@/lib/demo-data-extended';
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
} from 'recharts';

export default function CostsPage() {
  const [costs, setCosts] = useState<DeployCost[]>([]);
  const [repoCosts, setRepoCosts] = useState<RepoCostSummary[]>([]);
  const [history, setHistory] = useState<{ date: string; total: number; build: number; compute: number; infra: number }[]>([]);

  useEffect(() => {
    fetch('/api/costs?view=deploys').then((r) => r.json()).then((d) => setCosts(d.costs || []));
    fetch('/api/costs?view=repos').then((r) => r.json()).then((d) => setRepoCosts(d.repos || []));
    fetch('/api/costs?view=history').then((r) => r.json()).then((d) => setHistory(d.history || []));
  }, []);

  const totalCost = costs.reduce((sum, c) => sum + c.total_cost, 0);
  const avgCost = costs.length > 0 ? totalCost / costs.length : 0;
  const totalBuiltMinutes = costs.reduce((sum, c) => sum + c.build_minutes, 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Cost Tracking</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Monitor deployment costs across repos and environments
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Cost (30d)" value={`$${totalCost.toFixed(2)}`} icon={DollarSign} color="emerald" trend="down" trendValue="-8%" />
        <MetricCard title="Avg Cost/Deploy" value={`$${avgCost.toFixed(3)}`} icon={TrendingDown} color="blue" trend="down" trendValue="-12%" />
        <MetricCard title="Total Deploys" value={costs.length} icon={Layers} color="purple" trend="up" trendValue="+15%" />
        <MetricCard title="Build Minutes" value={totalBuiltMinutes} unit="min" icon={Clock} color="amber" />
      </div>

      {/* Cost Trend Chart */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Cost Trend (30 days)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="date" stroke="#52525b" fontSize={11} tickFormatter={(v) => { const d = new Date(v); return `${d.getMonth()+1}/${d.getDate()}`; }} />
              <YAxis stroke="#52525b" fontSize={11} tickFormatter={(v) => `$${v}`} />
              <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="build" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Build" />
              <Area type="monotone" dataKey="compute" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Compute" />
              <Area type="monotone" dataKey="infra" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="Infra" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cost by Repo */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Cost by Repository</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={repoCosts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis type="number" stroke="#52525b" fontSize={11} tickFormatter={(v) => `$${v}`} />
              <YAxis type="category" dataKey="repo" stroke="#52525b" fontSize={11} width={140} />
              <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="total_cost" fill="#10b981" radius={[0, 4, 4, 0]} name="Total Cost" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Deploys with Cost */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Recent Deployments</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left text-zinc-500">
                <th className="pb-3 font-medium">Repo</th>
                <th className="pb-3 font-medium">Version</th>
                <th className="pb-3 font-medium">Env</th>
                <th className="pb-3 font-medium">Build</th>
                <th className="pb-3 font-medium">Compute</th>
                <th className="pb-3 font-medium">Total</th>
                <th className="pb-3 font-medium">By</th>
                <th className="pb-3 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {costs.slice(0, 10).map((c) => (
                <tr key={c.id} className="border-b border-zinc-800/50 text-zinc-300">
                  <td className="py-3 font-mono text-xs">{c.repo}</td>
                  <td className="py-3 text-emerald-400">{c.version}</td>
                  <td className="py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      c.environment === 'production' ? 'bg-red-500/10 text-red-400' :
                      c.environment === 'staging' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>{c.environment}</span>
                  </td>
                  <td className="py-3">${c.build_cost.toFixed(3)}</td>
                  <td className="py-3">${c.compute_cost.toFixed(3)}</td>
                  <td className="py-3 font-medium text-white">${c.total_cost.toFixed(3)}</td>
                  <td className="py-3">{c.deployed_by}</td>
                  <td className="py-3 text-zinc-500">{new Date(c.deployed_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
