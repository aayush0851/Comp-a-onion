export const isNil = (v: unknown): v is null | undefined => v === null || v === undefined;

export const isDefined = <T>(v: T | null | undefined): v is T => v !== null && v !== undefined;

// True only when both sides have a value and they differ (i.e. an update to an already-set field).
export const isChanged = <T>(
  next: T | null | undefined,
  current: T | null | undefined,
  equals: (a: T, b: T) => boolean = (a, b) => a === b,
): boolean => isDefined(next) && isDefined(current) && !equals(next, current);
