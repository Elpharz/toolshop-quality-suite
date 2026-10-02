/** Returns the value or fails loudly; keeps `noUncheckedIndexedAccess` honest without `!`. */
export function defined<T>(value: T | undefined | null, what: string): T {
  if (value === undefined || value === null) throw new Error(`Expected ${what} to be defined`);
  return value;
}

/** True when every element is >= the one before it. */
export function isSortedAscending(values: readonly number[]): boolean {
  return values.every((value, i) => i === 0 || (values[i - 1] ?? value) <= value);
}
