import { LoginForm } from './LoginForm';

export const metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <div className="pointer-events-none absolute inset-0 bg-radial-void" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-phosphor-faint opacity-10 blur-3xl" />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded border border-phosphor-faint/50 bg-phosphor-dim/15">
            <span className="font-mono text-xl font-bold text-phosphor">A</span>
          </div>
          <div className="font-mono text-lg tracking-[0.35em] text-slate-100">ATLAS</div>
          <div className="mono-label">INTELLIGENCE PLATFORM</div>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}