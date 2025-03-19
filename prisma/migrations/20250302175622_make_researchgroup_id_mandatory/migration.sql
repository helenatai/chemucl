/*
  Warnings:

  - Made the column `researchGroupID` on table `chemicals` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "chemicals" DROP CONSTRAINT "chemicals_researchGroupID_fkey";

-- AlterTable
ALTER TABLE "chemicals" ALTER COLUMN "researchGroupID" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "chemicals" ADD CONSTRAINT "chemicals_researchGroupID_fkey" FOREIGN KEY ("researchGroupID") REFERENCES "ResearchGroup"("researchGroupID") ON DELETE RESTRICT ON UPDATE CASCADE;
