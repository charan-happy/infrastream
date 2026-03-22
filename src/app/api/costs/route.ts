import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { generateDeployCosts, generateRepoCosts, generateCostHistory } from '@/lib/demo-data-extended';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const view = searchParams.get('view') || 'deploys';
  const days = parseInt(searchParams.get('days') || '30');

  if (view === 'repos') {
    try {
      const repos = await query<{
        repo: string;
        deploy_count: string;
      }>(`
        SELECT repo, COUNT(*) as deploy_count
        FROM events WHERE type = 'deployment'
        AND created_at > NOW() - interval '30 days'
        GROUP BY repo ORDER BY deploy_count DESC
      `);
      if (repos.length > 0) {
        const result = repos.map((r) => {
          const count = parseInt(r.deploy_count);
          const avgCost = +(0.15 + Math.random() * 0.35).toFixed(3);
          return {
            repo: r.repo,
            total_cost: +(count * avgCost).toFixed(2),
            deploy_count: count,
            avg_cost_per_deploy: avgCost,
            cost_trend: +(-15 + Math.random() * 30).toFixed(1),
          };
        });
        return NextResponse.json({ repos: result, source: 'database' });
      }
    } catch {}
    return NextResponse.json({ repos: generateRepoCosts(), source: 'demo' });
  }

  if (view === 'history') {
    return NextResponse.json({ history: generateCostHistory(days), source: 'demo' });
  }

  // Default: deploy costs
  try {
    const deploys = await query<{
      id: string;
      repo: string;
      title: string;
      author: string;
      status: string;
      branch: string;
      created_at: string;
    }>(`
      SELECT id, repo, title, author, status, branch, created_at
      FROM events WHERE type = 'deployment'
      ORDER BY created_at DESC LIMIT 30
    `);
    if (deploys.length > 0) {
      const costs = deploys.map((d, i) => {
        const buildMinutes = 2 + Math.floor(Math.random() * 15);
        const buildCost = +(buildMinutes * 0.008).toFixed(3);
        const computeCost = +(0.05 + Math.random() * 0.3).toFixed(3);
        const infraCost = +(0.02 + Math.random() * 0.1).toFixed(3);
        return {
          id: d.id,
          repo: d.repo,
          environment: d.title.includes('production') ? 'production' : d.title.includes('staging') ? 'staging' : 'development',
          version: `v${d.title.match(/v[\d.]+/)?.[0] || '1.0.' + i}`,
          compute_cost: computeCost,
          build_minutes: buildMinutes,
          build_cost: buildCost,
          infra_cost: infraCost,
          total_cost: +(buildCost + computeCost + infraCost).toFixed(3),
          deployed_by: d.author,
          deployed_at: d.created_at,
        };
      });
      return NextResponse.json({ costs, source: 'database' });
    }
  } catch {}

  return NextResponse.json({ costs: generateDeployCosts(), source: 'demo' });
}
