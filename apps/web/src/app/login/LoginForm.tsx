'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-store';
import { ApiError } from '@/lib/api-client';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';

const DEMO_EMAIL = 'admin@atlas.demo';

export function LoginForm() {
  const router = useRouter();
  const login = useAuth((s) => s.login);
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      router.replace('/overview');
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Login failed. Try again.',
      );
    } finally {
      setBusy(false);
    }
  };

  const fillDemo = () => {
    setEmail(DEMO_EMAIL);
    setPassword('AtlasDemo#2026');
  };

  return (
    <form onSubmit={(e) => void submit(e)} className="panel p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="panel-title">AUTHENTICATE</h2>
        <span className="font-mono text-[10px] uppercase tracking-widest text-amber-signal">
          Demo tenant
        </span>
      </div>

      <div className="space-y-4">
        <Field
          label="EMAIL"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@organization.example"
          autoComplete="username"
          required
        />
        <Field
          label="PASSWORD"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••••"
          autoComplete="current-password"
          required
        />
      </div>

      {error && (
        <div className="mt-4 rounded border border-danger/40 bg-danger/10 px-3 py-2 font-mono text-[11px] text-danger">
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        className="mt-6 w-full"
        disabled={busy}
      >
        {busy ? 'AUTHENTICATING…' : 'ACCESS PLATFORM'}
      </Button>

      <button
        type="button"
        onClick={fillDemo}
        className="mt-3 w-full border-t border-void-line pt-3 font-mono text-[11px] uppercase tracking-widest text-slate-tech hover:text-phosphor"
      >
        Load demo credentials
      </button>
    </form>
  );
}