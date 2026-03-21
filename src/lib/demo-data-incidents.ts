export interface IncidentCorrelation {
  incident_id: string;
  incident_title: string;
  incident_severity: 'critical' | 'warning';
  incident_status: 'active' | 'resolved' | 'investigating';
  incident_created: string;
  incident_resolved: string | null;
  ttd: number | null; // time to detect (minutes)
  ttr: number | null; // time to resolve (minutes)
  suspected_deploy: {
    id: string;
    version: string;
    repo: string;
    branch: string;
    author: string;
    deployed_at: string;
    commit_message: string;
  } | null;
  affected_services: string[];
  timeline: {
    time: string;
    event: string;
    type: 'deploy' | 'alert' | 'incident' | 'action' | 'resolved';
  }[];
}

const repos = ['infrastream/api', 'infrastream/frontend', 'infrastream/worker', 'infrastream/infra'];

export function generateIncidentCorrelations(): IncidentCorrelation[] {
  const now = Date.now();
  return [
    {
      incident_id: 'INC-001',
      incident_title: 'API response time > 5s on /api/events',
      incident_severity: 'critical',
      incident_status: 'resolved',
      incident_created: new Date(now - 2 * 3600000).toISOString(),
      incident_resolved: new Date(now - 1 * 3600000).toISOString(),
      ttd: 8,
      ttr: 52,
      suspected_deploy: {
        id: 'dep-42',
        version: 'v2.1.0',
        repo: 'infrastream/api',
        branch: 'main',
        author: 'alice-dev',
        deployed_at: new Date(now - 2.5 * 3600000).toISOString(),
        commit_message: 'feat: add N+1 query for event relations',
      },
      affected_services: ['api-server', 'event-processor'],
      timeline: [
        { time: new Date(now - 2.5 * 3600000).toISOString(), event: 'Deploy v2.1.0 to production', type: 'deploy' },
        { time: new Date(now - 2.15 * 3600000).toISOString(), event: 'Latency alert triggered (p99 > 3s)', type: 'alert' },
        { time: new Date(now - 2 * 3600000).toISOString(), event: 'Incident created - API latency critical', type: 'incident' },
        { time: new Date(now - 1.8 * 3600000).toISOString(), event: 'Root cause identified: N+1 query in event relations', type: 'action' },
        { time: new Date(now - 1.5 * 3600000).toISOString(), event: 'Hotfix deployed - added eager loading', type: 'deploy' },
        { time: new Date(now - 1 * 3600000).toISOString(), event: 'Latency normalized, incident resolved', type: 'resolved' },
      ],
    },
    {
      incident_id: 'INC-002',
      incident_title: 'Kafka consumer lag exceeding 10k messages',
      incident_severity: 'warning',
      incident_status: 'resolved',
      incident_created: new Date(now - 24 * 3600000).toISOString(),
      incident_resolved: new Date(now - 22 * 3600000).toISOString(),
      ttd: 15,
      ttr: 105,
      suspected_deploy: {
        id: 'dep-39',
        version: 'v2.0.8',
        repo: 'infrastream/worker',
        branch: 'main',
        author: 'bob-ops',
        deployed_at: new Date(now - 25 * 3600000).toISOString(),
        commit_message: 'refactor: change consumer batch size to 1',
      },
      affected_services: ['kafka-consumer', 'event-processor'],
      timeline: [
        { time: new Date(now - 25 * 3600000).toISOString(), event: 'Deploy v2.0.8 (batch size change)', type: 'deploy' },
        { time: new Date(now - 24.25 * 3600000).toISOString(), event: 'Consumer lag alert > 5k', type: 'alert' },
        { time: new Date(now - 24 * 3600000).toISOString(), event: 'Incident created - consumer lag critical', type: 'incident' },
        { time: new Date(now - 23 * 3600000).toISOString(), event: 'Identified: batch size=1 causing throughput drop', type: 'action' },
        { time: new Date(now - 22.5 * 3600000).toISOString(), event: 'Rollback to v2.0.7 deployed', type: 'deploy' },
        { time: new Date(now - 22 * 3600000).toISOString(), event: 'Consumer lag cleared, incident resolved', type: 'resolved' },
      ],
    },
    {
      incident_id: 'INC-003',
      incident_title: 'Database connection pool exhausted',
      incident_severity: 'critical',
      incident_status: 'active',
      incident_created: new Date(now - 0.5 * 3600000).toISOString(),
      incident_resolved: null,
      ttd: 3,
      ttr: null,
      suspected_deploy: {
        id: 'dep-45',
        version: 'v2.2.0',
        repo: 'infrastream/api',
        branch: 'feature/reports',
        author: 'carol-sre',
        deployed_at: new Date(now - 1 * 3600000).toISOString(),
        commit_message: 'feat: add CSV export with streaming queries',
      },
      affected_services: ['api-server', 'postgresql'],
      timeline: [
        { time: new Date(now - 1 * 3600000).toISOString(), event: 'Deploy v2.2.0 with CSV export feature', type: 'deploy' },
        { time: new Date(now - 0.55 * 3600000).toISOString(), event: 'Connection pool usage alert > 90%', type: 'alert' },
        { time: new Date(now - 0.5 * 3600000).toISOString(), event: 'Incident created - DB pool exhausted', type: 'incident' },
        { time: new Date(now - 0.3 * 3600000).toISOString(), event: 'Investigating: CSV export opens connections without releasing', type: 'action' },
      ],
    },
    {
      incident_id: 'INC-004',
      incident_title: 'Frontend 502 errors on dashboard load',
      incident_severity: 'warning',
      incident_status: 'resolved',
      incident_created: new Date(now - 72 * 3600000).toISOString(),
      incident_resolved: new Date(now - 71 * 3600000).toISOString(),
      ttd: 5,
      ttr: 45,
      suspected_deploy: null,
      affected_services: ['frontend', 'nginx'],
      timeline: [
        { time: new Date(now - 72 * 3600000).toISOString(), event: '502 error rate spike detected', type: 'alert' },
        { time: new Date(now - 72 * 3600000).toISOString(), event: 'Incident created - 502 errors on frontend', type: 'incident' },
        { time: new Date(now - 71.5 * 3600000).toISOString(), event: 'Root cause: upstream nginx config change during maintenance', type: 'action' },
        { time: new Date(now - 71 * 3600000).toISOString(), event: 'Nginx config reverted, incident resolved', type: 'resolved' },
      ],
    },
  ];
}
