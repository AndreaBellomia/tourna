import { defineConfig } from 'tsdown'

export default defineConfig({
  dts: false,
  fixedExtension: false,
  format: 'cjs',
  loader: {
    '.lua': 'text',
  },
  platform: 'node',
})
