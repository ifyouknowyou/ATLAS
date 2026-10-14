import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  Boxes,
  FileSearch,
  Globe2,
  Radar,
  ShieldCheck,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'ATLAS — Intelligence, Connected',
  description:
    'Connect signals, evidence, and entities in one intelligence operations workspace.',
};

const capabilities = [
  {
    number: '01',
    icon: FileSearch,
    title: 'Investigations',
    description:
      'Bring case files, people, organizations, and field notes together in a single operational picture.',
    href: '/investigations',
    label: 'OPEN CASE REGISTER',
  },
  {
    number: '02',
    icon: Boxes,
    title: 'Knowledge graph',
    description:
      'Trace relationships across entities and turn disconnected records into meaningful connections.',
    href: '/graph',
    label: 'EXPLORE CONNECTIONS',
  },
  {
    number: '03',
    icon: Globe2,
    title: 'Geospatial intelligence',
    description:
      'Put location-based signals in context with an interactive map of your investigation data.',
    href: '/map',
    label: 'OPEN THE MAP',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-3" aria-label="ATLAS home">
          <span className="flex h-9 w-9 items-center justify-center rounded border border-phosphor-faint/50 bg-phosphor-dim/10 font-mono text-lg font-bold text-phosphor shadow-glow">
            A
          </span>
          <span>
            <span className="block font-mono text-sm tracking-[0.3em] text-slate-100">
              ATLAS
            </span>
            <span className="mono-label !text-[8px] !tracking-[0.18em]">
              INTELLIGENCE PLATFORM
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-3 sm:gap-7" aria-label="Main navigation">
          <Link
            href="#capabilities"
            className="hidden font-mono text-[10px] tracking-[0.16em] text-slate-tech transition-colors hover:text-slate-100 sm:inline"
          >
            CAPABILITIES
          </Link>
          <Link
            href="/overview"
            className="tech-button-primary px-3 py-2 font-mono text-[10px] tracking-[0.12em] sm:px-4"
          >
            ENTER WORKSPACE <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </nav>
      </header>

      <section className="relative mx-auto grid min-h-[620px] w-full max-w-7xl items-center gap-8 px-5 pb-16 pt-12 sm:px-8 lg:min-h-[680px] lg:grid-cols-[1.05fr_0.95fr] lg:gap-4 lg:pb-24 lg:pt-4">
        <div className="relative z-10 max-w-2xl">
          <div className="mono-label mb-6 flex items-center gap-2 text-phosphor">
            <span className="h-1.5 w-1.5 animate-pulse-slow rounded-full bg-phosphor shadow-glow" />
            INTELLIGENCE, CONNECTED
          </div>
          <h1 className="max-w-2xl font-mono text-4xl font-medium leading-[1.14] tracking-[-0.055em] text-slate-100 sm:text-5xl lg:text-[4.1rem]">
            See the signal
            <br />
            <span className="signal-text">in the noise.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-tech sm:text-lg sm:leading-8">
            One operational picture for complex investigations. Connect
            evidence, entities, and intelligence to move from scattered
            information to informed action.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/overview"
              className="tech-button-primary min-h-12 px-5 font-mono text-[11px] tracking-[0.12em]"
            >
              OPEN COMMAND CENTER <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#capabilities"
              className="tech-button min-h-12 px-5 font-mono text-[11px] tracking-[0.12em]"
            >
              EXPLORE THE PLATFORM <ArrowDownRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap gap-x-7 gap-y-3 border-t border-void-line/80 pt-5">
            <TrustNote icon={ShieldCheck} label="ACCESS CONTROLLED" />
            <TrustNote icon={Activity} label="AUDIT-READY ACTIVITY" />
            <TrustNote icon={Radar} label="CONNECTED INTELLIGENCE" />
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[560px]" aria-label="Connected intelligence network illustration">
          <div className="absolute inset-[8%] rounded-full border border-phosphor-faint/15" />
          <div className="absolute inset-[19%] rounded-full border border-slate-tech/10" />
          <div className="absolute inset-[30%] rounded-full border border-phosphor-faint/10" />
          <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(79,216,200,0.10),transparent_68%)]" />
          <div className="absolute left-1/2 top-[8%] h-[84%] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-slate-tech/15 to-transparent" />
          <div className="absolute left-[8%] top-1/2 h-px w-[84%] -translate-y-1/2 bg-gradient-to-r from-transparent via-slate-tech/15 to-transparent" />
          <svg
            viewBox="0 0 560 560"
            fill="none"
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <path d="M105 195 215 135 338 177 423 272 352 390 210 414 125 315 215 135 352 390 423 272 210 414 338 177" stroke="rgba(79,216,200,.35)" strokeWidth="1" />
            <path d="m105 195 177 87 141-10M215 135l67 147 70 108M125 315l157-33" stroke="rgba(138,163,194,.22)" strokeWidth="1" strokeDasharray="4 8" />
            <circle cx="105" cy="195" r="5" fill="#4fd8c8" />
            <circle cx="215" cy="135" r="7" fill="#4fd8c8" />
            <circle cx="338" cy="177" r="4" fill="#8aa3c2" />
            <circle cx="423" cy="272" r="6" fill="#4fd8c8" />
            <circle cx="352" cy="390" r="5" fill="#4fd8c8" />
            <circle cx="210" cy="414" r="4" fill="#8aa3c2" />
            <circle cx="125" cy="315" r="7" fill="#4fd8c8" />
            <circle cx="282" cy="282" r="3" fill="#e8b64c" />
            <circle cx="105" cy="195" r="12" stroke="rgba(79,216,200,.22)" />
            <circle cx="423" cy="272" r="14" stroke="rgba(79,216,200,.18)" />
            <circle cx="215" cy="135" r="14" stroke="rgba(79,216,200,.16)" />
          </svg>

          <div className="absolute left-[6%] top-[29%] rounded border border-void-line bg-void/80 px-3 py-2 backdrop-blur">
            <div className="mono-label !text-[8px]">SOURCE SIGNAL</div>
            <div className="mt-1 font-mono text-[10px] text-slate-200">REF · 0084</div>
          </div>
          <div className="absolute right-[1%] top-[45%] rounded border border-phosphor-faint/25 bg-void/85 px-3 py-2 backdrop-blur">
            <div className="mono-label !text-[8px] !text-phosphor">ENTITY LINKED</div>
            <div className="mt-1 font-mono text-[10px] text-slate-200">CONFIDENCE · 92%</div>
          </div>
          <div className="absolute bottom-[7%] left-[29%] rounded border border-void-line bg-void/80 px-3 py-2 backdrop-blur">
            <div className="mono-label !text-[8px]">CASE ACTIVITY</div>
            <div className="mt-1 font-mono text-[10px] text-slate-200">SIGNAL CORRELATED</div>
          </div>
          <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-phosphor-faint/30 bg-void/80 shadow-[0_0_65px_rgba(79,216,200,.16)]">
            <Radar className="h-7 w-7 text-phosphor" />
          </div>
        </div>
      </section>

      <section
        id="capabilities"
        className="border-y border-void-line/70 bg-void/45"
      >
        <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mono-label text-phosphor">A CLEARER PICTURE</div>
              <h2 className="mt-3 font-mono text-2xl tracking-tight text-slate-100 sm:text-3xl">
                Intelligence in context.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-tech">
              A connected toolkit for the full investigation lifecycle—from
              first signal to defensible report.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {capabilities.map((capability) => {
              const Icon = capability.icon;
              return (
                <Link
                  key={capability.number}
                  href={capability.href}
                  className="group panel flex min-h-60 flex-col p-5 transition-colors hover:border-phosphor-faint/40 sm:p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] tracking-[0.2em] text-slate-tech/60">
                      {capability.number} / MODULE
                    </span>
                    <Icon className="h-5 w-5 text-phosphor-dim transition-colors group-hover:text-phosphor" />
                  </div>
                  <h3 className="mt-8 font-mono text-lg text-slate-100">
                    {capability.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-tech">
                    {capability.description}
                  </p>
                  <span className="mt-6 flex items-center justify-between border-t border-void-line pt-4 font-mono text-[9px] tracking-[0.16em] text-phosphor">
                    {capability.label}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-6 sm:px-8">
        <span className="font-mono text-[9px] tracking-[0.18em] text-slate-tech/60">
          ATLAS INTELLIGENCE PLATFORM
        </span>
        <span className="font-mono text-[9px] tracking-[0.14em] text-slate-tech/50">
          CONNECT SIGNALS · ESTABLISH CONTEXT · INFORM ACTION
        </span>
      </footer>
    </main>
  );
}

function TrustNote({
  icon: Icon,
  label,
}: {
  icon: typeof ShieldCheck;
  label: string;
}) {
  return (
    <span className="flex items-center gap-2 font-mono text-[9px] tracking-[0.12em] text-slate-tech/75">
      <Icon className="h-3.5 w-3.5 text-phosphor-dim" />
      {label}
    </span>
  );
}
