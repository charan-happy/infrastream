'use client';

import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Database, MessageSquare, HardDrive } from 'lucide-react';

interface HealthData {
  status: string;
  demo_mode: boolean;
  services: {
    kafka: boolean;
    postgresql: boolean;
    valkey: boolean;
  };
}

export function ServiceStatus() {
  const [health, setHealth] = useState<HealthData | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => {});
    const interval = setInterval(() => {
      fetch('/api/health')
        .then((r) => r.json())
        .then(setHealth)
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!health) return null;

  const services = [
    { name: 'Kafka', connected: health.services.kafka, icon: MessageSquare },
    { name: 'PostgreSQL', connected: health.services.postgresql, icon: Database },
    { name: 'Valkey', connected: health.services.valkey, icon: HardDrive },
  ];

  return (
    <div className="flex items-center gap-4">
      {health.demo_mode && (
        <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
          Demo Mode
        </span>
      )}
      {services.map(({ name, connected, icon: Icon }) => (
        <div key={name} className="flex items-center gap-1.5" title={`${name}: ${connected ? 'Connected' : 'Not configured'}`}>
          <Icon className="h-3.5 w-3.5 text-zinc-500" />
          <div
            className={clsx(
              'h-2 w-2 rounded-full',
              connected ? 'bg-emerald-500' : 'bg-zinc-600'
            )}
          />
          <span className="text-xs text-zinc-500">{name}</span>
        </div>
      ))}
    </div>
  );
}
