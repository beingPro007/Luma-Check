/*
  Warnings:

  - A unique constraint covering the columns `[forgottenPasswordToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "forgottenPasswordExpiryTime" TIMESTAMP(3),
ADD COLUMN     "forgottenPasswordToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_forgottenPasswordToken_key" ON "User"("forgottenPasswordToken");
