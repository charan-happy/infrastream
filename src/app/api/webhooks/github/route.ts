import { NextRequest, NextResponse } from 'next/server';
import { produceEvent } from '@/lib/kafka';
import { query } from '@/lib/db';
import { pushRecentEvent, publishEvent } from '@/lib/valkey';
import crypto from 'crypto';

function verifySignature(payload: string, signature: string | null): boolean {
  if (!process.env.GITHUB_WEBHOOK_SECRET || !signature) return true; // Skip in dev
  const expected = 'sha256=' + crypto.createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

function mapGithubEvent(eventType: string, payload: Record<string, unknown>): Record<string, unknown> {
  const repo = (payload.repository as Record<string, unknown>)?.full_name || 'unknown';
  const sender = payload.sender as Record<string, unknown> | undefined;

  const base = {
    source: 'github',
    repo,
    author: (sender?.login as string) || 'unknown',
    avatar_url: (sender?.avatar_url as string) || '',
    metadata: payload,
    created_at: new Date().toISOString(),
  };

  switch (eventType) {
    case 'push': {
      const commits = payload.commits as Array<Record<string, unknown>> | undefined;
      const head = commits?.[0];
      return {
        ...base,
        type: 'push',
        branch: (payload.ref as string)?.replace('refs/heads/', '') || 'main',
        title: (head?.message as string) || 'Push event',
        description: `${commits?.length || 0} commit(s) pushed`,
        severity: 'info',
        status: 'success',
      };
    }
    case 'pull_request': {
      const pr = payload.pull_request as Record<string, unknown>;
      return {
        ...base,
        type: 'pull_request',
        branch: (pr?.head as Record<string, unknown>)?.ref as string || 'feature',
        title: `PR #${pr?.number}: ${pr?.title}`,
        description: (payload.action as string) || 'opened',
        severity: 'info',
        status: payload.action === 'closed' && (pr?.merged as boolean) ? 'success' : 'pending',
      };
    }
    case 'deployment':
    case 'deployment_status': {
      const deployment = payload.deployment as Record<string, unknown>;
      const status = payload.deployment_status as Record<string, unknown>;
      return {
        ...base,
        type: 'deployment',
        branch: (deployment?.ref as string) || 'main',
        title: `Deployment to ${(deployment?.environment as string) || 'production'}`,
        description: (status?.description as string) || 'Deployment event',
        severity: (status?.state as string) === 'failure' ? 'critical' : 'info',
        status: (status?.state as string) === 'success' ? 'success' : (status?.state as string) === 'failure' ? 'failure' : 'in_progress',
      };
    }
    case 'issues': {
      const issue = payload.issue as Record<string, unknown>;
      const isIncident = ((issue?.labels as Array<Record<string, unknown>>)?.some(
        (l) => ((l.name as string) || '').toLowerCase().includes('incident')
      )) ?? false;
      return {
        ...base,
        type: isIncident ? 'incident' : 'alert',
        branch: 'main',
        title: `Issue #${issue?.number}: ${issue?.title}`,
        description: (payload.action as string) || 'opened',
        severity: isIncident ? 'critical' : 'warning',
        status: payload.action === 'closed' ? 'success' : 'in_progress',
      };
    }
    case 'check_run':
    case 'check_suite': {
      const check = (payload.check_run || payload.check_suite) as Record<string, unknown>;
      return {
        ...base,
        type: 'build',
        branch: (check?.head_branch as string) || 'main',
        title: `CI: ${(check?.name as string) || 'Build'} ${check?.conclusion || check?.status}`,
        description: `Check ${check?.status}`,
        severity: (check?.conclusion as string) === 'failure' ? 'warning' : 'info',
        status: (check?.conclusion as string) === 'success' ? 'success' : (check?.conclusion as string) === 'failure' ? 'failure' : 'pending',
      };
    }
    default:
      return {
        ...base,
        type: 'push',
        branch: 'main',
        title: `GitHub event: ${eventType}`,
        description: `Unhandled event type: ${eventType}`,
        severity: 'info',
        status: 'success',
      };
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('x-hub-signature-256');
  const eventType = request.headers.get('x-github-event') || 'push';

  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload = JSON.parse(body);
  const event = mapGithubEvent(eventType, payload);

  // 1. Try to produce to Kafka
  const kafkaOk = await produceEvent(event);

  // 2. Store directly in PostgreSQL if Kafka not available
  if (!kafkaOk) {
    try {
      await query(
        `INSERT INTO events (type, source, repo, branch, title, description, severity, status, author, avatar_url, metadata, created_at, processed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`,
        [event.type, event.source, event.repo, event.branch, event.title, event.description, event.severity, event.status, event.author, event.avatar_url, JSON.stringify(event.metadata), event.created_at]
      );
    } catch {}
  }

  // 3. Push to Valkey for real-time
  await pushRecentEvent(event);
  await publishEvent('events', event);

  return NextResponse.json({ received: true, kafka: kafkaOk, event_type: eventType });
}
