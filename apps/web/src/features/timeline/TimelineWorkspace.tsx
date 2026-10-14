'use client';
import { useState } from 'react';
import { TimelinePanel } from './TimelinePanel';
import { TimelineViewport } from './TimelineViewport';

/**
 * Full-page chronological workspace for the /timeline route (§25-27).
 * Left: kind filters + event list. Center: density lanes. Selection is
 * shared so picking an event in one surface drives the other (§28).
 */
export function TimelineWorkspace({ investigationId }: { investigationId?: string }) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      <TimelinePanel investigationId={investigationId} onSelectEvent={setSelectedEventId} selectedEventId={selectedEventId} />
      <TimelineViewport
        investigationId={investigationId}
        onSelectEvent={setSelectedEventId}
        selectedEventId={selectedEventId}
      />
    </div>
  );
}