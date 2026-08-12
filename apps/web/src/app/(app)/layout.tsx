import { AppShell } from '@/components/layout/AppShell';
import { RealtimeProvider } from '@/lib/realtime-provider';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RealtimeProvider>
      <AppShell>{children}</AppShell>
    </RealtimeProvider>
  );
}
