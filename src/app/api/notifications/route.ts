import { NextRequest, NextResponse } from 'next/server';
import { getChannels, addChannel, updateChannel, removeChannel } from '@/lib/notifications';

export async function GET() {
  return NextResponse.json({ channels: getChannels() });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const channel = addChannel({
    type: body.type || 'slack',
    name: body.name || 'New Channel',
    webhook_url: body.webhook_url || '',
    events: body.events || ['incident', 'deployment'],
    severities: body.severities || ['critical', 'warning'],
    enabled: body.enabled ?? true,
  });
  return NextResponse.json({ channel }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, ...updates } = body;
  const channel = updateChannel(id, updates);
  if (!channel) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ channel });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const ok = removeChannel(id);
  return NextResponse.json({ deleted: ok });
}
