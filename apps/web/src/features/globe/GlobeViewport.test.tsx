import { render, screen } from '@testing-library/react';
import { GlobeViewport } from './GlobeViewport';

/**
 * jsdom has no WebGL, so the viewport must degrade to the readable 2D
 * fallback rather than attempting a Three.js canvas.
 */
describe('GlobeViewport', () => {
  it('renders the WebGL fallback when WebGL is unavailable', async () => {
    render(<GlobeViewport className="h-64 w-full" />);
    expect(
      await screen.findByText('WEBGL UNAVAILABLE'),
    ).toBeInTheDocument();
    expect(screen.getByText(/hardware-accelerated WebGL/)).toBeInTheDocument();
  });
});