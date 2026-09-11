export type Dot = { filled: boolean };

export const ONBOARDING_STEPS = 7;

export const GENDER_OPTIONS = ['Woman', 'Man', 'Nonbinary'] as const;

export const PROXIMITY_MIN_KM = 0;
export const PROXIMITY_MAX_KM = 100;

export function formatProximityKm(km: number): string {
  return km < 1 ? '<1 km' : `${Math.round(km)} km`;
}

export function parseDistKm(dist: string): number {
  const miles = parseFloat(dist) || 0;
  return miles * 1.60934;
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export type DateOption = { key: string; label: string; dateLabel: string; full: string };

export function dateKeyFromDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function formatDateKey(key: string): string {
  const [y, mo, da] = key.split('-').map(Number);
  const d = new Date(y, mo - 1, da);
  return `${WEEKDAY_LABELS[d.getDay()]}, ${MONTH_LABELS[d.getMonth()]} ${d.getDate()}`;
}

export function isDateKeyPast(key: string): boolean {
  const [y, mo, da] = key.split('-').map(Number);
  const planDate = new Date(y, mo - 1, da);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return planDate < today;
}

export function nextSevenDays(from: Date = new Date()): DateOption[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    const key = dateKeyFromDate(d);
    const weekday = WEEKDAY_LABELS[d.getDay()];
    const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : weekday;
    const dateLabel = `${MONTH_LABELS[d.getMonth()]} ${d.getDate()}`;
    return { key, label, dateLabel, full: `${weekday}, ${dateLabel}` };
  });
}

export const SELFIE_POSES = [
  { key: 'front', label: 'Look straight ahead', body: 'Center your face, neutral expression. Good light, no sunglasses or hats.' },
  { key: 'left', label: 'Turn slightly to your left', body: "Just a slight turn — it's how we check this is a real face, not a photo of a photo." },
  { key: 'right', label: 'Turn slightly to your right', body: 'Last one — same idea, the other way.' },
] as const;

export function maskPhone(digits: string): string {
  if (digits.length < 10) return '+91 ····· ·····';
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5, 6)}···${digits.slice(-3)}`;
}

export type GenderRestriction = 'everyone' | 'women' | 'men';
export type CostMode = 'host' | 'dutch';

export const GENDER_RESTRICTION_OPTIONS: { key: GenderRestriction; title: string; desc: string }[] = [
  { key: 'everyone', title: 'Anyone', desc: 'Open to anyone nearby.' },
  { key: 'women', title: 'Women only', desc: 'Only women can ask to join.' },
  { key: 'men', title: 'Men only', desc: 'Only men can ask to join.' },
];

export const COST_MODE_OPTIONS: { key: CostMode; title: string; desc: string }[] = [
  { key: 'dutch', title: 'Go dutch', desc: 'Everyone pays their own way.' },
  { key: 'host', title: "Host's got it", desc: "You're sponsoring — nobody else pays." },
];

export function genderRestrictionLabel(g: GenderRestriction): string {
  return GENDER_RESTRICTION_OPTIONS.find((o) => o.key === g)?.title ?? 'Anyone';
}

export function costModeLabel(c: CostMode | null): string | null {
  if (!c) return null;
  return c === 'host' ? 'Host is sponsoring' : 'Go dutch';
}

export type Gender = 'Woman' | 'Man' | 'Nonbinary';

export function genderIconSymbol(g: Gender): string {
  if (g === 'Woman') return '♀';
  if (g === 'Man') return '♂';
  return '⚧';
}

export const GENDER_COLORS: Record<Gender, { bg: string; fg: string }> = {
  Woman: { bg: '#F9E1EA', fg: '#B23A6B' },
  Man: { bg: '#E1EAF9', fg: '#2F5FA6' },
  Nonbinary: { bg: '#EDE1F9', fg: '#6B3AA6' },
};

export function genderRestrictionColors(g: GenderRestriction): { bg: string; fg: string } {
  if (g === 'women') return GENDER_COLORS.Woman;
  if (g === 'men') return GENDER_COLORS.Man;
  return { bg: '#E8EDE3', fg: '#4F5C46' };
}

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
    genderRestriction: 'everyone',
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
    genderRestriction: 'everyone',
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

export const GREETINGS = [
  'Four plans near you tonight.',
  'Eleven plans tomorrow.',
  'Thirty-two this week.',
];

export const FILTER_LABELS = ['Tonight', 'Tomorrow', 'This week'];

export const SIGNUP_STEPS = [
  { n: 1, t: 'Number, ID and a selfie. Forty seconds, then you’re real.' },
  { n: 2, t: 'Say what you’re up for — five taps, no essay.' },
  { n: 3, t: 'See what’s happening within a mile tonight.' },
];

export const VERIFY_STEPS = [
  { key: 'phone', t: 'Phone number', d: '+91 ····· ·····', state: 'Done', done: true },
  { key: 'selfie', t: 'Selfie check', d: 'Blink twice. That’s the whole test.', state: 'Start', done: false },
];

export const HOUSE_RULES = [
  'Public places only, and the spot is on the card before you say yes.',
  'This is not a date. If that’s what you’re after, wrong app.',
  'Say if you can’t make it — ghosting shows on your turn-up rate.',
];

export const VIBE_TAGS = [
  'Low key', 'Talkers', 'Loud', 'Quiet', 'Active', 'First-timers welcome', 'No phones', 'Silly',
];

export const TABS = ['Explore', 'Plans', 'Chats', 'Me'];

export type QueueRequest = {
  id: string;
  name: string;
  initials: string;
  isNew: boolean;
  history: string;
  intro: string;
};

export const QUEUE_SEED: QueueRequest[] = [
  { id: 'tobi', name: 'Tobi A.', initials: 'TA', isNew: true, history: 'New here · no plans yet', intro: 'Three weeks in this city and I can eat an unreasonable amount of ramen.' },
  { id: 'sasha', name: 'Sasha V.', initials: 'SV', isNew: false, history: '8 shown up · 100% turn-up', intro: 'I know which of the two Marufuku queues moves faster. Bring me.' },
  { id: 'ren', name: 'Ren I.', initials: 'RI', isNew: true, history: 'New here · no plans yet', intro: 'Quiet by default but I will talk if talked to. Working remote, seen nobody all week.' },
  { id: 'marcus', name: 'Marcus D.', initials: 'MD', isNew: false, history: '21 shown up · 2 hosted', intro: 'Ramen is, at this point, my entire personality.' },
];

export const REQUESTER_POOL: QueueRequest[] = [
  { id: 'maya', name: 'Maya K.', initials: 'MK', isNew: true, history: 'New here · no plans yet', intro: "I'm in the area tonight, down for this." },
  { id: 'jordan', name: 'Jordan T.', initials: 'JT', isNew: false, history: '5 shown up · 100% turn-up', intro: 'Free after 7, sounds fun.' },
  { id: 'sam', name: 'Sam R.', initials: 'SR', isNew: true, history: 'New here · no plans yet', intro: "First time trying this — I'm in." },
];

export type ChatMessage = { id: string; author: string; mine: boolean; host?: boolean; text: string };

export const CHAT_SEED: ChatMessage[] = [
  { id: 'm1', author: 'Priya M.', mine: false, host: true, text: 'Three of us so far. I’ll be the one reading a paperback so you can find me.' },
  { id: 'm2', author: 'Sasha V.', mine: false, text: 'Marufuku queue on a Tuesday is genuinely 40 minutes. Iza is a walk-in.' },
  { id: 'm3', author: 'You', mine: true, text: 'Either works — coming from work so 19:30 is tight.' },
  { id: 'm4', author: 'Priya M.', mine: false, host: true, text: 'Same three rules, and let’s stop discussing broth.' },
];

export const REVIEW_ATTENDEES = [
  { id: 'priya', name: 'Priya M.', initials: 'PM', role: 'Host' },
  { id: 'sasha', name: 'Sasha V.', initials: 'SV', role: 'Went' },
  { id: 'tobi', name: 'Tobi A.', initials: 'TA', role: 'First plan' },
];

export const SETUP_AXES = [
  { key: 'venue', label: 'The venue', desc: 'Right place for what this was?' },
  { key: 'timing', label: 'The timing', desc: 'Long enough, late enough, not too much.' },
  { key: 'size', label: 'The group size', desc: 'Duo, table, or too many voices.' },
  { key: 'host', label: 'How Priya ran it', desc: 'Turned up, waited, kept it moving.' },
];

export const SETUP_WORDS = ['Off', 'Not quite', 'Fine', 'Good', 'Nailed it'];

export const SETUP_TAGS = ['Good hang', 'Would repeat', 'Awkward but fine', 'Too big a group', 'Better than my sofa', 'Ran way over'];

export const PEOPLE_TAGS = ['On time', 'Easy to talk to', 'Included everyone', 'Quiet, in a good way', 'Brought the energy', 'Left early'];

export const PROFILE_UP_FOR = ['Low key', 'Talkers', 'Food', 'Long walks', 'No karaoke'];

export const PROFILE_HISTORY = [
  { title: 'Chess and a bad coffee', date: '2 Apr' },
  { title: 'Pub quiz came fourth', date: '28 Mar' },
  { title: 'Sunrise run slow pace', date: '22 Mar' },
  { title: 'Ramen then walk it off', date: '14 Mar' },
];

export const PROFILE_WORDS = [
  { label: 'Easy to talk to', count: '9 people' },
  { label: 'On time', count: '11 people' },
  { label: 'Included everyone', count: '6 people' },
  { label: 'Quiet, in a good way', count: '3 people' },
];
