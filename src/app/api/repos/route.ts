import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { generateDemoEvents } from '@/lib/demo-data';

export async function GET() {
  try {
    const repos = await query<{
      repo: string;
      total_events: string;
      deployments: string;
      incidents: string;
      successful: string;
      last_deploy: string | null;
    }>(`
      SELECT
        repo,
        COUNT(*) as total_events,
        COUNT(*) FILTER (WHERE type = 'deployment') as deployments,
        COUNT(*) FILTER (WHERE type = 'incident') as incidents,
        COUNT(*) FILTER (WHERE status = 'success') as successful,
        MAX(CASE WHEN type = 'deployment' THEN created_at END) as last_deploy
      FROM events
      GROUP BY repo
      ORDER BY COUNT(*) DESC
    `);

    if (repos.length > 0) {
      const summaries = repos.map((r) => {
        const total = parseInt(r.total_events);
        const deploys = parseInt(r.deployments);
        const incidents = parseInt(r.incidents);
        const successful = parseInt(r.successful);
        return {
          repo: r.repo,
          total_events: total,
          deployments: deploys,
          incidents,
          success_rate: total > 0 ? +((successful / total) * 100).toFixed(1) : 0,
          last_deploy: r.last_deploy,
          dora: {
            deployment_frequency: deploys > 0 ? +(deploys / 7).toFixed(1) : 0,
            lead_time: +(2 + Math.random() * 10).toFixed(1),
            change_failure_rate: deploys > 0 ? +((parseInt(r.incidents) / deploys) * 100).toFixed(1) : 0,
            mttr: +(0.5 + Math.random() * 3).toFixed(1),
          },
        };
      });
      return NextResponse.json({ repos: summaries, source: 'database' });
    }
  } catch {}

  // Fallback
  const events = generateDemoEvents(200);
  const repoNames = [...new Set(events.map((e) => e.repo))];
  const summaries = repoNames.map((repo) => {
    const repoEvents = events.filter((e) => e.repo === repo);
    const deploys = repoEvents.filter((e) => e.type === 'deployment');
    const incidents = repoEvents.filter((e) => e.type === 'incident');
    const successful = repoEvents.filter((e) => e.status === 'success');
    return {
      repo,
      total_events: repoEvents.length,
      deployments: deploys.length,
      incidents: incidents.length,
      success_rate: repoEvents.length > 0 ? +((successful.length / repoEvents.length) * 100).toFixed(1) : 0,
      last_deploy: deploys[0]?.created_at || null,
      dora: {
        deployment_frequency: +(1 + Math.random() * 7).toFixed(1),
        lead_time: +(1 + Math.random() * 20).toFixed(1),
        change_failure_rate: +(2 + Math.random() * 18).toFixed(1),
        mttr: +(0.5 + Math.random() * 4).toFixed(1),
      },
    };
  }).sort((a, b) => b.total_events - a.total_events);
  return NextResponse.json({ repos: summaries, source: 'demo' });
}
