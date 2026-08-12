import { StatusBadge } from './StatusBadge';

const TONE: Record<string, 'signal' | 'amber' | 'neutral' | 'danger'> = {
  PUBLIC: 'signal',
  INTERNAL: 'neutral',
  CONFIDENTIAL: 'amber',
  RESTRICTED: 'danger',
};

/** Classification chip. Restricted is always visually distinct. */
export function ClassificationBadge({
  classification,
}: {
  classification?: string | null;
}) {
  if (!classification) return null;
  return (
    <StatusBadge tone={TONE[classification] ?? 'neutral'}>
      {classification}
    </StatusBadge>
  );
}
