-- AlterTable
ALTER TABLE "twoFactor" ALTER COLUMN "backupCodes" SET NOT NULL,
ALTER COLUMN "backupCodes" SET DATA TYPE TEXT;
