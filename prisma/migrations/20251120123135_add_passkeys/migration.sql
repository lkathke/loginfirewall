-- AlterTable
ALTER TABLE "User" ADD COLUMN "passkeyChallenge" TEXT;
ALTER TABLE "User" ADD COLUMN "passkeyChallengeExpires" DATETIME;

-- CreateTable
CREATE TABLE "Passkey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "credentialId" TEXT NOT NULL,
    "publicKey" BLOB NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,
    "transports" TEXT,
    "deviceType" TEXT,
    "backedUp" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Passkey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Passkey_credentialId_key" ON "Passkey"("credentialId");
