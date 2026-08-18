'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  const commands = [
    { label: 'Investigations', shortcut: 'I', action: () => router.push('/investigations') },
    { label: 'Graph', shortcut: 'G', action: () => router.push('/graph') },
    { label: 'Map', shortcut: 'M', action: () => router.push('/map') },
    { label: 'Timeline', shortcut: 'T', action: () => router.push('/timeline') },
    { label: 'Intelligence', shortcut: null, action: () => router.push('/intelligence') },
    { label: 'Alerts', shortcut: null, action: () => router.push('/intelligence/alerts') },
    { label: 'Evidence', shortcut: 'E', action: () => router.push('/evidence') },
    { label: 'Reports', shortcut: 'R', action: () => router.push('/reports') },
    { label: 'AI', shortcut: null, action: () => router.push('/ai') },
    { label: 'Administration', shortcut: null, action: () => router.push('/admin/operations') },
  ];

  if (!open) return null;

  const filtered = commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative z-10 w-full max-w-lg rounded-lg border border-gray-700 bg-gray-900 p-4 shadow-2xl">
        <input
          ref={inputRef}
          placeholder="Type a command..."
          className="mb-2 w-full rounded-md bg-gray-800 px-3 py-2 text-sm text-white outline-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <ul className="max-h-80 divide-y divide-gray-700 overflow-auto text-sm">
          {filtered.map((cmd, idx) => (
            <li key={idx}>
              <button
                className="flex w-full items-center justify-between px-3 py-2 hover:bg-gray-800"
                onClick={() => {
                  cmd.action();
                  setOpen(false);
                }}
              >
                <span>{cmd.label}</span>
                {cmd.shortcut && <span className="rounded border border-gray-700 px-1.5 py-0.5">{cmd.shortcut}</span>}
              </button>
            </li>
          ))}
          {filtered.length === 0 && <li className="px-3 py-2 text-gray-400">No results</li>}
        </ul>
      </div>
    </div>
  );
}