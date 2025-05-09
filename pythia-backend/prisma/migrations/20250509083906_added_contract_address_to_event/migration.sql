/*
  Warnings:

  - A unique constraint covering the columns `[transactionHash]` on the table `event` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `deploymentId` to the `xnodeClaimActivities` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "event" ADD COLUMN     "contractAddress" TEXT,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "data" DROP NOT NULL,
ALTER COLUMN "blockNumber" DROP NOT NULL,
ALTER COLUMN "blockNumber" DROP DEFAULT;

-- AlterTable
ALTER TABLE "xnodeClaimActivities" ADD COLUMN     "deploymentId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "deployment" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "isUnit" BOOLEAN NOT NULL,
    "services" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "location" TEXT,
    "apiKey" TEXT,
    "accessToken" TEXT,
    "heartbeatData" TEXT,
    "openmeshExpertUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "deployment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_transactionHash_key" ON "event"("transactionHash");

-- AddForeignKey
ALTER TABLE "deployment" ADD CONSTRAINT "deployment_openmeshExpertUserId_fkey" FOREIGN KEY ("openmeshExpertUserId") REFERENCES "openmeshExpertUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xnodeClaimActivities" ADD CONSTRAINT "xnodeClaimActivities_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "deployment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
