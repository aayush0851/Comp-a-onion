import { Linking } from 'react-native';

export const MAP_LINK_LABEL = 'View on map';

// Google Maps (long and short links) and Apple Maps.
const MAP_LINK = /^(https?:\/\/)?((www\.)?google\.[a-z.]+\/maps|maps\.google\.[a-z.]+|maps\.app\.goo\.gl|goo\.gl\/maps|maps\.apple\.com)(\/|\?|$)/i;

// Returns a openable URL when the whole venue is a pasted map link, otherwise null.
export function mapLinkOf(venue: string | null): string | null {
  const v = venue?.trim();
  if (!v || /\s/.test(v) || !MAP_LINK.test(v)) return null;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

// The OS hands the link to Google Maps or Apple Maps when that app handles it, else the browser.
export const openMapLink = (url: string) => Linking.openURL(url).catch(() => {});
