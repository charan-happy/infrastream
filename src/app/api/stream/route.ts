import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getRecentEvents } from '@/lib/valkey';
import { generateDemoEvents } from '@/lib/demo-data';
import type { DevOpsEvent } from '@/lib/types';

export const dynamic = 'force-dynamic';

async function getLatestEvents(limit = 5): Promise<DevOpsEvent[]> {
  // Try Valkey first
  const cached = await getRecentEvents(limit);
  if (cached && cached.length > 0) return cached as DevOpsEvent[];

  // Try database
  try {
    const rows = await query<DevOpsEvent>(
      'SELECT * FROM events ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    if (rows.length > 0) return rows;
  } catch {}

  // Fallback to demo
  return generateDemoEvents(limit);
}

let lastEventId: string | null = null;

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial batch of real events
      const events = await getLatestEvents(10);
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'batch', events })}\n\n`));
      if (events.length > 0) lastEventId = events[0].id;

      // Poll for new events from DB
      const interval = setInterval(async () => {
        try {
          let newEvents: DevOpsEvent[] = [];

          if (lastEventId) {
            newEvents = await query<DevOpsEvent>(
              'SELECT * FROM events WHERE id != $1 AND created_at > (SELECT created_at FROM events WHERE id = $1) ORDER BY created_at DESC LIMIT 5',
              [lastEventId]
            );
          } else {
            newEvents = await query<DevOpsEvent>(
              'SELECT * FROM events ORDER BY created_at DESC LIMIT 1'
            );
          }

          for (const event of newEvents) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'event', event })}\n\n`));
          }

          if (newEvents.length > 0) {
            lastEventId = newEvents[0].id;
          }
        } catch {
          // If DB query fails, skip this cycle
        }
      }, 3000);

      // Heartbeat
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {}
      }, 15000);

      // Cleanup after 5 mins
      const timeout = setTimeout(() => {
        clearInterval(interval);
        clearInterval(heartbeat);
        try { controller.close(); } catch {}
      }, 300000);
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
