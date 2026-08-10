import type { ComponentProps } from 'react';
import { StatusBadge } from '@/components/ui/StatusBadge';

type Tone = NonNullable<ComponentProps<typeof StatusBadge>['tone']>;

export function statusTone(status: string): Tone {
  switch (status) {
    case 'ACTIVE':
    case 'IN_PROGRESS':
    case 'AVAILABLE':
      return 'signal';
    case 'DRAFT':
    case 'PAUSED':
    case 'PENDING':
      return 'neutral';
    case 'COMPLETED':
    case 'DONE':
    case 'ARCHIVED':
      return 'amber';
    case 'BLOCKED':
    case 'RESTRICTED':
    case 'CRITICAL':
      return 'danger';
    default:
      return 'neutral';
  }
}

export function priorityTone(priority: string): Tone {
  switch (priority) {
    case 'CRITICAL':
    case 'HIGH':
      return 'danger';
    case 'MEDIUM':
      return 'amber';
    case 'LOW':
      return 'neutral';
    default:
      return 'neutral';
  }
}

/** Classification badge tone. */
export function classificationTone(classification: string): Tone {
  switch (classification) {
    case 'RESTRICTED':
    case 'CONFIDENTIAL':
      return 'danger';
    case 'INTERNAL':
      return 'amber';
    case 'PUBLIC':
    default:
      return 'neutral';
  }
}

/** Confidence (0–100) to an analytical-assessment label. */
export function confidenceLabel(confidence: number): string {
  if (confidence >= 81) return 'VERY_HIGH';
  if (confidence >= 61) return 'HIGH';
  if (confidence >= 41) return 'MEDIUM';
  if (confidence >= 21) return 'LOW';
  return 'VERY_LOW';
}

/** Relative "last activity" label from an ISO timestamp. */
export function formatWhen(iso: string | null | undefined): string {
  if (!iso) return '—';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '—';
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}