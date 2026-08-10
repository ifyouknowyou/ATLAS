import { Bell } from 'lucide-react';
import { PlaceholderPage } from '@/components/ui/PlaceholderPage';

export default function NotificationsPage() {
  return (
    <PlaceholderPage
      title="NOTIFICATIONS"
      icon={<Bell className="h-5 w-5" />}
      phase="PHASE 6 · ALERTING"
      description="Alerting and notification routing arrive with the automation engine in Phase 6."
    />
  );
}