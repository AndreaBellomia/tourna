export type KeyFactory<A extends unknown[] = unknown[]> = (...args: A) => readonly string[]

export function rawBuildKey<A extends readonly string[]>(...args: A): string {
  return args.join(':')
}
