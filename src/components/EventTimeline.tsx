'use client';

import { useState, useEffect } from 'react';
import { EventCard } from './EventCard';
import type { DevOpsEvent } from '@/lib/types';
import { RefreshCw } from 'lucide-react';

export function EventTimeline() {
  const [events, setEvents] = useState<DevOpsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('');
  const [filter, setFilter] = useState('all');

  async function fetchEvents() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== 'all') params.set('type', filter);
    params.set('limit', '30');
    const res = await fetch(`/api/events?${params}`);
    const data = await res.json();
    setEvents(data.events || []);
    setSource(data.source || 'unknown');
    setLoading(false);
  }

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  // SSE for real-time updates
  useEffect(() => {
    const es = new EventSource('/api/stream');
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'event' && data.event) {
          setEvents((prev) => [data.event, ...prev].slice(0, 50));
        }
      } catch {}
    };
    return () => es.close();
  }, []);

  const filters = ['all', 'push', 'pull_request', 'deployment', 'incident', 'alert', 'build'];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              {f === 'all' ? 'All' : f.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-600">
            source: {source}
          </span>
          <button
            onClick={fetchEvents}
            className="rounded-lg bg-zinc-800 p-2 text-zinc-400 hover:bg-zinc-700 hover:text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
        {events.length === 0 && !loading && (
          <p className="py-12 text-center text-sm text-zinc-600">
            No events found. Configure a GitHub webhook to start streaming.
          </p>
        )}
      </div>
    </div>
  );
}
