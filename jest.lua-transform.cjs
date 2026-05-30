/** @type {import('@jest/transform').Transformer} */
module.exports = {
  process(sourceText) {
    return {
      code: `module.exports = ${JSON.stringify(sourceText)};`,
    }
  },
}
