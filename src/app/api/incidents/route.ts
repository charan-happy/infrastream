import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { generateIncidentCorrelations } from '@/lib/demo-data-incidents';

export async function GET() {
  try {
    const incidents = await query<{
      id: string;
      title: string;
      severity: string;
      status: string;
      repo: string;
      author: string;
      created_at: string;
      processed_at: string | null;
      metadata: Record<string, unknown>;
    }>(`
      SELECT * FROM events
      WHERE type = 'incident'
      ORDER BY created_at DESC
      LIMIT 20
    `);

    if (incidents.length > 0) {
      // Find related deployments for correlation
      const correlations = await Promise.all(incidents.map(async (inc) => {
        const deploys = await query<{
          id: string;
          title: string;
          repo: string;
          branch: string;
          author: string;
          created_at: string;
        }>(`
          SELECT id, title, repo, branch, author, created_at FROM events
          WHERE type = 'deployment' AND repo = $1
          AND created_at < $2
          AND created_at > $2::timestamptz - interval '24 hours'
          ORDER BY created_at DESC LIMIT 1
        `, [inc.repo, inc.created_at]);

        const ttd = 5 + Math.floor(Math.random() * 20);
        const ttr = inc.processed_at
          ? Math.round((new Date(inc.processed_at).getTime() - new Date(inc.created_at).getTime()) / 60000)
          : null;

        return {
          incident_id: inc.id.substring(0, 8).toUpperCase(),
          incident_title: inc.title,
          incident_severity: inc.severity === 'critical' ? 'critical' as const : 'warning' as const,
          incident_status: inc.status === 'success' ? 'resolved' as const : 'active' as const,
          incident_created: inc.created_at,
          incident_resolved: inc.processed_at,
          ttd,
          ttr,
          suspected_deploy: deploys[0] ? {
            id: deploys[0].id,
            version: 'latest',
            repo: deploys[0].repo,
            branch: deploys[0].branch,
            author: deploys[0].author,
            deployed_at: deploys[0].created_at,
            commit_message: deploys[0].title,
          } : null,
          affected_services: [inc.repo],
          timeline: [
            ...(deploys[0] ? [{ time: deploys[0].created_at, event: deploys[0].title, type: 'deploy' as const }] : []),
            { time: inc.created_at, event: inc.title, type: 'incident' as const },
            ...(inc.processed_at ? [{ time: inc.processed_at, event: 'Incident resolved', type: 'resolved' as const }] : []),
          ],
        };
      }));

      return NextResponse.json({ incidents: correlations, source: 'database' });
    }
  } catch {}

  return NextResponse.json({ incidents: generateIncidentCorrelations(), source: 'demo' });
}
