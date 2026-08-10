import { describe, expect, it } from '@jest/globals';
import {
  classificationTone,
  confidenceLabel,
  formatWhen,
  priorityTone,
  statusTone,
} from './presentation';

describe('statusTone', () => {
  it('maps active states to signal', () => {
    expect(statusTone('ACTIVE')).toBe('signal');
    expect(statusTone('IN_PROGRESS')).toBe('signal');
  });
  it('maps pending states to neutral', () => {
    expect(statusTone('DRAFT')).toBe('neutral');
    expect(statusTone('PENDING')).toBe('neutral');
  });
  it('maps completion and archive to amber', () => {
    expect(statusTone('COMPLETED')).toBe('amber');
    expect(statusTone('ARCHIVED')).toBe('amber');
  });
  it('maps dangerous states to danger', () => {
    expect(statusTone('BLOCKED')).toBe('danger');
    expect(statusTone('RESTRICTED')).toBe('danger');
  });
});

describe('confidenceLabel', () => {
  it('maps the analyst bands', () => {
    expect(confidenceLabel(90)).toBe('VERY_HIGH');
    expect(confidenceLabel(70)).toBe('HIGH');
    expect(confidenceLabel(50)).toBe('MEDIUM');
    expect(confidenceLabel(30)).toBe('LOW');
    expect(confidenceLabel(10)).toBe('VERY_LOW');
  });
});

describe('classificationTone', () => {
  it('flags restrictive classifications', () => {
    expect(classificationTone('RESTRICTED')).toBe('danger');
    expect(classificationTone('CONFIDENTIAL')).toBe('danger');
    expect(classificationTone('INTERNAL')).toBe('amber');
    expect(classificationTone('PUBLIC')).toBe('neutral');
  });
});

describe('priorityTone', () => {
  it('maps CRITICAL/HIGH to danger and MEDIUM to amber', () => {
    expect(priorityTone('CRITICAL')).toBe('danger');
    expect(priorityTone('HIGH')).toBe('danger');
    expect(priorityTone('MEDIUM')).toBe('amber');
    expect(priorityTone('LOW')).toBe('neutral');
  });
});

describe('formatWhen', () => {
  it('returns a graceful dash for missing/invalid input', () => {
    expect(formatWhen(null)).toBe('—');
    expect(formatWhen(undefined)).toBe('—');
    expect(formatWhen('not-a-date')).toBe('—');
  });
  it('renders relative labels', () => {
    const now = Date.now();
    expect(formatWhen(new Date(now - 30_000).toISOString())).toBe('just now');
    expect(formatWhen(new Date(now - 2 * 60_000).toISOString())).toBe('2m ago');
    expect(formatWhen(new Date(now - 3 * 3600_000).toISOString())).toBe('3h ago');
    expect(formatWhen(new Date(now - 5 * 86_400_000).toISOString())).toBe('5d ago');
  });
});