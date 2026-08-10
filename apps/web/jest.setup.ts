import '@testing-library/jest-dom';

// Silence Next.js router focus-trap warnings in jsdom during tests.
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: Parameters<typeof console.error>) => {
    const message = typeof args[0] === 'string' ? args[0] : '';
    if (
      message.includes('Not implemented:') || // jsdom WebGL probe noise
      message.includes('The `style` prop expects') ||
      message.includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError(...args);
  };
});
afterAll(() => {
  console.error = originalError;
});