'use client';

import { EventTimeline } from '@/components/EventTimeline';
import { ExportButton } from '@/components/ExportButton';

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Events</h2>
          <p className="mt-1 text-sm text-zinc-500">
            All DevOps events from GitHub webhooks, CI/CD pipelines, and monitoring
          </p>
        </div>
        <ExportButton type="events" />
      </div>
      <EventTimeline />
    </div>
  );
}
