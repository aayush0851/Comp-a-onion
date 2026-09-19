-- AlterTable
ALTER TABLE "JoinRequest" ADD COLUMN "approvedAt" TIMESTAMP(3);

-- Best guess for people already in: the last time their request changed.
UPDATE "JoinRequest" SET "approvedAt" = "updatedAt" WHERE "status" = 'APPROVED';
