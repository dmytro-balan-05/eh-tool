-- CreateTable
CREATE TABLE "LateDelivery" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vin" TEXT NOT NULL,
    "weekStart" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LateDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LateDelivery_userId_vin_weekStart_key" ON "LateDelivery"("userId", "vin", "weekStart");

-- AddForeignKey
ALTER TABLE "LateDelivery" ADD CONSTRAINT "LateDelivery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
