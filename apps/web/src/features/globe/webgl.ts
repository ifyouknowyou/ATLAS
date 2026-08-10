/**
 * WebGL capability detection. Used by the globe viewport to decide between
 * the live 3D scene and a graceful 2D fallback.
 */
export function isWebGLAvailable(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      (canvas.getContext('webgl') as WebGLRenderingContext | null);
    return Boolean(gl);
  } catch {
    return false;
  }
}