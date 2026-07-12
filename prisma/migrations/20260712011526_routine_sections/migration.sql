/*
  Warnings:

  - You are about to drop the column `section` on the `Routine` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Routine" DROP COLUMN "section",
ADD COLUMN     "sections" "ReportSection"[];
