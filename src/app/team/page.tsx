'use client';

import { useState, useEffect } from 'react';
import { MetricCard } from '@/components/MetricCard';
import { Users, Trophy, Flame, GitPullRequest } from 'lucide-react';
import type { TeamMember } from '@/lib/demo-data-extended';

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [sortBy, setSortBy] = useState<keyof TeamMember>('deployments');

  useEffect(() => {
    fetch('/api/team').then((r) => r.json()).then((d) => setMembers(d.members || []));
  }, []);

  const sorted = [...members].sort((a, b) => {
    const av = a[sortBy];
    const bv = b[sortBy];
    return typeof av === 'number' && typeof bv === 'number' ? bv - av : 0;
  });

  const totalDeploys = members.reduce((s, m) => s + m.deployments, 0);
  const totalPRs = members.reduce((s, m) => s + m.prs_merged, 0);
  const topStreak = Math.max(...members.map((m) => m.streak), 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Team Leaderboard</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Track team contributions, deploy streaks, and incident response
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Team Size" value={members.length} icon={Users} color="purple" />
        <MetricCard title="Total Deploys" value={totalDeploys} icon={Trophy} color="emerald" trend="up" trendValue="+18%" />
        <MetricCard title="Top Streak" value={topStreak} unit="deploys" icon={Flame} color="amber" />
        <MetricCard title="PRs Merged" value={totalPRs} icon={GitPullRequest} color="blue" trend="up" trendValue="+9%" />
      </div>

      {/* Sort controls */}
      <div className="flex gap-2">
        {(['deployments', 'incidents_resolved', 'prs_merged', 'commits', 'streak'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setSortBy(key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              sortBy === key ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {key.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="space-y-3">
        {sorted.map((member, idx) => (
          <div
            key={member.name}
            className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:bg-zinc-900/80"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-lg font-bold text-zinc-400">
              {idx === 0 ? '\u{1F947}' : idx === 1 ? '\u{1F948}' : idx === 2 ? '\u{1F949}' : `#${idx + 1}`}
            </div>

            <img src={member.avatar_url} alt={member.name} className="h-10 w-10 rounded-full bg-zinc-800" />

            <div className="min-w-0 flex-1">
              <p className="font-medium text-white">{member.name}</p>
              <p className="text-xs text-zinc-500">
                {member.streak > 0 && <span className="text-amber-400">{member.streak} deploy streak</span>}
              </p>
            </div>

            <div className="grid grid-cols-5 gap-6 text-center">
              <div>
                <p className="text-lg font-bold text-white">{member.deployments}</p>
                <p className="text-[10px] text-zinc-500">deploys</p>
              </div>
              <div>
                <p className="text-lg font-bold text-emerald-400">{member.successful_deploys}</p>
                <p className="text-[10px] text-zinc-500">success</p>
              </div>
              <div>
                <p className="text-lg font-bold text-red-400">{member.failed_deploys}</p>
                <p className="text-[10px] text-zinc-500">failed</p>
              </div>
              <div>
                <p className="text-lg font-bold text-purple-400">{member.incidents_resolved}</p>
                <p className="text-[10px] text-zinc-500">incidents</p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-400">{member.prs_merged}</p>
                <p className="text-[10px] text-zinc-500">PRs</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
