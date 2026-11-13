/** Deterministic "of the day" pick: the same item all day for everyone, a new one at UTC midnight. */
export function dayNumber(d: Date): number {
  return Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 86_400_000);
}
export function pickDaily<T>(pool: readonly T[], d: Date, salt = 0): T | undefined {
  if (pool.length === 0) return undefined;
  return pool[(((dayNumber(d) + salt) % pool.length) + pool.length) % pool.length];
}
