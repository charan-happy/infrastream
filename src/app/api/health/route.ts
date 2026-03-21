import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { getValkey } from '@/lib/valkey';

export async function GET() {
  const pg = getPool();
  const valkey = getValkey();
  const kafkaConfigured = !!process.env.KAFKA_BROKER;

  let pgConnected = false;
  let valkeyConnected = false;

  if (pg) {
    try {
      await pg.query('SELECT 1');
      pgConnected = true;
    } catch {}
  }

  if (valkey) {
    try {
      await valkey.ping();
      valkeyConnected = true;
    } catch {}
  }

  return NextResponse.json({
    status: 'ok',
    demo_mode: !pgConnected,
    services: {
      kafka: kafkaConfigured,
      postgresql: pgConnected,
      valkey: valkeyConnected,
    },
    timestamp: new Date().toISOString(),
  });
}
