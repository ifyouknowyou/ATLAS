import { Activity } from 'lucide-react';
import { PlaceholderPage } from '@/components/ui/PlaceholderPage';

export default function TimelinePage() {
  return (
    <PlaceholderPage
      title="TIMELINE"
      icon={<Activity className="h-5 w-5" />}
      phase="PHASE 3 · TEMPORAL ANALYSIS"
      description="Timeline reconstruction from TimelineEvent records arrives in Phase 3."
    />
  );
}