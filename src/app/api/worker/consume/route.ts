import { NextResponse } from 'next/server';
import { createConsumer, TOPIC } from '@/lib/kafka';
import { query } from '@/lib/db';
import { pushRecentEvent, publishEvent, cacheSet } from '@/lib/valkey';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST() {
  const consumer = await createConsumer('infrastream-worker');
  if (!consumer) {
    return NextResponse.json({ error: 'Kafka not configured' }, { status: 503 });
  }

  const processed: unknown[] = [];

  try {
    await consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;
        const event = JSON.parse(message.value.toString());

        // Store in PostgreSQL
        try {
          await query(
            `INSERT INTO events (type, source, repo, branch, title, description, severity, status, author, avatar_url, metadata, created_at, processed_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`,
            [event.type, event.source, event.repo, event.branch, event.title, event.description, event.severity, event.status, event.author, event.avatar_url, JSON.stringify(event.metadata || {}), event.created_at]
          );
        } catch {}

        // Update Valkey
        await pushRecentEvent(event);
        await publishEvent('events', event);

        processed.push(event);
      },
    });

    // Give it a few seconds to consume
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await consumer.disconnect();
  } catch (err) {
    return NextResponse.json({ error: 'Consumer error', details: String(err) }, { status: 500 });
  }

  return NextResponse.json({ processed: processed.length });
}
