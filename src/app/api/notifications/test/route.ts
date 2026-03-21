import { NextRequest, NextResponse } from 'next/server';
import { notifyEvent } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  const testEvent = {
    type: 'incident',
    title: 'Test Alert from InfraStream',
    repo: 'infrastream/api',
    branch: 'main',
    status: 'in_progress',
    severity: 'critical',
    author: 'infrastream-bot',
    created_at: new Date().toISOString(),
  };

  const result = await notifyEvent(testEvent);
  return NextResponse.json({ ...result, test: true });
}
