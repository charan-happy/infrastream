'use client';

import { useState, useEffect } from 'react';
import { MetricCard } from '@/components/MetricCard';
import { AlertTriangle, Clock, CheckCircle, Link2, Rocket, Bell, Shield, Wrench } from 'lucide-react';
import { clsx } from 'clsx';
import type { IncidentCorrelation } from '@/lib/demo-data-incidents';

const timelineTypeIcons: Record<string, typeof Rocket> = {
  deploy: Rocket,
  alert: Bell,
  incident: AlertTriangle,
  action: Wrench,
  resolved: CheckCircle,
};

const timelineTypeColors: Record<string, string> = {
  deploy: 'bg-blue-500',
  alert: 'bg-amber-500',
  incident: 'bg-red-500',
  action: 'bg-purple-500',
  resolved: 'bg-emerald-500',
};

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<IncidentCorrelation[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/incidents').then((r) => r.json()).then((d) => {
      setIncidents(d.incidents || []);
      if (d.incidents?.length > 0) setSelected(d.incidents[0].incident_id);
    });
  }, []);

  const active = incidents.filter((i) => i.incident_status === 'active').length;
  const resolved = incidents.filter((i) => i.incident_status === 'resolved').length;
  const withDeploy = incidents.filter((i) => i.suspected_deploy).length;
  const avgTTR = incidents.filter((i) => i.ttr).reduce((s, i) => s + (i.ttr || 0), 0) / (incidents.filter((i) => i.ttr).length || 1);

  const selectedIncident = incidents.find((i) => i.incident_id === selected);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Incident Correlation</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Correlate incidents with deployments to find root causes faster
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Active Incidents" value={active} icon={AlertTriangle} color="red" />
        <MetricCard title="Resolved" value={resolved} icon={CheckCircle} color="emerald" />
        <MetricCard title="Deploy Correlated" value={`${withDeploy}/${incidents.length}`} icon={Link2} color="purple" />
        <MetricCard title="Avg TTR" value={Math.round(avgTTR)} unit="min" icon={Clock} color="blue" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Incident List */}
        <div className="space-y-2">
          {incidents.map((inc) => (
            <button
              key={inc.incident_id}
              onClick={() => setSelected(inc.incident_id)}
              className={clsx(
                'w-full rounded-xl border p-4 text-left transition-colors',
                selected === inc.incident_id
                  ? 'border-emerald-600 bg-zinc-900'
                  : 'border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/60'
              )}
            >
              <div className="flex items-center gap-2">
                <span className={clsx(
                  'h-2.5 w-2.5 rounded-full',
                  inc.incident_status === 'active' ? 'bg-red-500 animate-pulse' :
                  inc.incident_status === 'investigating' ? 'bg-amber-500 animate-pulse' :
                  'bg-emerald-500'
                )} />
                <span className="text-xs font-mono text-zinc-500">{inc.incident_id}</span>
                <span className={clsx(
                  'ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium',
                  inc.incident_severity === 'critical' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                )}>
                  {inc.incident_severity}
                </span>
              </div>
              <p className="mt-2 text-sm font-medium text-white">{inc.incident_title}</p>
              <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
                {inc.suspected_deploy && (
                  <span className="flex items-center gap-1 text-purple-400">
                    <Link2 className="h-3 w-3" /> Deploy linked
                  </span>
                )}
                {inc.ttr && <span>TTR: {inc.ttr}m</span>}
              </div>
            </button>
          ))}
        </div>

        {/* Incident Detail */}
        {selectedIncident && (
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex items-center gap-3">
                <div className={clsx(
                  'rounded-lg p-2',
                  selectedIncident.incident_status === 'active' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                )}>
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedIncident.incident_title}</h3>
                  <p className="text-xs text-zinc-500">
                    {selectedIncident.incident_id} | Status: {selectedIncident.incident_status} |
                    Affected: {selectedIncident.affected_services.join(', ')}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-zinc-800/50 p-3 text-center">
                  <p className="text-xs text-zinc-500">Time to Detect</p>
                  <p className="text-xl font-bold text-amber-400">{selectedIncident.ttd ?? '—'}m</p>
                </div>
                <div className="rounded-lg bg-zinc-800/50 p-3 text-center">
                  <p className="text-xs text-zinc-500">Time to Resolve</p>
                  <p className="text-xl font-bold text-emerald-400">{selectedIncident.ttr ?? 'Ongoing'}{selectedIncident.ttr ? 'm' : ''}</p>
                </div>
                <div className="rounded-lg bg-zinc-800/50 p-3 text-center">
                  <p className="text-xs text-zinc-500">Deploy Linked</p>
                  <p className="text-xl font-bold text-purple-400">{selectedIncident.suspected_deploy ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>

            {/* Suspected Deploy */}
            {selectedIncident.suspected_deploy && (
              <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-6">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-purple-400">
                  <Rocket className="h-4 w-4" />
                  Suspected Deployment
                </h4>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Version</span>
                    <span className="text-white">{selectedIncident.suspected_deploy.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Repository</span>
                    <span className="font-mono text-white">{selectedIncident.suspected_deploy.repo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Author</span>
                    <span className="text-white">{selectedIncident.suspected_deploy.author}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Commit</span>
                    <span className="text-zinc-300">{selectedIncident.suspected_deploy.commit_message}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h4 className="mb-4 text-sm font-semibold text-white">Incident Timeline</h4>
              <div className="space-y-0">
                {selectedIncident.timeline.map((t, idx) => {
                  const Icon = timelineTypeIcons[t.type] || AlertTriangle;
                  return (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={clsx('flex h-8 w-8 items-center justify-center rounded-full', timelineTypeColors[t.type])}>
                          <Icon className="h-3.5 w-3.5 text-white" />
                        </div>
                        {idx < selectedIncident.timeline.length - 1 && (
                          <div className="h-8 w-px bg-zinc-700" />
                        )}
                      </div>
                      <div className="pb-6">
                        <p className="text-sm text-white">{t.event}</p>
                        <p className="text-xs text-zinc-500">
                          {new Date(t.time).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
