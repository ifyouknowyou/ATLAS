import { Globe2 } from 'lucide-react';
import { PlaceholderPage } from '@/components/ui/PlaceholderPage';

export default function WorkspacePage() {
  return (
    <PlaceholderPage
      title="WORKSPACE"
      icon={<Globe2 className="h-5 w-5" />}
      phase="PHASE 1 · MULTI-TENANCY FOUNDATION"
      description="Organization and workspace membership is enforced server-side today; workspace administration screens land with the tenant console."
    />
  );
}