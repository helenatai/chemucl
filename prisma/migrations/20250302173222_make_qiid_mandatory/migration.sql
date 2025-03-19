/*
  Warnings:

  - Made the column `qrID` on table `chemicals` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "chemicals" ALTER COLUMN "qrID" SET NOT NULL;
