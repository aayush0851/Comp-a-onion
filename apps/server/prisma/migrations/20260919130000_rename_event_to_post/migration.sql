-- Rename table and columns in place so existing rows are preserved.
ALTER TABLE "Event" RENAME TO "Post";
ALTER TABLE "JoinRequest" RENAME COLUMN "eventId" TO "postId";
ALTER TABLE "ChatMessage" RENAME COLUMN "eventId" TO "postId";
ALTER TABLE "Review" RENAME COLUMN "eventId" TO "postId";

ALTER TABLE "Post" RENAME CONSTRAINT "Event_pkey" TO "Post_pkey";
ALTER TABLE "Post" RENAME CONSTRAINT "Event_hostId_fkey" TO "Post_hostId_fkey";
ALTER TABLE "JoinRequest" RENAME CONSTRAINT "JoinRequest_eventId_fkey" TO "JoinRequest_postId_fkey";
ALTER TABLE "ChatMessage" RENAME CONSTRAINT "ChatMessage_eventId_fkey" TO "ChatMessage_postId_fkey";
ALTER TABLE "Review" RENAME CONSTRAINT "Review_eventId_fkey" TO "Review_postId_fkey";

ALTER INDEX "Event_date_idx" RENAME TO "Post_date_idx";
ALTER INDEX "Event_hostId_idx" RENAME TO "Post_hostId_idx";
ALTER INDEX "JoinRequest_eventId_status_idx" RENAME TO "JoinRequest_postId_status_idx";
ALTER INDEX "JoinRequest_eventId_userId_key" RENAME TO "JoinRequest_postId_userId_key";
ALTER INDEX "ChatMessage_eventId_createdAt_idx" RENAME TO "ChatMessage_postId_createdAt_idx";
ALTER INDEX "Review_eventId_reviewerId_key" RENAME TO "Review_postId_reviewerId_key";
