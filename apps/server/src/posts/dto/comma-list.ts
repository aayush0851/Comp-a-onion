import { Transform } from 'class-transformer';

// "a,b" -> ['a', 'b']; optionally normalises each item (e.g. uppercase for enums).
export const CommaList = (normalise: (v: string) => string = (v) => v) =>
  Transform(({ value }) => (typeof value === 'string' ? value.split(',').map((v) => normalise(v.trim())).filter(Boolean) : value));
