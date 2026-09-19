import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { archiveExpiredPosts } from './archive-expired.js';

const prisma = new PrismaClient();

archiveExpiredPosts(prisma)
  .then((ids) => console.log(ids.length === 0 ? 'No expired plans to archive.' : `Archived ${ids.length} expired plan(s).`))
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
