import { NextRequest, NextResponse } from 'next/server';
import { generateHealingEvents } from '@/lib/demo-data-healops';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get('type');
  const status = searchParams.get('status');
  const limit = Math.min(parseInt(searchParams.get('limit') || '30'), 100);

  let events = generateHealingEvents(50);

  if (type) events = events.filter((e) => e.type === type);
  if (status) events = events.filter((e) => e.status === status);

  return NextResponse.json({
    events: events.slice(0, limit),
    source: 'demo',
  });
}
