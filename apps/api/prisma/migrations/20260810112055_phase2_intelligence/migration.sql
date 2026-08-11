-- CreateEnum
CREATE TYPE "Classification" AS ENUM ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED');

-- CreateEnum
CREATE TYPE "EntityStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RelationshipType" AS ENUM ('ASSOCIATED_WITH', 'OWNS', 'WORKS_FOR', 'LOCATED_AT', 'USES', 'CONTROLS', 'CONNECTED_TO', 'MEMBER_OF', 'RELATED_TO', 'OBSERVED_WITH', 'CUSTOM');

-- CreateEnum
CREATE TYPE "RelationshipDirection" AS ENUM ('DIRECTED', 'UNDIRECTED');

-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM ('DOCUMENT', 'IMAGE', 'VIDEO', 'AUDIO', 'ARCHIVE', 'WEB_ARTIFACT', 'LOG', 'DATASET', 'OTHER');

-- CreateEnum
CREATE TYPE "EvidenceStatus" AS ENUM ('PENDING', 'AVAILABLE', 'ARCHIVED', 'RESTRICTED');

-- CreateEnum
CREATE TYPE "NoteVisibility" AS ENUM ('INVESTIGATION', 'PRIVATE');

-- CreateEnum
CREATE TYPE "InvestigationMemberRole" AS ENUM ('LEAD', 'ANALYST', 'CONTRIBUTOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE');

-- AlterEnum (map legacy Phase 1 statuses to Phase 2 values during the type swap.
-- The UPDATE-before-swap form is invalid because the old enum cannot hold the
-- new literals; value remapping belongs in the USING clause instead.)
BEGIN;
CREATE TYPE "InvestigationStatus_new" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED');
ALTER TABLE "public"."Investigation" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Investigation" ALTER COLUMN "status" TYPE "InvestigationStatus_new" USING (
  CASE "status"::text
    WHEN 'OPEN' THEN 'DRAFT'::"InvestigationStatus_new"
    WHEN 'IN_PROGRESS' THEN 'ACTIVE'::"InvestigationStatus_new"
    WHEN 'PENDING_REVIEW' THEN 'ACTIVE'::"InvestigationStatus_new"
    WHEN 'CLOSED' THEN 'COMPLETED'::"InvestigationStatus_new"
    ELSE 'ARCHIVED'::"InvestigationStatus_new"
  END
);
ALTER TYPE "InvestigationStatus" RENAME TO "InvestigationStatus_old";
ALTER TYPE "InvestigationStatus_new" RENAME TO "InvestigationStatus";
DROP TYPE "public"."InvestigationStatus_old";
ALTER TABLE "Investigation" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- DropIndex
DROP INDEX "Entity_organizationId_type_idx";

-- DropIndex
DROP INDEX "Evidence_organizationId_investigationId_idx";

-- DropIndex
DROP INDEX "Investigation_status_idx";

-- DropIndex
DROP INDEX "Note_organizationId_investigationId_idx";

-- DropIndex
DROP INDEX "Relationship_organizationId_idx";

-- AlterTable
ALTER TABLE "ActivityEvent" ADD COLUMN     "investigationId" TEXT;

-- AlterTable
ALTER TABLE "Entity" ADD COLUMN     "confidence" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Evidence" ADD COLUMN     "classification" "Classification" NOT NULL DEFAULT 'INTERNAL',
ADD COLUMN     "collectedAt" TIMESTAMP(3),
ADD COLUMN     "description" TEXT,
ADD COLUMN     "hash" TEXT,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "size" INTEGER,
ADD COLUMN     "source" TEXT,
ADD COLUMN     "status" "EvidenceStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "title" TEXT;
-- Convert EvidenceKind -> EvidenceType (lossless: relax to TEXT, remap, re-cast)
ALTER TABLE "Evidence" ALTER COLUMN "kind" TYPE TEXT USING ("kind"::text);
UPDATE "Evidence" SET "kind" = CASE
  WHEN "kind" IN ('DOCUMENT', 'ATTACHMENT') THEN 'DOCUMENT'
  WHEN "kind" = 'URL' THEN 'WEB_ARTIFACT'
  ELSE 'OTHER'
END;
ALTER TABLE "Evidence" ALTER COLUMN "kind" DROP DEFAULT;
ALTER TABLE "Evidence" ALTER COLUMN "kind" TYPE "EvidenceType" USING ("kind"::"EvidenceType");
ALTER TABLE "Evidence" ALTER COLUMN "kind" SET DEFAULT 'OTHER';

-- AlterTable
ALTER TABLE "Investigation" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "classification" "Classification" NOT NULL DEFAULT 'INTERNAL',
ADD COLUMN     "description" TEXT,
ADD COLUMN     "ownerId" TEXT,
ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "visibility" "NoteVisibility" NOT NULL DEFAULT 'INVESTIGATION';

-- AlterTable
ALTER TABLE "Relationship" ADD COLUMN     "confidence" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "direction" "RelationshipDirection" NOT NULL DEFAULT 'UNDIRECTED';
-- Convert RelationshipKind -> RelationshipType (lossless)
ALTER TABLE "Relationship" ALTER COLUMN "kind" TYPE TEXT USING ("kind"::text);
UPDATE "Relationship" SET "kind" = CASE
  WHEN "kind" = 'COMMUNICATES_WITH' THEN 'ASSOCIATED_WITH'
  WHEN "kind" = 'ATTRIBUTED_TO' THEN 'RELATED_TO'
  WHEN "kind" = 'LINKS_TO' THEN 'CONNECTED_TO'
  WHEN "kind" = 'FOUND_AT' THEN 'LOCATED_AT'
  ELSE "kind"
END;
ALTER TABLE "Relationship" ALTER COLUMN "kind" DROP DEFAULT;
ALTER TABLE "Relationship" ALTER COLUMN "kind" TYPE "RelationshipType" USING ("kind"::"RelationshipType");
ALTER TABLE "Relationship" ALTER COLUMN "kind" SET DEFAULT 'RELATED_TO';

-- DropEnum
DROP TYPE "EvidenceKind";

-- DropEnum
DROP TYPE "RelationshipKind";

-- CreateTable
CREATE TABLE "InvestigationMember" (
    "id" TEXT NOT NULL,
    "investigationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "InvestigationMemberRole" NOT NULL DEFAULT 'VIEWER',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestigationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "investigationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" "InvestigationPriority" NOT NULL DEFAULT 'MEDIUM',
    "assigneeId" TEXT,
    "createdById" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InvestigationMember_userId_idx" ON "InvestigationMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "InvestigationMember_investigationId_userId_key" ON "InvestigationMember"("investigationId", "userId");

-- CreateIndex
CREATE INDEX "Task_investigationId_status_idx" ON "Task"("investigationId", "status");

-- CreateIndex
CREATE INDEX "Task_assigneeId_idx" ON "Task"("assigneeId");

-- CreateIndex
CREATE INDEX "ActivityEvent_investigationId_createdAt_idx" ON "ActivityEvent"("investigationId", "createdAt");

-- CreateIndex
CREATE INDEX "Entity_organizationId_type_status_idx" ON "Entity"("organizationId", "type", "status");

-- CreateIndex
CREATE INDEX "Entity_name_idx" ON "Entity"("name");

-- CreateIndex
CREATE INDEX "Evidence_organizationId_kind_status_idx" ON "Evidence"("organizationId", "kind", "status");

-- CreateIndex
CREATE INDEX "Evidence_createdById_idx" ON "Evidence"("createdById");

-- CreateIndex
CREATE INDEX "Investigation_status_archivedAt_idx" ON "Investigation"("status", "archivedAt");

-- CreateIndex
CREATE INDEX "Investigation_title_idx" ON "Investigation"("title");

-- CreateIndex
CREATE INDEX "Note_organizationId_investigationId_visibility_idx" ON "Note"("organizationId", "investigationId", "visibility");

-- CreateIndex
CREATE INDEX "Relationship_organizationId_kind_idx" ON "Relationship"("organizationId", "kind");

-- AddForeignKey
ALTER TABLE "Investigation" ADD CONSTRAINT "Investigation_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestigationMember" ADD CONSTRAINT "InvestigationMember_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestigationMember" ADD CONSTRAINT "InvestigationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestigationMember" ADD CONSTRAINT "InvestigationMember_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityEvent" ADD CONSTRAINT "ActivityEvent_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

