import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GlobeViewport } from './GlobeViewport';

/**
 * jsdom has no WebGL, so the viewport must degrade to the readable 2D
 * fallback rather than attempting a Three.js canvas.
 */
describe('GlobeViewport', () => {
  it('renders the WebGL fallback when WebGL is unavailable', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <GlobeViewport className="h-64 w-full" />
      </QueryClientProvider>,
    );
    expect(
      await screen.findByText('WEBGL UNAVAILABLE'),
    ).toBeInTheDocument();
    expect(screen.getByText(/hardware-accelerated WebGL/)).toBeInTheDocument();
  });
});