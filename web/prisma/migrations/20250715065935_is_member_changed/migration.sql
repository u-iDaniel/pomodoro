/*
  Warnings:

  - Made the column `ismember` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "ismember" SET NOT NULL;
