import { Map } from 'lucide-react';
import { PlaceholderPage } from '@/components/ui/PlaceholderPage';

export default function MapPage() {
  return (
    <PlaceholderPage
      title="GEOSPATIAL MAP"
      icon={<Map className="h-5 w-5" />}
      phase="PHASE 3 · GEOSPATIAL INTELLIGENCE"
      description="Geographic layers, location clustering and spatial correlation arrive in Phase 3, feeding the 3D globe with real entity coordinates."
    />
  );
}