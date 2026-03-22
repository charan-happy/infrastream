import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cacheGet, cacheSet } from '@/lib/valkey';
import { generateDemoEvents } from '@/lib/demo-data';
import { DevOpsEvent } from '@/lib/types';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get('type');
  const repo = searchParams.get('repo');
  const severity = searchParams.get('severity');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
  const offset = parseInt(searchParams.get('offset') || '0');

  // Try cache first
  const cacheKey = `events:${type}:${repo}:${severity}:${limit}:${offset}`;
  const cached = await cacheGet<DevOpsEvent[]>(cacheKey);
  if (cached) {
    return NextResponse.json({ events: cached, source: 'cache' });
  }

  // Try database
  try {
    let sql = 'SELECT * FROM events WHERE 1=1';
    const params: unknown[] = [];
    let paramIdx = 1;

    if (type) {
      sql += ` AND type = $${paramIdx++}`;
      params.push(type);
    }
    if (repo) {
      sql += ` AND repo = $${paramIdx++}`;
      params.push(repo);
    }
    if (severity) {
      sql += ` AND severity = $${paramIdx++}`;
      params.push(severity);
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIdx++} OFFSET $${paramIdx}`;
    params.push(limit, offset);

    const events = await query<DevOpsEvent>(sql, params);

    if (events.length > 0) {
      await cacheSet(cacheKey, events, 30);
    }
    // Always return DB result when connected (even if empty)
    return NextResponse.json({ events, source: 'database' });
  } catch {}

  // Fallback to demo data only when DB is not connected
  let events = generateDemoEvents(limit + offset);
  if (type) events = events.filter((e) => e.type === type);
  if (repo) events = events.filter((e) => e.repo === repo);
  if (severity) events = events.filter((e) => e.severity === severity);
  events = events.slice(offset, offset + limit);

  return NextResponse.json({ events, source: 'demo' });
}
