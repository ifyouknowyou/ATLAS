import type { GraphLayout } from '@atlas/shared';
import type { GraphData } from '../../types';
import { computeForcePositions } from '../simulation';
import { radialLayout } from './radial';
import { hierarchicalLayout } from './hierarchical';
import { gridLayout } from './grid';

export interface LayoutOptions {
  width?: number;
  height?: number;
  rootId?: string | null;
  forceIterations?: number;
}

/**
 * Layout abstraction (Phase 3 §6). Adding a new layout = one pure function in
 * this directory + one entry here; the renderer and interaction layers are
 * unchanged.
 */
export function computeLayout(
  layout: GraphLayout,
  data: GraphData,
  options: LayoutOptions = {},
): Map<string, { x: number; y: number }> {
  const { width = 800, height = 600 } = options;
  switch (layout) {
    case 'force':
      return computeForcePositions(data, {
        width,
        height,
        deterministic: true,
        iterations: options.forceIterations ?? 120,
      });
    case 'radial':
      return radialLayout(data, width, height, options.rootId);
    case 'hierarchical':
      return hierarchicalLayout(data, width, height, options.rootId);
    case 'grid':
      return gridLayout(data, width, height);
    default:
      return computeForcePositions(data, { width, height, deterministic: true });
  }
}

export { radialLayout } from './radial';
export { hierarchicalLayout } from './hierarchical';
export { gridLayout } from './grid';