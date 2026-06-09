const path = require('node:path')

module.exports = (options) => ({
  ...options,
  resolve: {
    ...options.resolve,
    alias: {
      ...options.resolve?.alias,
      '~': path.resolve(__dirname, 'src'),
    },
  },
})
