-- Phase 7a: distributed locks for Phase 7 reliability
CREATE TABLE "DistributedLock" (
  "key" TEXT NOT NULL PRIMARY KEY,
  "owner" TEXT NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "DistributedLock_expiresAt" ON "DistributedLock" ("expiresAt");