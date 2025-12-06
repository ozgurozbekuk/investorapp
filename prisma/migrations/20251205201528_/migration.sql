-- CreateTable
CREATE TABLE "Dislike" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dislike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Dislike_userId_postId_idx" ON "Dislike"("userId", "postId");

-- CreateIndex
CREATE UNIQUE INDEX "Dislike_userId_postId_key" ON "Dislike"("userId", "postId");

-- AddForeignKey
ALTER TABLE "Dislike" ADD CONSTRAINT "Dislike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dislike" ADD CONSTRAINT "Dislike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
