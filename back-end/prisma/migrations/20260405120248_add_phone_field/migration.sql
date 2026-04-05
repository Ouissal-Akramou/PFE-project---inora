-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone" TEXT DEFAULT 'member',
ALTER COLUMN "role" DROP DEFAULT;
