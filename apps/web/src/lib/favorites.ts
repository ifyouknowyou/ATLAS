'use client';

const FAVORITES_KEY = 'atlas.favorites';
const RECENT_KEY = 'atlas.recentInvestigations';

function read(key: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function write(key: string, values: string[]): void {
  window.localStorage.setItem(key, JSON.stringify(values));
}

/** Per-browser favorites for investigation browsing. */
export const favorites = {
  list(): string[] {
    return read(FAVORITES_KEY);
  },
  has(id: string): boolean {
    return read(FAVORITES_KEY).includes(id);
  },
  toggle(id: string): string[] {
    const current = read(FAVORITES_KEY);
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [id, ...current];
    write(FAVORITES_KEY, next);
    return next;
  },
};

/** Recently viewed investigation ids (most recent first, capped). */
export const recentViewed = {
  list(): string[] {
    return read(RECENT_KEY);
  },
  record(id: string): string[] {
    const current = read(RECENT_KEY).filter((x) => x !== id);
    const next = [id, ...current].slice(0, 8);
    write(RECENT_KEY, next);
    return next;
  },
};