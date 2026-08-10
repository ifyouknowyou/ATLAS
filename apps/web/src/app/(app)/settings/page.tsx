import { Settings } from 'lucide-react';
import { PlaceholderPage } from '@/components/ui/PlaceholderPage';

export default function SettingsPage() {
  return (
    <PlaceholderPage
      title="SETTINGS"
      icon={<Settings className="h-5 w-5" />}
      phase="PHASE 7 · PRODUCTION HARDENING"
      description="Organization settings are permission-gated (settings.manage); the full administration console lands with production hardening."
    />
  );
}