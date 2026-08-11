/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          module: 'commonjs',
          moduleResolution: 'node',
          esModuleInterop: true,
          allowJs: true,
        },
      },
    ],
    // d3-force + its deps are ESM-only; transpile just those packages so the
    // graph engine runs under jest's CommonJS runtime.
    '^.+\\.js$': ['babel-jest', { presets: ['@babel/preset-env'] }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@atlas/shared$': '<rootDir>/../../packages/shared/dist/index.js',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  transformIgnorePatterns: [
    '/node_modules/(?!d3-force|d3-quadtree|d3-dispatch|d3-timer|d3-random)',
    '/.next/',
    '/out/',
  ],
  clearMocks: true,
};
