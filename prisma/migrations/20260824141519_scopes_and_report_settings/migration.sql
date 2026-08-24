-- CreateEnum
CREATE TYPE "OfferScope" AS ENUM ('DOMESTIC', 'INTERNATIONAL');

-- AlterTable
ALTER TABLE "LateDelivery" ADD COLUMN     "mode" "OfferScope" NOT NULL DEFAULT 'INTERNATIONAL';

-- AlterTable
ALTER TABLE "LatePickup" ADD COLUMN     "mode" "OfferScope" NOT NULL DEFAULT 'DOMESTIC';

-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "mode" "OfferScope" NOT NULL DEFAULT 'DOMESTIC';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "reportLateDel" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "reportLatePickups" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "reportOffers" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "reportRequests" BOOLEAN NOT NULL DEFAULT true;
