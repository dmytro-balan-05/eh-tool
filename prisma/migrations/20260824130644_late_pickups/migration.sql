-- CreateTable
CREATE TABLE "LatePickup" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vin" TEXT NOT NULL,
    "weekStart" TEXT NOT NULL,
    "assignedDate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LatePickup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LatePickup_userId_vin_weekStart_key" ON "LatePickup"("userId", "vin", "weekStart");

-- AddForeignKey
ALTER TABLE "LatePickup" ADD CONSTRAINT "LatePickup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
