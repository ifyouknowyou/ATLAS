'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
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
      setActiveIndex(0);
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
    { label: 'AI Assistant', shortcut: null, action: () => router.push('/assistant') },
    { label: 'Administration', shortcut: null, action: () => router.push('/admin') },
  ];

  if (!open) return null;

  const filtered = commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24" onMouseDown={(e) => e.stopPropagation()}>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div
        className="relative z-10 w-full max-w-lg rounded-lg border border-void-line bg-void-panel p-4 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="ATLAS command palette"
      >
        <input
          ref={inputRef}
          placeholder="Type a command..."
          className="tech-input mb-2"
          role="combobox"
          aria-controls="atlas-command-list"
          aria-expanded="true"
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setActiveIndex((index) => Math.min(index + 1, filtered.length - 1));
            } else if (event.key === 'ArrowUp') {
              event.preventDefault();
              setActiveIndex((index) => Math.max(index - 1, 0));
            } else if (event.key === 'Enter' && filtered[activeIndex]) {
              event.preventDefault();
              filtered[activeIndex].action();
              setOpen(false);
            }
          }}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
          }}
        />
        <ul id="atlas-command-list" className="max-h-80 divide-y divide-void-line overflow-auto text-sm" role="listbox">
          {filtered.map((cmd, idx) => (
            <li key={idx}>
              <button
                className={`flex w-full items-center justify-between rounded px-3 py-2 text-left ${idx === activeIndex ? 'bg-phosphor-dim/15 text-phosphor' : 'text-slate-200 hover:bg-void-raised'}`}
                role="option"
                aria-selected={idx === activeIndex}
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