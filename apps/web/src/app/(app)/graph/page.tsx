import { Radar } from 'lucide-react';
import { PlaceholderPage } from '@/components/ui/PlaceholderPage';

export default function GraphPage() {
  return (
    <PlaceholderPage
      title="RELATIONSHIP GRAPH"
      icon={<Radar className="h-5 w-5" />}
      phase="PHASE 3 · GRAPH & GEOSPATIAL INTELLIGENCE"
      description="Interactive force-directed relationship graphs build on the entity and relationship foundation delivered in Phase 1."
    />
  );
}