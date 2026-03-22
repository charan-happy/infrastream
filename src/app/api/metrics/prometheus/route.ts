import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const lines: string[] = [];

  try {
    // Event counts by type
    const typeCounts = await query<{ type: string; count: string }>(
      `SELECT type, COUNT(*) as count FROM events GROUP BY type`
    );
    for (const r of typeCounts) {
      lines.push(`infrastream_events_total{type="${r.type}"} ${r.count}`);
    }

    // Event counts by source
    const sourceCounts = await query<{ source: string; count: string }>(
      `SELECT source, COUNT(*) as count FROM events GROUP BY source`
    );
    for (const r of sourceCounts) {
      lines.push(`infrastream_events_by_source{source="${r.source}"} ${r.count}`);
    }

    // Events in last 24h
    const recent = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM events WHERE created_at > NOW() - interval '24 hours'`
    );
    lines.push(`infrastream_events_24h ${recent[0]?.count || 0}`);

    // Active incidents
    const incidents = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM events WHERE type = 'incident' AND status != 'success'`
    );
    lines.push(`infrastream_active_incidents ${incidents[0]?.count || 0}`);

    // Deployment stats
    const deploys = await query<{ total: string; success: string; failed: string }>(
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'success') as success,
        COUNT(*) FILTER (WHERE status = 'failure') as failed
      FROM events WHERE type = 'deployment'`
    );
    lines.push(`infrastream_deployments_total ${deploys[0]?.total || 0}`);
    lines.push(`infrastream_deployments_success ${deploys[0]?.success || 0}`);
    lines.push(`infrastream_deployments_failed ${deploys[0]?.failed || 0}`);

    // DORA metrics
    const daysBack = 7;
    const deployCount = parseInt(deploys[0]?.total || '0');
    const failedCount = parseInt(deploys[0]?.failed || '0');
    const deployFreq = deployCount > 0 ? (deployCount / daysBack) : 0;
    const cfr = deployCount > 0 ? (failedCount / deployCount) : 0;

    lines.push(`infrastream_deployment_frequency ${deployFreq.toFixed(2)}`);
    lines.push(`infrastream_change_failure_rate ${cfr.toFixed(4)}`);

    // Lead time (avg time from push to deploy per repo)
    const leadTime = await query<{ avg_hours: string }>(
      `SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (processed_at - created_at)) / 3600), 0) as avg_hours
       FROM events WHERE type = 'deployment' AND processed_at IS NOT NULL`
    );
    lines.push(`infrastream_lead_time_hours ${parseFloat(leadTime[0]?.avg_hours || '0').toFixed(2)}`);

    // MTTR
    const mttr = await query<{ avg_hours: string }>(
      `SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (processed_at - created_at)) / 3600), 0) as avg_hours
       FROM events WHERE type = 'incident' AND processed_at IS NOT NULL`
    );
    lines.push(`infrastream_mttr_hours ${parseFloat(mttr[0]?.avg_hours || '0').toFixed(2)}`);

    // Repos monitored
    const repos = await query<{ count: string }>(
      `SELECT COUNT(DISTINCT repo) as count FROM events`
    );
    lines.push(`infrastream_repos_monitored ${repos[0]?.count || 0}`);

    // Unique authors (active users)
    const authors = await query<{ count: string }>(
      `SELECT COUNT(DISTINCT author) as count FROM events WHERE created_at > NOW() - interval '24 hours'`
    );
    lines.push(`infrastream_active_users ${authors[0]?.count || 0}`);

    // Total unique authors
    const totalAuthors = await query<{ count: string }>(
      `SELECT COUNT(DISTINCT author) as count FROM events`
    );
    lines.push(`infrastream_concurrent_users ${totalAuthors[0]?.count || 0}`);

    // Events by repo (for country-like breakdown)
    const repoCounts = await query<{ repo: string; count: string }>(
      `SELECT repo, COUNT(*) as count FROM events GROUP BY repo ORDER BY count DESC LIMIT 10`
    );
    for (const r of repoCounts) {
      lines.push(`infrastream_requests_by_country{country="${r.repo}"} ${r.count}`);
    }

    // HealOps healing events
    const healops = await query<{ status: string; count: string }>(
      `SELECT status, COUNT(*) as count FROM events WHERE source = 'healops' GROUP BY status`
    );
    for (const r of healops) {
      lines.push(`infrastream_healops_healing_total{status="${r.status}"} ${r.count}`);
    }

    // HTTP request total (approximate from events)
    const totalEvents = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM events`
    );
    lines.push(`infrastream_http_requests_total ${totalEvents[0]?.count || 0}`);

  } catch {
    lines.push('# DB not connected');
    lines.push('infrastream_up 0');
  }

  lines.push('infrastream_up 1');

  return new NextResponse(lines.join('\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
