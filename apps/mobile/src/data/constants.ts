export const ONBOARDING_STEPS = 8;

export const GENDER_OPTIONS = ['Woman', 'Man', 'Nonbinary'] as const;

export const PROXIMITY_MIN_KM = 0;
export const PROXIMITY_MAX_KM = 100;

export const SELFIE_POSES = [
  { key: 'front', label: 'Look straight ahead', body: 'Center your face, neutral expression. Good light, no sunglasses or hats.' },
  { key: 'left', label: 'Turn slightly to your left', body: "Just a slight turn — it's how we check this is a real face, not a photo of a photo." },
  { key: 'right', label: 'Turn slightly to your right', body: 'Last one — same idea, the other way.' },
] as const;

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

export const SETUP_AXES = [
  { key: 'venue', label: 'The venue', desc: 'Right place for what this was?' },
  { key: 'timing', label: 'The timing', desc: 'Long enough, late enough, not too much.' },
  { key: 'size', label: 'The group size', desc: 'Duo, table, or too many voices.' },
  { key: 'overall', label: 'How it came together', desc: 'Turnout, timing, vibe — overall.' },
];

export const SETUP_WORDS = ['Off', 'Not quite', 'Fine', 'Good', 'Nailed it'];

export const SETUP_TAGS = ['Good hang', 'Would repeat', 'Awkward but fine', 'Too big a group', 'Better than my sofa', 'Ran way over'];

export const PEOPLE_TAGS = ['On time', 'Easy to talk to', 'Included everyone', 'Quiet, in a good way', 'Brought the energy', 'Left early'];

export const RATING_DIST = [83, 13, 4, 0, 0];
export const RATING_TRAITS: { label: string; n: string }[] = [
  { label: 'Showed up on time', n: '21' },
  { label: 'Easy to talk to', n: '19' },
  { label: 'Would go again', n: '18' },
];

export const REPORT_REASONS = [
  'We never actually met',
  "It's abusive or harassing",
  'It shares private details',
  "It's about someone else",
];
