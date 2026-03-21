import { NextRequest, NextResponse } from 'next/server';
import { produceEvent } from '@/lib/kafka';
import { query } from '@/lib/db';
import { pushRecentEvent, publishEvent } from '@/lib/valkey';
import { notifyEvent } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const apiKey = request.headers.get('x-healops-key');

  // Optional API key validation
  if (process.env.HEALOPS_API_KEY && apiKey !== process.env.HEALOPS_API_KEY) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  const event = {
    type: mapHealOpsType(body.event_type),
    source: 'healops',
    repo: body.repo || 'unknown',
    branch: body.branch || 'main',
    title: body.title || `HealOps: ${body.event_type}`,
    description: body.description || '',
    severity: body.severity || 'info',
    status: mapHealOpsStatus(body.status),
    author: 'healops-bot',
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=healops',
    metadata: {
      healops: true,
      healing_type: body.healing_type,
      confidence: body.confidence,
      pr_number: body.pr_number,
      pr_url: body.pr_url,
      time_to_heal: body.time_to_heal,
      auto_fix: body.auto_fix,
      ...body.metadata,
    },
    created_at: body.timestamp || new Date().toISOString(),
  };

  // Route through the pipeline
  const kafkaOk = await produceEvent(event);

  if (!kafkaOk) {
    try {
      await query(
        `INSERT INTO events (type, source, repo, branch, title, description, severity, status, author, avatar_url, metadata, created_at, processed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`,
        [event.type, event.source, event.repo, event.branch, event.title, event.description, event.severity, event.status, event.author, event.avatar_url, JSON.stringify(event.metadata), event.created_at]
      );
    } catch {}
  }

  // Real-time + notifications
  await pushRecentEvent(event);
  await publishEvent('events', event);

  // Notify on critical healings or failures
  if (event.severity === 'critical' || event.status === 'failure') {
    await notifyEvent(event);
  }

  return NextResponse.json({ received: true, kafka: kafkaOk, source: 'healops' });
}

function mapHealOpsType(eventType: string): string {
  const map: Record<string, string> = {
    'issue_detected': 'alert',
    'healing_started': 'build',
    'healing_complete': 'deployment',
    'healing_failed': 'incident',
    'pr_created': 'pull_request',
    'scan_complete': 'push',
  };
  return map[eventType] || 'alert';
}

function mapHealOpsStatus(status: string): string {
  const map: Record<string, string> = {
    'detected': 'pending',
    'diagnosing': 'in_progress',
    'healing': 'in_progress',
    'healed': 'success',
    'failed': 'failure',
  };
  return map[status] || 'pending';
}
