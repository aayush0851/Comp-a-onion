import type { CostMode, Gender, GenderRestriction } from './gender';

export type GoingPerson = { bg: string; fg: string; label: string; name: string; gender: Gender; photo?: string };

export type Activity = {
  id: string;
  slot: string;
  time: string;
  dist: string;
  title: string;
  venueLine: string;
  host: string;
  hostFirst: string;
  hostInitials: string;
  hosted: number;
  entry: 'open' | 'approve';
  seatsFilled: number;
  seatsTotal: number;
  shapeLabel: 'Duo' | 'Table';
  tags: string[];
  when: string;
  where: string;
  gettingIn: string;
  going: GoingPerson[];
  goingLine: string;
  genderRestriction: GenderRestriction;
  costMode: CostMode | null;
};

export const ACTIVITIES: Activity[] = [
  {
    id: 'ramen',
    slot: 'RAMEN COUNTER · JAPANTOWN',
    time: '19:30',
    dist: '0.4 mi',
    title: 'Ramen, then walk it off',
    venueLine: 'Marufuku Ramen',
    host: 'Priya M.',
    hostFirst: 'Priya',
    hostInitials: 'PM',
    hosted: 3,
    entry: 'approve',
    seatsFilled: 3,
    seatsTotal: 6,
    shapeLabel: 'Table',
    tags: ['Low key', 'Food'],
    when: '19:30 today — Priya waits ten minutes, not more',
    where: 'Marufuku Ramen · 0.4 mi',
    gettingIn: 'Priya reads your line and approves',
    going: [
      { bg: '#F6E4DA', fg: '#A6512F', label: 'PM', name: 'Priya M.', gender: 'Woman' },
      { bg: '#E8EDE3', fg: '#4F5C46', label: 'SV', name: 'Sasha V.', gender: 'Woman' },
      { bg: '#EFE6DC', fg: '#5C534B', label: 'RK', name: 'Rin K.', gender: 'Woman' },
    ],
    goingLine: '3 in, 3 seats left',
    genderRestriction: 'women',
    costMode: 'dutch',
  },
  {
    id: 'chess',
    slot: 'CAFE CORNER · MISSION',
    time: '20:00',
    dist: '0.6 mi',
    title: 'Chess and a bad coffee',
    venueLine: 'Venue TBD, decided in chat',
    host: 'Marcus D.',
    hostFirst: 'Marcus',
    hostInitials: 'MD',
    hosted: 21,
    entry: 'open',
    seatsFilled: 1,
    seatsTotal: 2,
    shapeLabel: 'Duo',
    tags: ['Quiet', 'First-timers welcome'],
    when: '20:00 today — first come, no queue',
    where: 'Not set — the group picks in chat',
    gettingIn: 'Open seats — tap and you’re in',
    going: [{ bg: '#F6E4DA', fg: '#A6512F', label: 'MD', name: 'Marcus D.', gender: 'Man' }],
    goingLine: 'Just you and Marcus',
    genderRestriction: 'anyone',
    costMode: 'host',
  },
  {
    id: 'quiz',
    slot: 'BACK ROOM · LOWER HAIGHT',
    time: '19:00',
    dist: '0.9 mi',
    title: 'Pub quiz, need a fourth',
    venueLine: 'Iza Ramen bar next door',
    host: 'Sasha V.',
    hostFirst: 'Sasha',
    hostInitials: 'SV',
    hosted: 8,
    entry: 'approve',
    seatsFilled: 3,
    seatsTotal: 4,
    shapeLabel: 'Table',
    tags: ['Loud', 'Talkers'],
    when: '19:00 today — Sasha waits ten minutes, not more',
    where: 'The Riddler · 0.9 mi',
    gettingIn: 'Sasha reads your line and approves',
    going: [
      { bg: '#F6E4DA', fg: '#A6512F', label: 'SV', name: 'Sasha V.', gender: 'Woman' },
      { bg: '#E8EDE3', fg: '#4F5C46', label: 'RI', name: 'Ren I.', gender: 'Man' },
      { bg: '#EFE6DC', fg: '#5C534B', label: 'TA', name: 'Tobi A.', gender: 'Man' },
    ],
    goingLine: '3 in, 1 seat left',
    genderRestriction: 'anyone',
    costMode: null,
  },
  {
    id: 'run',
    slot: 'TRAILHEAD · PRESIDIO',
    time: '06:30',
    dist: '1.2 mi',
    title: 'Sunrise run, slow pace',
    venueLine: 'Presidio main gate',
    host: 'Tobi A.',
    hostFirst: 'Tobi',
    hostInitials: 'TA',
    hosted: 0,
    entry: 'open',
    seatsFilled: 2,
    seatsTotal: 8,
    shapeLabel: 'Table',
    tags: ['Active', 'Silly'],
    when: '06:30 tomorrow — first come, no queue',
    where: 'Presidio main gate · 1.2 mi',
    gettingIn: 'Open seats — tap and you’re in',
    going: [
      { bg: '#F6E4DA', fg: '#A6512F', label: 'TA', name: 'Tobi A.', gender: 'Man' },
      { bg: '#E8EDE3', fg: '#4F5C46', label: 'RI', name: 'Ren I.', gender: 'Man' },
    ],
    goingLine: '2 in, 6 seats left',
    genderRestriction: 'men',
    costMode: 'dutch',
  },
];
