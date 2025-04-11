/*
  Warnings:

  - Added the required column `auditGeneralID` to the `audits` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "audits" ADD COLUMN     "auditGeneralID" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "audits" ADD CONSTRAINT "audits_auditGeneralID_fkey" FOREIGN KEY ("auditGeneralID") REFERENCES "audit_general"("auditGeneralID") ON DELETE RESTRICT ON UPDATE CASCADE;
