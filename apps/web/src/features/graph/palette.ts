/** Consistent node colors keyed by entity type (matches graph3d palette). */
const TYPE_COLORS: Record<string, string> = {
  PERSON: '#e8b64c',
  ORGANIZATION: '#4fd8c8',
  DOMAIN: '#79b8ff',
  IP_ADDRESS: '#79b8ff',
  LOCATION: '#9b8cff',
  DEVICE: '#ff9d76',
  ACCOUNT: '#ff9d76',
  DOCUMENT: '#8aa3c2',
  EVENT: '#e88bb4',
  OTHER: '#8aa3c2',
};

const DEFAULT_COLOR = '#8aa3c2';

export function nodeColor(type: string): string {
  return TYPE_COLORS[type] ?? DEFAULT_COLOR;
}

export function nodeSize(confidence: number): number {
  return 3 + (confidence / 100) * 4;
}

/** Edge stroke width by relationship confidence. */
export function edgeWidth(confidence: number): number {
  return 1 + (confidence / 100) * 2;
}

export const kindColor = (): string =>
  // Neutral grey for relationship kinds — the color language belongs to nodes.
  '#33506b';