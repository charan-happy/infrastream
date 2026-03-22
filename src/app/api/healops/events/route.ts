import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { generateHealingEvents } from '@/lib/demo-data-healops';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get('type');
  const status = searchParams.get('status');
  const limit = Math.min(parseInt(searchParams.get('limit') || '30'), 100);

  try {
    let sql = `SELECT * FROM events WHERE source = 'healops'`;
    const params: unknown[] = [];
    let idx = 1;

    if (type) { sql += ` AND metadata->>'healing_type' = $${idx++}`; params.push(type); }
    if (status) { sql += ` AND status = $${idx++}`; params.push(status === 'healed' ? 'success' : status === 'failed' ? 'failure' : status); }

    sql += ` ORDER BY created_at DESC LIMIT $${idx}`;
    params.push(limit);

    const rows = await query<{
      id: string; repo: string; title: string; description: string;
      severity: string; status: string; created_at: string;
      processed_at: string | null; metadata: Record<string, unknown>;
    }>(sql, params);

    const events = rows.map((r) => ({
      id: r.id,
      repo: r.repo,
      type: (r.metadata?.healing_type as string) || 'security_fix',
      status: r.status === 'success' ? 'healed' : r.status === 'failure' ? 'failed' : r.status === 'pending' ? 'detected' : 'healing',
      title: r.title,
      severity: r.severity,
      detected_at: r.created_at,
      healed_at: r.processed_at,
      time_to_heal: r.processed_at ? Math.round((new Date(r.processed_at).getTime() - new Date(r.created_at).getTime()) / 60000) : null,
      auto_fix: (r.metadata?.auto_fix as boolean) ?? true,
      pr_number: (r.metadata?.pr_number as number) || null,
      confidence: (r.metadata?.confidence as number) || 85,
    }));
    return NextResponse.json({ events, source: 'database' });
  } catch {}

  let events = generateHealingEvents(50);
  if (type) events = events.filter((e) => e.type === type);
  if (status) events = events.filter((e) => e.status === status);
  return NextResponse.json({ events: events.slice(0, limit), source: 'demo' });
}
