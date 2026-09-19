import { describe, expect, it } from 'vitest';
import { isValidVenue } from '@companion/common';

describe('isValidVenue', () => {
  it('allows short text and links, rejects long plain text', () => {
    expect(isValidVenue('Blue Tokai')).toBe(true);
    expect(isValidVenue('https://maps.app.goo.gl/abc123')).toBe(true);
    expect(isValidVenue('maps.apple.com/?q=cafe')).toBe(true);
    expect(isValidVenue('somewhere near the big old tree')).toBe(false);
  });
});
