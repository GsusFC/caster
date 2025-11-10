-- Create enums
CREATE TYPE "CastStatus" AS ENUM ('PENDING', 'PUBLISHED', 'FAILED', 'CANCELLED');
CREATE TYPE "CastPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH');

-- Create User table
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "fid" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT,
    "pfpUrl" TEXT,
    "signerUuid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Create CastThread table
CREATE TABLE "CastThread" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "CastStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledTime" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CastThread_pkey" PRIMARY KEY ("id")
);

-- Create ScheduledCast table
CREATE TABLE "ScheduledCast" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mediaUrls" TEXT[],
    "channelKey" TEXT,
    "scheduledTime" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "status" "CastStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "CastPriority" NOT NULL DEFAULT 'NORMAL',
    "castHash" TEXT,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "threadId" TEXT,
    "threadOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledCast_pkey" PRIMARY KEY ("id")
);

-- Create unique constraints
CREATE UNIQUE INDEX "User_fid_key" ON "User"("fid");
CREATE UNIQUE INDEX "User_signerUuid_key" ON "User"("signerUuid");

-- Create indexes
CREATE INDEX "User_fid_idx" ON "User"("fid");
CREATE INDEX "User_signerUuid_idx" ON "User"("signerUuid");
CREATE INDEX "CastThread_userId_idx" ON "CastThread"("userId");
CREATE INDEX "CastThread_status_scheduledTime_idx" ON "CastThread"("status", "scheduledTime");
CREATE INDEX "ScheduledCast_userId_idx" ON "ScheduledCast"("userId");
CREATE INDEX "ScheduledCast_status_scheduledTime_idx" ON "ScheduledCast"("status", "scheduledTime");
CREATE INDEX "ScheduledCast_threadId_idx" ON "ScheduledCast"("threadId");

-- Add foreign keys
ALTER TABLE "CastThread" ADD CONSTRAINT "CastThread_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ScheduledCast" ADD CONSTRAINT "ScheduledCast_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ScheduledCast" ADD CONSTRAINT "ScheduledCast_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "CastThread"("id") ON DELETE SET NULL ON UPDATE CASCADE;
