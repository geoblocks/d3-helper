import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    exclude:[
      ...configDefaults.exclude,
      'lib',
    ]
  },
});
