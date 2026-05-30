import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  dts: true,
  esbuildOptions(options) {
    options.loader = {
      ...options.loader,
      '.lua': 'text',
    }
  },
})
