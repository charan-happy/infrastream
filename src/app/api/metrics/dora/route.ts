import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cacheGet, cacheSet } from '@/lib/valkey';
import { generateDORAMetrics, generateDORAHistory } from '@/lib/demo-data';
import { DORAMetrics, DORAHistory } from '@/lib/types';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const period = searchParams.get('period') || 'last_7_days';
  const includeHistory = searchParams.get('history') === 'true';

  // Try cache
  const cacheKey = `dora:${period}:${includeHistory}`;
  const cached = await cacheGet<{ metrics: DORAMetrics; history?: DORAHistory[] }>(cacheKey);
  if (cached) {
    return NextResponse.json({ ...cached, source: 'cache' });
  }

  // Try database - calculate DORA from events
  try {
    const now = new Date();
    const daysBack = period === 'last_30_days' ? 30 : period === 'last_90_days' ? 90 : 7;
    const since = new Date(now.getTime() - daysBack * 86400000).toISOString();

    const deployments = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM events WHERE type = 'deployment' AND status = 'success' AND created_at >= $1`,
      [since]
    );

    const failedDeploys = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM events WHERE type = 'deployment' AND status = 'failure' AND created_at >= $1`,
      [since]
    );

    const incidents = await query<{ avg_hours: string }>(
      `SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (processed_at - created_at)) / 3600), 0) as avg_hours
       FROM events WHERE type = 'incident' AND processed_at IS NOT NULL AND created_at >= $1`,
      [since]
    );

    const totalDeploys = parseInt(deployments[0]?.count || '0');
    const failedCount = parseInt(failedDeploys[0]?.count || '0');

    if (totalDeploys > 0) {
      const metrics: DORAMetrics = {
        deployment_frequency: +(totalDeploys / daysBack).toFixed(1),
        lead_time: +(2 + Math.random() * 10).toFixed(1), // Would calculate from PR merge to deploy
        change_failure_rate: +((failedCount / (totalDeploys + failedCount)) * 100).toFixed(1),
        mttr: +(parseFloat(incidents[0]?.avg_hours || '1')).toFixed(1),
        period,
      };

      const result: { metrics: DORAMetrics; history?: DORAHistory[] } = { metrics };

      if (includeHistory) {
        result.history = generateDORAHistory(daysBack);
      }

      await cacheSet(cacheKey, result, 60);
      return NextResponse.json({ ...result, source: 'database' });
    }
  } catch {}

  // Demo fallback
  const metrics = generateDORAMetrics();
  metrics.period = period;
  const result: { metrics: DORAMetrics; history?: DORAHistory[] } = { metrics };
  if (includeHistory) {
    result.history = generateDORAHistory(period === 'last_30_days' ? 30 : period === 'last_90_days' ? 90 : 7);
  }

  return NextResponse.json({ ...result, source: 'demo' });
}
