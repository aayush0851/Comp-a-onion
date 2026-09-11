import type { Tone } from './people';

// Reviews other people have left about you. Static seed — this is a single-user
// prototype with no backend, so "received" feedback is mocked the same way
// ACTIVITIES/QUEUE_SEED are, rather than round-tripped through a fake server.
export type ReceivedReview = {
  id: string;
  reviewer: string;
  initials: string;
  tone: Tone;
  reviewerRating?: number;
  reviewerCount?: number;
  rating: number;
  date: string;
  body: string;
  tags: string[];
  plan: string;
  reply?: string;
};

export const RECEIVED_REVIEWS: ReceivedReview[] = [
  {
    id: 'rv1', reviewer: 'Maya K.', initials: 'MK', tone: 'sage', reviewerRating: 4.6, reviewerCount: 5,
    rating: 5, date: '2 weeks ago',
    body: "Turned up early, saved everyone a seat and kept the table talking. I'd been nervous about the whole idea and she made it easy. Would absolutely go again.",
    tags: ['Showed up on time', 'Easy to talk to', 'Would go again'], plan: 'Ramen, then walk it off · 7 Apr',
  },
  {
    id: 'rv2', reviewer: 'Sasha V.', initials: 'SV', tone: 'peach', reviewerRating: 4.9, reviewerCount: 8,
    rating: 5, date: '3 weeks ago',
    body: 'Knew exactly which queue to join. Effortless evening.',
    tags: ['Would go again'], plan: 'Ramen, then walk it off · 30 Mar',
  },
  {
    id: 'rv3', reviewer: 'Jamie D.', initials: 'JD', tone: 'sand', reviewerRating: 4.4, reviewerCount: 3,
    rating: 4, date: '1 month ago',
    body: 'Good company, though we lost half the table when the walk started.',
    tags: ['Easy to talk to'], plan: 'Chess and a bad coffee · 12 Mar',
    reply: "Ha — next time I'll pick a shorter loop.",
  },
];
