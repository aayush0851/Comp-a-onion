import { GenderRestriction } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { isVisibleOnBoard, type PostCreatedPayload, type Viewer } from './board-visibility.js';

const viewer = (gender: string | null): Viewer => ({ gender, latitude: null, longitude: null });
const post = (genderRestriction: PostCreatedPayload['genderRestriction']): PostCreatedPayload => ({
  title: 'Ramen night',
  description: null,
  seatsTotal: 4,
  tags: ['Food'],
  genderRestriction,
  date: new Date(),
  hostLatitude: null,
  hostLongitude: null,
});

describe('isVisibleOnBoard', () => {
  it('hides a women-only post from men and unset genders, shows it to women', () => {
    expect(isVisibleOnBoard(viewer('Man'), post('WOMEN'))).toBe(false);
    expect(isVisibleOnBoard(viewer(null), post('WOMEN'))).toBe(false);
    expect(isVisibleOnBoard(viewer('Woman'), post('WOMEN'))).toBe(true);
  });

  it('shows open posts to everyone', () => {
    expect(isVisibleOnBoard(viewer('Man'), post('ANYONE'))).toBe(true);
  });

  it('respects the date bucket', () => {
    const nextWeek = { ...post('ANYONE'), date: new Date(Date.now() + 30 * 86400000) };
    expect(isVisibleOnBoard(viewer('Man'), nextWeek, { filter: 0 })).toBe(false);
    expect(isVisibleOnBoard(viewer('Man'), nextWeek)).toBe(true);
  });

  it('applies the on-device filters: size, women only, plan type and search', () => {
    const p = post('ANYONE');
    expect(isVisibleOnBoard(viewer('Man'), p, { groupSize: 0 })).toBe(false);
    expect(isVisibleOnBoard(viewer('Man'), p, { groupSize: 1 })).toBe(true);
    expect(isVisibleOnBoard(viewer('Woman'), p, { gender: [GenderRestriction.WOMEN] })).toBe(false);
    expect(isVisibleOnBoard(viewer('Man'), p, { types: ['Coffee'] })).toBe(false);
    expect(isVisibleOnBoard(viewer('Man'), p, { types: ['Coffee', 'Food'] })).toBe(true);
    expect(isVisibleOnBoard(viewer('Man'), p, { q: 'RAMEN' })).toBe(true);
    expect(isVisibleOnBoard(viewer('Man'), p, { q: 'chess' })).toBe(false);
  });
});
