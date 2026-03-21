import Redis from 'ioredis';

let client: Redis | null = null;

export function getValkey(): Redis | null {
  if (!process.env.VALKEY_URI) return null;
  if (!client) {
    client = new Redis(process.env.VALKEY_URI, {
      tls: { rejectUnauthorized: false },
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
    client.connect().catch(() => {
      client = null;
    });
  }
  return client;
}

export async function cacheSet(key: string, value: unknown, ttl = 300): Promise<void> {
  const v = getValkey();
  if (!v) return;
  await v.set(`infrastream:${key}`, JSON.stringify(value), 'EX', ttl);
}

export async function cacheGet<T = unknown>(key: string): Promise<T | null> {
  const v = getValkey();
  if (!v) return null;
  const data = await v.get(`infrastream:${key}`);
  if (!data) return null;
  return JSON.parse(data) as T;
}

export async function publishEvent(channel: string, event: unknown): Promise<void> {
  const v = getValkey();
  if (!v) return;
  await v.publish(`infrastream:${channel}`, JSON.stringify(event));
}

export async function getRecentEvents(limit = 20): Promise<unknown[]> {
  const v = getValkey();
  if (!v) return [];
  const data = await v.lrange('infrastream:recent_events', 0, limit - 1);
  return data.map((d) => JSON.parse(d));
}

export async function pushRecentEvent(event: unknown): Promise<void> {
  const v = getValkey();
  if (!v) return;
  await v.lpush('infrastream:recent_events', JSON.stringify(event));
  await v.ltrim('infrastream:recent_events', 0, 99);
}
