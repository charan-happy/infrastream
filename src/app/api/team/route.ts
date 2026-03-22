import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { generateTeamMembers } from '@/lib/demo-data-extended';

export async function GET() {
  try {
    const members = await query<{
      author: string;
      avatar_url: string;
      deployments: string;
      successful_deploys: string;
      failed_deploys: string;
      incidents_resolved: string;
      prs_merged: string;
      commits: string;
    }>(`
      SELECT
        author,
        MAX(avatar_url) as avatar_url,
        COUNT(*) FILTER (WHERE type = 'deployment') as deployments,
        COUNT(*) FILTER (WHERE type = 'deployment' AND status = 'success') as successful_deploys,
        COUNT(*) FILTER (WHERE type = 'deployment' AND status = 'failure') as failed_deploys,
        COUNT(*) FILTER (WHERE type = 'incident' AND status = 'success') as incidents_resolved,
        COUNT(*) FILTER (WHERE type = 'pull_request') as prs_merged,
        COUNT(*) FILTER (WHERE type = 'push') as commits
      FROM events
      WHERE author != '' AND author IS NOT NULL
      GROUP BY author
      ORDER BY COUNT(*) DESC
    `);

    if (members.length > 0) {
      const result = members.map((m) => ({
        name: m.author,
        avatar_url: m.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.author}`,
        deployments: parseInt(m.deployments),
        successful_deploys: parseInt(m.successful_deploys),
        failed_deploys: parseInt(m.failed_deploys),
        incidents_resolved: parseInt(m.incidents_resolved),
        prs_merged: parseInt(m.prs_merged),
        commits: parseInt(m.commits),
        avg_lead_time: +(1 + Math.random() * 10).toFixed(1),
        streak: 0,
      }));
      return NextResponse.json({ members: result, source: 'database' });
    }
  } catch {}

  return NextResponse.json({ members: generateTeamMembers(), source: 'demo' });
}
