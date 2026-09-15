import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { archiveExpiredEvents } from './archive-expired.js';

const prisma = new PrismaClient();

archiveExpiredEvents(prisma)
  .then((count) => console.log(count === 0 ? 'No expired plans to archive.' : `Archived ${count} expired plan(s).`))
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
