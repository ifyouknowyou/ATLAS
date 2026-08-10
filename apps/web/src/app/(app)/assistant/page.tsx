import { Bot } from 'lucide-react';
import { PlaceholderPage } from '@/components/ui/PlaceholderPage';

export default function AssistantPage() {
  return (
    <PlaceholderPage
      title="AI ASSISTANT"
      icon={<Bot className="h-5 w-5" />}
      phase="PHASE 4 · AI INTELLIGENCE ENGINE"
      description="Contextual research assistance over investigations, entities and evidence arrives in Phase 4."
    />
  );
}