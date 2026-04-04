/*
  Warnings:

  - You are about to drop the column `activityTheme` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the `Conversation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_claimedById_fkey";

-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_userId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "activityTheme";

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "actionUrl" TEXT;

-- DropTable
DROP TABLE "Conversation";

-- DropTable
DROP TABLE "Message";
