import { NextResponse } from 'next/server';
import { generateDemoEvents } from '@/lib/demo-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial batch
      const events = generateDemoEvents(5);
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'batch', events })}\n\n`));

      // Send new events periodically (demo mode)
      const interval = setInterval(() => {
        const newEvent = generateDemoEvents(1)[0];
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'event', event: newEvent })}\n\n`));
      }, 5000 + Math.random() * 10000);

      // Heartbeat
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(`: heartbeat\n\n`));
      }, 15000);

      // Cleanup (close after 5 mins to prevent zombie connections)
      const timeout = setTimeout(() => {
        clearInterval(interval);
        clearInterval(heartbeat);
        controller.close();
      }, 300000);

      // Handle client disconnect is automatic with ReadableStream
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
