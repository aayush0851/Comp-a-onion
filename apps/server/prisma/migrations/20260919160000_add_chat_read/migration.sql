-- CreateTable
CREATE TABLE "ChatRead" (
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "peerId" TEXT NOT NULL DEFAULT '',
    "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatRead_pkey" PRIMARY KEY ("userId","postId","peerId")
);

-- AddForeignKey
ALTER TABLE "ChatRead" ADD CONSTRAINT "ChatRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatRead" ADD CONSTRAINT "ChatRead_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Existing conversations start out read, so nobody gets a wall of old "unread" chats on upgrade.
INSERT INTO "ChatRead" ("userId", "postId", "peerId")
SELECT DISTINCT u."userId", m."postId", ''
FROM "ChatMessage" m
JOIN (
  SELECT "id" AS "postId", "hostId" AS "userId" FROM "Post"
  UNION SELECT "postId", "userId" FROM "JoinRequest" WHERE "status" = 'APPROVED'
) u ON u."postId" = m."postId"
WHERE m."dmWithUserId" IS NULL AND m."postId" IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO "ChatRead" ("userId", "postId", "peerId")
SELECT DISTINCT "dmWithUserId", "postId", "authorId"
FROM "ChatMessage"
WHERE "dmWithUserId" IS NOT NULL AND "postId" IS NOT NULL
ON CONFLICT DO NOTHING;
