-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isOnboarded" BOOLEAN NOT NULL DEFAULT false;

-- Existing users who finished onboarding already have these three saved.
UPDATE "User" SET "isOnboarded" = true WHERE "name" IS NOT NULL AND "dob" IS NOT NULL AND "gender" IS NOT NULL;
