import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Fixed "current user" so /users/me-style endpoints have something real to
// hit locally without a live OAuth round-trip.
const YOU_EMAIL = 'you@example.com';

type SeedPerson = { name: string; email: string; gender: string };

const PEOPLE: Record<string, SeedPerson> = {
  you: { name: 'You', email: YOU_EMAIL, gender: 'Woman' },
  priya: { name: 'Priya M.', email: 'priya@seed.companion.local', gender: 'Woman' },
  marcus: { name: 'Marcus D.', email: 'marcus@seed.companion.local', gender: 'Man' },
  sasha: { name: 'Sasha V.', email: 'sasha@seed.companion.local', gender: 'Woman' },
  rin: { name: 'Rin K.', email: 'rin@seed.companion.local', gender: 'Woman' },
  ren: { name: 'Ren I.', email: 'ren@seed.companion.local', gender: 'Man' },
  tobi: { name: 'Tobi A.', email: 'tobi@seed.companion.local', gender: 'Man' },
  maya: { name: 'Maya K.', email: 'maya@seed.companion.local', gender: 'Woman' },
  jordan: { name: 'Jordan T.', email: 'jordan@seed.companion.local', gender: 'Nonbinary' },
  sam: { name: 'Sam R.', email: 'sam@seed.companion.local', gender: 'Man' },
  jamie: { name: 'Jamie D.', email: 'jamie@seed.companion.local', gender: 'Woman' },
};

async function upsertPerson(key: keyof typeof PEOPLE) {
  const p = PEOPLE[key];
  return prisma.user.upsert({
    where: { email: p.email },
    update: {},
    create: {
      email: p.email,
      authProvider: 'GOOGLE',
      name: p.name,
      gender: p.gender,
      genderVisible: true,
      dob: new Date('1995-01-01'),
      profilePicture: '',
      latitude: 37.7749,
      longitude: -122.4194,
    },
  });
}

function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function tomorrow(): Date {
  const d = today();
  d.setDate(d.getDate() + 1);
  return d;
}

function timeOf(hhmm: string): Date {
  return new Date(`1970-01-01T${hhmm}:00.000Z`);
}

async function joinAsApproved(postId: string, userId: string) {
  await prisma.joinRequest.upsert({
    where: { postId_userId: { postId, userId } },
    update: { status: 'APPROVED' },
    create: { postId, userId, status: 'APPROVED' },
  });
}

async function requestToJoin(postId: string, userId: string, introText: string) {
  // Seed fixtures aren't cross-consistent (a person can appear as both
  // "already going" on one mock screen and "pending" on another) — skip
  // silently rather than fight the postId+userId uniqueness constraint.
  try {
    await prisma.joinRequest.create({ data: { postId, userId, introText, status: 'PENDING' } });
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002')) throw e;
  }
}

async function main() {
  const you = await upsertPerson('you');
  const priya = await upsertPerson('priya');
  const marcus = await upsertPerson('marcus');
  const sasha = await upsertPerson('sasha');
  const rin = await upsertPerson('rin');
  const ren = await upsertPerson('ren');
  const tobi = await upsertPerson('tobi');
  const maya = await upsertPerson('maya');
  const jordan = await upsertPerson('jordan');
  const sam = await upsertPerson('sam');
  const jamie = await upsertPerson('jamie');

  // --- Posts (from data/activities.ts) ---
  const ramen = await prisma.post.create({
    data: {
      hostId: priya.id,
      title: 'Ramen, then walk it off',
      date: today(),
      time: timeOf('19:30'),
      venue: 'Marufuku Ramen',
      entryMode: 'APPROVE',
      seatsTotal: 6,
      tags: ['Low key', 'Food'],
      genderRestriction: 'WOMEN',
      costMode: 'DUTCH',
    },
  });

  const chess = await prisma.post.create({
    data: {
      hostId: marcus.id,
      title: 'Chess and a bad coffee',
      date: today(),
      time: timeOf('20:00'),
      venue: null,
      entryMode: 'OPEN',
      seatsTotal: 2,
      tags: ['Quiet', 'First-timers welcome'],
      genderRestriction: 'ANYONE',
      costMode: 'HOST',
    },
  });

  const quiz = await prisma.post.create({
    data: {
      hostId: sasha.id,
      title: 'Pub quiz, need a fourth',
      date: today(),
      time: timeOf('19:00'),
      venue: 'The Riddler',
      entryMode: 'APPROVE',
      seatsTotal: 4,
      tags: ['Loud', 'Talkers'],
      genderRestriction: 'ANYONE',
    },
  });

  const run = await prisma.post.create({
    data: {
      hostId: tobi.id,
      title: 'Sunrise run, slow pace',
      date: tomorrow(),
      time: timeOf('06:30'),
      venue: 'Presidio main gate',
      entryMode: 'OPEN',
      seatsTotal: 8,
      tags: ['Active', 'Silly'],
      genderRestriction: 'MEN',
      costMode: 'DUTCH',
    },
  });

  // --- Attendees (from Activity.going[]) ---
  await joinAsApproved(ramen.id, priya.id);
  await joinAsApproved(ramen.id, sasha.id);
  await joinAsApproved(ramen.id, rin.id);

  await joinAsApproved(chess.id, marcus.id);

  await joinAsApproved(quiz.id, sasha.id);
  await joinAsApproved(quiz.id, ren.id);
  await joinAsApproved(quiz.id, tobi.id);

  await joinAsApproved(run.id, tobi.id);
  await joinAsApproved(run.id, ren.id);

  // --- Pending requesters (from data/people.ts, queued against ramen) ---
  await requestToJoin(ramen.id, tobi.id, 'Three weeks in this city and I can eat an unreasonable amount of ramen.');
  await requestToJoin(ramen.id, ren.id, 'Quiet by default but I will talk if talked to.');
  await requestToJoin(ramen.id, maya.id, "I'm in the area tonight, down for this.");
  await requestToJoin(ramen.id, jordan.id, 'Free after 7, sounds fun.');
  await requestToJoin(ramen.id, sam.id, "First time trying this — I'm in.");

  // --- Chat (from data/chat.ts, on the ramen post) ---
  await prisma.chatMessage.createMany({
    data: [
      {
        postId: ramen.id,
        authorId: priya.id,
        text: 'Three of us so far. I’ll be the one reading a paperback so you can find me.',
      },
      {
        postId: ramen.id,
        authorId: sasha.id,
        text: 'Marufuku queue on a Tuesday is genuinely 40 minutes. Iza is a walk-in.',
      },
      { postId: ramen.id, authorId: you.id, text: 'Either works — coming from work so 19:30 is tight.' },
      { postId: ramen.id, authorId: priya.id, text: 'Same three rules, and let’s stop discussing broth.' },
    ],
  });

  // --- Reviews received by "you" (from data/reviews.ts) ---
  const rv1 = await prisma.review.create({
    data: { postId: ramen.id, reviewerId: maya.id, setupScores: {}, setupTags: [] },
  });
  await prisma.personReview.create({
    data: {
      reviewId: rv1.id,
      revieweeId: you.id,
      rating: 5,
      note: "Turned up early, saved everyone a seat and kept the table talking. I'd been nervous about the whole idea and she made it easy. Would absolutely go again.",
      tags: ['Showed up on time', 'Easy to talk to', 'Would go again'],
      meetAgain: true,
    },
  });

  const rv2 = await prisma.review.create({
    data: { postId: ramen.id, reviewerId: sasha.id, setupScores: {}, setupTags: [] },
  });
  await prisma.personReview.create({
    data: {
      reviewId: rv2.id,
      revieweeId: you.id,
      rating: 5,
      note: 'Knew exactly which queue to join. Effortless evening.',
      tags: ['Would go again'],
      meetAgain: true,
    },
  });

  const rv3 = await prisma.review.create({
    data: { postId: chess.id, reviewerId: jamie.id, setupScores: {}, setupTags: [] },
  });
  await prisma.personReview.create({
    data: {
      reviewId: rv3.id,
      revieweeId: you.id,
      rating: 4,
      note: 'Good company, though we lost half the table when the walk started.',
      tags: ['Easy to talk to'],
      meetAgain: true,
    },
  });

  // Mirror ReviewsService's recompute-on-write so "you" shows a real rating
  // immediately, without needing to hit the reviews API first.
  const youPersonReviews = await prisma.personReview.findMany({ where: { revieweeId: you.id } });
  const ratings = youPersonReviews.map((p) => p.rating).filter((r): r is number => r != null);
  const aggregatedRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
  await prisma.user.update({ where: { id: you.id }, data: { aggregatedRating } });

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
