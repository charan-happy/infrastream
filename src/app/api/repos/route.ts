import { NextResponse } from 'next/server';
import { generateDemoEvents } from '@/lib/demo-data';

interface RepoSummary {
  repo: string;
  total_events: number;
  deployments: number;
  incidents: number;
  success_rate: number;
  last_deploy: string | null;
  dora: {
    deployment_frequency: number;
    lead_time: number;
    change_failure_rate: number;
    mttr: number;
  };
}

export async function GET() {
  const events = generateDemoEvents(200);
  const repos = [...new Set(events.map((e) => e.repo))];

  const summaries: RepoSummary[] = repos.map((repo) => {
    const repoEvents = events.filter((e) => e.repo === repo);
    const deploys = repoEvents.filter((e) => e.type === 'deployment');
    const incidents = repoEvents.filter((e) => e.type === 'incident');
    const successful = repoEvents.filter((e) => e.status === 'success');
    const lastDeploy = deploys.length > 0 ? deploys[0].created_at : null;

    return {
      repo,
      total_events: repoEvents.length,
      deployments: deploys.length,
      incidents: incidents.length,
      success_rate: repoEvents.length > 0 ? +((successful.length / repoEvents.length) * 100).toFixed(1) : 0,
      last_deploy: lastDeploy,
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
