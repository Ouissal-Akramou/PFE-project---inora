/*
  Warnings:

  - You are about to drop the column `gatheringRequestId` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the `GatheringRequest` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[bookingId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "GatheringRequest" DROP CONSTRAINT "GatheringRequest_userId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_gatheringRequestId_fkey";

-- DropIndex
DROP INDEX "Review_gatheringRequestId_key";

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "gatheringRequestId",
ADD COLUMN     "bookingId" INTEGER;

-- DropTable
DROP TABLE "GatheringRequest";

-- CreateIndex
CREATE UNIQUE INDEX "Review_bookingId_key" ON "Review"("bookingId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
