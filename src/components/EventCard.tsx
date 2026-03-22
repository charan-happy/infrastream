import { clsx } from 'clsx';
import {
  GitCommit,
  GitPullRequest,
  Rocket,
  AlertTriangle,
  Bell,
  Hammer,
} from 'lucide-react';
import type { DevOpsEvent } from '@/lib/types';

const typeIcons = {
  push: GitCommit,
  pull_request: GitPullRequest,
  deployment: Rocket,
  incident: AlertTriangle,
  alert: Bell,
  build: Hammer,
};

const typeColors = {
  push: 'text-blue-400 bg-blue-500/10',
  pull_request: 'text-purple-400 bg-purple-500/10',
  deployment: 'text-emerald-400 bg-emerald-500/10',
  incident: 'text-red-400 bg-red-500/10',
  alert: 'text-amber-400 bg-amber-500/10',
  build: 'text-zinc-400 bg-zinc-500/10',
};

const statusColors = {
  success: 'text-emerald-400',
  failure: 'text-red-400',
  pending: 'text-amber-400',
  in_progress: 'text-blue-400',
};

const severityBorders = {
  info: 'border-l-zinc-700',
  warning: 'border-l-amber-500',
  critical: 'border-l-red-500',
};

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function EventCard({ event }: { event: DevOpsEvent }) {
  const Icon = typeIcons[event.type] || GitCommit;

  return (
    <div
      className={clsx(
        'flex items-start gap-4 rounded-lg border border-zinc-800 border-l-2 bg-zinc-900/30 p-4 transition-colors hover:bg-zinc-900/60',
        severityBorders[event.severity]
      )}
    >
      <div className={clsx('rounded-lg p-2', typeColors[event.type])}>
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-white">
            {event.title}
          </span>
          <span
            className={clsx(
              'shrink-0 text-xs font-medium',
              statusColors[event.status]
            )}
          >
            {event.status}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
          <span className="font-mono truncate max-w-[150px] sm:max-w-none">{event.repo}</span>
          <span className="hidden sm:inline">{event.branch}</span>
          <span>{event.author}</span>
        </div>
      </div>

      <span className="shrink-0 text-xs text-zinc-600">{timeAgo(event.created_at)}</span>
    </div>
  );
}
