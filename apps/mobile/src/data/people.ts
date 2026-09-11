export type Tone = 'peach' | 'sage' | 'sand';

export type QueueRequest = {
  id: string;
  name: string;
  initials: string;
  isNew: boolean;
  history: string;
  intro: string;
  tone: Tone;
  rating?: number;
  ratingCount?: number;
};

export const QUEUE_SEED: QueueRequest[] = [
  { id: 'tobi', name: 'Tobi A.', initials: 'TA', isNew: true, history: 'New here · no plans yet', intro: 'Three weeks in this city and I can eat an unreasonable amount of ramen.', tone: 'sand' },
  { id: 'sasha', name: 'Sasha V.', initials: 'SV', isNew: false, history: '8 shown up · 100% turn-up', intro: 'I know which of the two Marufuku queues moves faster. Bring me.', tone: 'sage', rating: 4.9, ratingCount: 8 },
  { id: 'ren', name: 'Ren I.', initials: 'RI', isNew: true, history: 'New here · no plans yet', intro: 'Quiet by default but I will talk if talked to. Working remote, seen nobody all week.', tone: 'sand' },
  { id: 'marcus', name: 'Marcus D.', initials: 'MD', isNew: false, history: '21 shown up · 2 hosted', intro: 'Ramen is, at this point, my entire personality.', tone: 'peach', rating: 4.2, ratingCount: 21 },
];

export const REQUESTER_POOL: QueueRequest[] = [
  { id: 'maya', name: 'Maya K.', initials: 'MK', isNew: true, history: 'New here · no plans yet', intro: "I'm in the area tonight, down for this.", tone: 'sage' },
  { id: 'jordan', name: 'Jordan T.', initials: 'JT', isNew: false, history: '5 shown up · 100% turn-up', intro: 'Free after 7, sounds fun.', tone: 'peach', rating: 4.7, ratingCount: 5 },
  { id: 'sam', name: 'Sam R.', initials: 'SR', isNew: true, history: 'New here · no plans yet', intro: "First time trying this — I'm in.", tone: 'sand' },
];
