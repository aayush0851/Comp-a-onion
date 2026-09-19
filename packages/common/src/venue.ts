export const VENUE_TEXT_MAX = 20;
export const VENUE_URL_MAX = 500;

// Plain text venues stay short; anything longer has to be a link (scheme optional, no spaces).
export const VENUE_PATTERN = new RegExp(
  String.raw`^(?:[\s\S]{0,${VENUE_TEXT_MAX}}|(?:https?://)?[^\s/]+\.[^\s/]+(?:/\S*)?)$`,
);

export const isValidVenue = (venue: string): boolean => venue.length <= VENUE_URL_MAX && VENUE_PATTERN.test(venue.trim());
