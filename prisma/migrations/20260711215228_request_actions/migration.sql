-- CreateEnum
CREATE TYPE "RequestActionType" AS ENUM ('CALLED_NO_ANSWER', 'TEXTED', 'RESOLVED');

-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "resolvedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "RequestAction" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" "RequestSource" NOT NULL,
    "type" "RequestActionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestAction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RequestAction" ADD CONSTRAINT "RequestAction_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;
