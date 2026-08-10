import { FileText } from 'lucide-react';
import { PlaceholderPage } from '@/components/ui/PlaceholderPage';

export default function ReportsPage() {
  return (
    <PlaceholderPage
      title="REPORTS"
      icon={<FileText className="h-5 w-5" />}
      phase="PHASE 5 · REPORT BUILDER"
      description="Report construction, document generation and publication arrive in Phase 5."
    />
  );
}