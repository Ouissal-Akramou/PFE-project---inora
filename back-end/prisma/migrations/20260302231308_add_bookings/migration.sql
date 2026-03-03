-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "activity" TEXT,
    "participants" INTEGER NOT NULL DEFAULT 1,
    "date" TIMESTAMP(3),
    "timeSlot" TEXT,
    "allergies" TEXT,
    "specialRequests" TEXT,
    "additionalNotes" TEXT,
    "preferredContact" TEXT NOT NULL DEFAULT 'telephone',
    "activityTheme" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);
