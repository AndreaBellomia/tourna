/**
 * Type declaration for raw Lua script imports.
 * Enabled by `--loader:.lua=text` in the tsup build command.
 * At runtime the module resolves to the raw Lua source as a string.
 */
declare module '*.lua' {
  const source: string
  export default source
}
