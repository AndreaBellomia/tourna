/**
 * Type declaration for raw Lua script imports.
 * Enabled by the `.lua` text loader in the tsdown config.
 * At runtime the module resolves to the raw Lua source as a string.
 */
declare module '*.lua' {
  const source: string
  export default source
}
