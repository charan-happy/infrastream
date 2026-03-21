import { Pool, PoolClient } from 'pg';

let pool: Pool | null = null;

export function getPool(): Pool | null {
  if (!process.env.PG_CONNECTION_URI) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.PG_CONNECTION_URI,
      ssl: { rejectUnauthorized: false },
      max: 5,
    });
  }
  return pool;
}

export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const p = getPool();
  if (!p) return [];
  const result = await p.query(text, params);
  return result.rows as T[];
}

export async function withClient<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T | null> {
  const p = getPool();
  if (!p) return null;
  const client = await p.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

export async function initSchema(): Promise<void> {
  const p = getPool();
  if (!p) return;

  await p.query(`
    CREATE TABLE IF NOT EXISTS events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      type VARCHAR(50) NOT NULL,
      source VARCHAR(100) NOT NULL DEFAULT 'github',
      repo VARCHAR(255) NOT NULL,
      branch VARCHAR(255) DEFAULT 'main',
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      severity VARCHAR(20) DEFAULT 'info',
      status VARCHAR(20) DEFAULT 'success',
      author VARCHAR(100) DEFAULT '',
      avatar_url TEXT DEFAULT '',
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      processed_at TIMESTAMPTZ
    );

    CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
    CREATE INDEX IF NOT EXISTS idx_events_repo ON events(repo);
    CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_events_severity ON events(severity);

    CREATE TABLE IF NOT EXISTS dora_snapshots (
      id SERIAL PRIMARY KEY,
      period VARCHAR(50) NOT NULL,
      deployment_frequency NUMERIC DEFAULT 0,
      lead_time NUMERIC DEFAULT 0,
      change_failure_rate NUMERIC DEFAULT 0,
      mttr NUMERIC DEFAULT 0,
      calculated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}
