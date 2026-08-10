import { Scale } from 'lucide-react';
import { PlaceholderPage } from '@/components/ui/PlaceholderPage';

export default function ActivityPage() {
  return (
    <PlaceholderPage
      title="ACTIVITY"
      icon={<Scale className="h-5 w-5" />}
      phase="PHASE 5 · COLLABORATION"
      description="Activity streams and live workspaces synchronization arrive in Phase 5."
    />
  );
}