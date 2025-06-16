-- CreateEnum
CREATE TYPE "organizationType" AS ENUM ('INDIVIDUAL', 'BUSINESS', 'NON_PROFIT', 'GOVERNMENT');

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "orgAddress" TEXT,
ADD COLUMN     "orgLegalName" TEXT,
ADD COLUMN     "orgType" "organizationType";
