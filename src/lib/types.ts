export type EventType = 'push' | 'pull_request' | 'deployment' | 'incident' | 'alert' | 'build';
export type EventSeverity = 'info' | 'warning' | 'critical';
export type EventStatus = 'success' | 'failure' | 'pending' | 'in_progress';

export interface DevOpsEvent {
  id: string;
  type: EventType;
  source: string;
  repo: string;
  branch: string;
  title: string;
  description: string;
  severity: EventSeverity;
  status: EventStatus;
  author: string;
  avatar_url: string;
  metadata: Record<string, unknown>;
  created_at: string;
  processed_at: string | null;
}

export interface DORAMetrics {
  deployment_frequency: number;  // deploys per day
  lead_time: number;            // hours
  change_failure_rate: number;  // percentage
  mttr: number;                 // hours (mean time to recovery)
  period: string;               // e.g. "last_7_days"
}

export interface DORAHistory {
  date: string;
  deployment_frequency: number;
  lead_time: number;
  change_failure_rate: number;
  mttr: number;
}

export interface EventStats {
  total_events: number;
  events_today: number;
  success_rate: number;
  active_incidents: number;
  top_repos: { repo: string; count: number }[];
}

export interface StreamConfig {
  kafka_connected: boolean;
  pg_connected: boolean;
  valkey_connected: boolean;
  demo_mode: boolean;
  webhook_url: string;
}
