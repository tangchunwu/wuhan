import { defineConfig } from 'vitest/config';

// Minimal Vitest config for the landmark-visual-upgrade pure-logic test suite.
// Tests run in a Node environment (no WebGL / DOM needed) against headless helpers.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.js'],
  },
});
