export const ONBOARDING_STEPS = 8;

// ponytail: off for now per product ask, flip to true to bring selfie verification back.
export const SELFIE_VERIFICATION_ENABLED = false;

// ponytail: dev-only convenience for a free-tier Render server that cold-starts —
// turn off once on a paid tier that doesn't sleep.
export const SERVER_STATUS_INDICATOR_ENABLED = true;

export const GENDER_OPTIONS = ['Woman', 'Man', 'Nonbinary'] as const;

export const PROXIMITY_MIN_KM = 0;
export const PROXIMITY_MAX_KM = 100;

export const SELFIE_POSES = [
  { key: 'front', label: 'Look straight at the camera', body: 'Good light, no filters. This is only for the check.' },
  { key: 'left', label: 'Turn slightly to your left', body: "Just a slight turn — it's how we check this is a real face, not a photo of a photo." },
  { key: 'right', label: 'Turn slightly to your right', body: 'Last one — same idea, the other way.' },
] as const;

export const FILTER_LABELS = ['Tonight', 'Tomorrow', 'This week', 'Any'];

export const GROUP_SIZE_LABELS = ['Duo', 'Group', 'Any size'];

export const WHO_THERE_LABELS = ['Men only', 'Women only', 'Anyone'];

export const SIGNUP_STEPS = [
  { n: 1, t: "Post what you're doing tonight" },
  { n: 2, t: 'Strangers ask to join' },
  { n: 3, t: 'You pick who sits with you' },
];

export const PLAN_TYPES = ['Meetup', 'Coffee', 'Movie', 'Walk n talk', 'Food', 'Drinks', 'Games', 'Something else'];

export const PROFILE_TAGS = [
  'Foodie', 'Traveller', 'Sporty', 'Gym freak', 'Extrovert', 'Introvert', 'Night owl', 'Creative',
];

export const SETUP_AXES = [
  { key: 'venue', label: 'The venue', desc: 'Right place for what this was?' },
  { key: 'timing', label: 'The timing', desc: 'Long enough, late enough, not too much.' },
  { key: 'size', label: 'The group size', desc: 'Duo, group, or too many voices.' },
  { key: 'overall', label: 'How it came together', desc: 'Turnout, timing, vibe — overall.' },
];

export const SETUP_WORDS = ['Off', 'Not quite', 'Fine', 'Good', 'Nailed it'];

export const SETUP_TAGS = ['Good hang', 'Would repeat', 'Awkward but fine', 'Too big a group', 'Better than my sofa', 'Ran way over'];

export const PEOPLE_TAGS = ['On time', 'Easy to talk to', 'Included everyone', 'Quiet, in a good way', 'Brought the energy', 'Left early'];

export const REPORT_REASONS = [
  'We never actually met',
  "It's abusive or harassing",
  'It shares private details',
  "It's about someone else",
];
