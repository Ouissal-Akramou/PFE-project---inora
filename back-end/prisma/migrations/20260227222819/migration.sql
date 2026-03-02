/*
  Warnings:

  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `reviews` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "image",
DROP COLUMN "updatedAt",
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "suspended" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "role" SET DEFAULT 'member';

-- DropTable
DROP TABLE "reviews";

-- CreateTable
CREATE TABLE "GatheringRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "occasion" TEXT NOT NULL,
    "activity" TEXT NOT NULL,
    "guestCount" INTEGER NOT NULL,
    "preferredDate" TIMESTAMP(3) NOT NULL,
    "alternateDate" TIMESTAMP(3),
    "location" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "specialRequests" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalPrice" DOUBLE PRECISION,
    "advanceAmount" DOUBLE PRECISION,
    "advancePaid" BOOLEAN NOT NULL DEFAULT false,
    "remainingPaid" BOOLEAN NOT NULL DEFAULT false,
    "advancePaidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GatheringRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Draft" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "formData" JSONB NOT NULL,
    "lastSavedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Draft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gatheringRequestId" TEXT,
    "comment" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Review_gatheringRequestId_key" ON "Review"("gatheringRequestId");

-- AddForeignKey
ALTER TABLE "GatheringRequest" ADD CONSTRAINT "GatheringRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Draft" ADD CONSTRAINT "Draft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_gatheringRequestId_fkey" FOREIGN KEY ("gatheringRequestId") REFERENCES "GatheringRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
