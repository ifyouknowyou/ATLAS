'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'atlas-onboarding-dismissed';

export function WelcomeCard() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(window.localStorage.getItem(STORAGE_KEY) !== 'true');
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    window.localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  };

  return (
    <section className="panel border-phosphor-faint/30 bg-phosphor-dim/10 p-4 sm:p-5" aria-labelledby="welcome-title">
      <div className="flex items-start gap-4">
        <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded border border-phosphor-faint/30 bg-void-raised text-phosphor sm:flex">
          <BookOpen className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mono-label text-phosphor">ORIENTATION / FIRST SESSION</div>
          <h2 id="welcome-title" className="mt-1 font-mono text-sm tracking-wide text-slate-100">START WITH AN INVESTIGATION</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-tech">
            Investigations are the working context for ATLAS. Start a case, connect entities and relationships, attach evidence, then use the graph, timeline, assistant, and reports to analyze what you find.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/investigations" className="tech-button-primary tech-button text-xs">
              OPEN INVESTIGATIONS <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link href="/assistant" className="tech-button text-xs">LEARN WITH ASSISTANT</Link>
            <button type="button" onClick={dismiss} className="tech-button text-xs">DISMISS</button>
          </div>
        </div>
        <button type="button" onClick={dismiss} className="rounded p-1 text-slate-tech hover:text-slate-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-phosphor" aria-label="Dismiss orientation">
          <X className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
