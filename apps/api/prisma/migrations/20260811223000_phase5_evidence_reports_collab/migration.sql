-- CreateEnum
CREATE TYPE "EvidenceProcessingStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'PARTIAL', 'FAILED');

-- CreateEnum
CREATE TYPE "BackgroundJobStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EvidenceAnnotationType" AS ENUM ('HIGHLIGHT', 'COMMENT', 'TAG', 'REGION', 'BOOKMARK');

-- CreateEnum
CREATE TYPE "CommentTargetType" AS ENUM ('INVESTIGATION', 'ENTITY', 'EVIDENCE', 'TIMELINE_EVENT', 'REPORT', 'REPORT_BLOCK', 'NOTE', 'RELATIONSHIP');

-- CreateEnum
CREATE TYPE "EvidenceLinkTargetType" AS ENUM ('INVESTIGATION', 'ENTITY', 'RELATIONSHIP', 'TIMELINE_EVENT', 'NOTE', 'REPORT');

-- CreateEnum
CREATE TYPE "ReportBlockType" AS ENUM ('TEXT', 'HEADING', 'IMAGE', 'TABLE', 'ENTITY', 'RELATIONSHIP', 'EVIDENCE', 'TIMELINE', 'MAP', 'GRAPH', 'AI_SUMMARY', 'CITATION_LIST', 'CALLOUT', 'PAGE_BREAK');

-- CreateEnum
CREATE TYPE "ReportTemplateKind" AS ENUM ('INVESTIGATION_REPORT', 'EXECUTIVE_INTELLIGENCE_BRIEF', 'EVIDENCE_SUMMARY', 'ENTITY_PROFILE', 'INCIDENT_ANALYSIS', 'RESEARCH_SUMMARY');

-- CreateEnum
CREATE TYPE "ReportReviewDecision" AS ENUM ('APPROVE', 'REJECT', 'REQUEST_CHANGES');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ReportStatus" ADD VALUE 'IN_REVIEW';
ALTER TYPE "ReportStatus" ADD VALUE 'CHANGES_REQUESTED';
ALTER TYPE "ReportStatus" ADD VALUE 'APPROVED';
ALTER TYPE "ReportStatus" ADD VALUE 'ARCHIVED';

-- AlterTable
ALTER TABLE "Evidence" ADD COLUMN     "originalFilename" TEXT,
ADD COLUMN     "processingStatus" "EvidenceProcessingStatus",
ADD COLUMN     "storageKey" TEXT,
ADD COLUMN     "verifiedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "aiStatus" TEXT,
ADD COLUMN     "classification" "Classification" NOT NULL DEFAULT 'INTERNAL',
ADD COLUMN     "currentVersion" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "templateId" TEXT,
ADD COLUMN     "templateKind" "ReportTemplateKind",
ADD COLUMN     "workspaceId" TEXT;

-- CreateTable
CREATE TABLE "EvidenceVersion" (
    "id" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "hash" VARCHAR(64) NOT NULL,
    "size" INTEGER,
    "mimeType" TEXT,
    "originalFilename" TEXT,
    "changeType" TEXT NOT NULL,
    "changeSummary" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvidenceVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceAccessEvent" (
    "id" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,
    "versionId" TEXT,
    "action" TEXT NOT NULL,
    "actorType" TEXT NOT NULL,
    "actorId" TEXT,
    "organizationId" TEXT NOT NULL,
    "safeMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvidenceAccessEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceAnnotation" (
    "id" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,
    "versionId" TEXT,
    "type" "EvidenceAnnotationType" NOT NULL,
    "authorId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "target" JSONB,
    "content" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvidenceAnnotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceProcessingJob" (
    "id" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "status" "EvidenceProcessingStatus" NOT NULL DEFAULT 'QUEUED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "payload" JSONB,
    "result" JSONB,
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvidenceProcessingJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceLink" (
    "id" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,
    "targetType" "EvidenceLinkTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "linkType" TEXT NOT NULL DEFAULT 'REFERS_TO',
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvidenceLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BackgroundJob" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "status" "BackgroundJobStatus" NOT NULL DEFAULT 'QUEUED',
    "payload" JSONB,
    "result" JSONB,
    "dedupeKey" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "lockToken" TEXT,
    "organizationId" TEXT NOT NULL,
    "investigationId" TEXT,
    "createdById" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BackgroundJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "ReportTemplateKind" NOT NULL,
    "description" TEXT,
    "sections" JSONB NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportVersion" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "title" TEXT,
    "summary" TEXT,
    "sections" JSONB,
    "changeSummary" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportSection" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "collapsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportBlock" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "type" "ReportBlockType" NOT NULL,
    "position" INTEGER NOT NULL,
    "content" JSONB,
    "dataRef" JSONB,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "aiStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportCitation" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "sectionId" TEXT,
    "blockId" TEXT,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "sourceRef" TEXT,
    "snippet" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportCitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportReview" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "decision" "ReportReviewDecision" NOT NULL,
    "comment" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportApproval" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "reportVersionId" TEXT,
    "approverId" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "investigationId" TEXT,
    "targetType" "CommentTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentReply" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "parentId" TEXT,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommentReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mention" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mentionedById" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "investigationId" TEXT,
    "commentId" TEXT,
    "replyId" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "targetType" TEXT,
    "targetId" TEXT,
    "investigationId" TEXT,
    "actorId" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresenceSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "sessionKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PresenceSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollaborationEvent" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "investigationId" TEXT,
    "type" TEXT NOT NULL,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "actorId" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollaborationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EvidenceVersion_evidenceId_idx" ON "EvidenceVersion"("evidenceId");

-- CreateIndex
CREATE INDEX "EvidenceVersion_organizationId_idx" ON "EvidenceVersion"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "EvidenceVersion_evidenceId_versionNumber_key" ON "EvidenceVersion"("evidenceId", "versionNumber");

-- CreateIndex
CREATE INDEX "EvidenceAccessEvent_evidenceId_createdAt_idx" ON "EvidenceAccessEvent"("evidenceId", "createdAt");

-- CreateIndex
CREATE INDEX "EvidenceAccessEvent_actorId_createdAt_idx" ON "EvidenceAccessEvent"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "EvidenceAccessEvent_organizationId_idx" ON "EvidenceAccessEvent"("organizationId");

-- CreateIndex
CREATE INDEX "EvidenceAnnotation_evidenceId_createdAt_idx" ON "EvidenceAnnotation"("evidenceId", "createdAt");

-- CreateIndex
CREATE INDEX "EvidenceAnnotation_authorId_idx" ON "EvidenceAnnotation"("authorId");

-- CreateIndex
CREATE INDEX "EvidenceAnnotation_organizationId_idx" ON "EvidenceAnnotation"("organizationId");

-- CreateIndex
CREATE INDEX "EvidenceProcessingJob_status_updatedAt_idx" ON "EvidenceProcessingJob"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "EvidenceProcessingJob_organizationId_idx" ON "EvidenceProcessingJob"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "EvidenceProcessingJob_evidenceId_kind_key" ON "EvidenceProcessingJob"("evidenceId", "kind");

-- CreateIndex
CREATE INDEX "EvidenceLink_targetType_targetId_idx" ON "EvidenceLink"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "EvidenceLink_organizationId_idx" ON "EvidenceLink"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "EvidenceLink_evidenceId_targetType_targetId_key" ON "EvidenceLink"("evidenceId", "targetType", "targetId");

-- CreateIndex
CREATE INDEX "BackgroundJob_status_scheduledAt_idx" ON "BackgroundJob"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "BackgroundJob_organizationId_idx" ON "BackgroundJob"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "BackgroundJob_kind_dedupeKey_key" ON "BackgroundJob"("kind", "dedupeKey");

-- CreateIndex
CREATE INDEX "ReportTemplate_organizationId_kind_idx" ON "ReportTemplate"("organizationId", "kind");

-- CreateIndex
CREATE INDEX "ReportVersion_reportId_idx" ON "ReportVersion"("reportId");

-- CreateIndex
CREATE INDEX "ReportVersion_organizationId_idx" ON "ReportVersion"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ReportVersion_reportId_versionNumber_key" ON "ReportVersion"("reportId", "versionNumber");

-- CreateIndex
CREATE INDEX "ReportSection_reportId_position_idx" ON "ReportSection"("reportId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "ReportSection_reportId_key_key" ON "ReportSection"("reportId", "key");

-- CreateIndex
CREATE INDEX "ReportBlock_sectionId_position_idx" ON "ReportBlock"("sectionId", "position");

-- CreateIndex
CREATE INDEX "ReportCitation_reportId_idx" ON "ReportCitation"("reportId");

-- CreateIndex
CREATE INDEX "ReportCitation_blockId_idx" ON "ReportCitation"("blockId");

-- CreateIndex
CREATE INDEX "ReportCitation_targetType_targetId_idx" ON "ReportCitation"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "ReportCitation_organizationId_idx" ON "ReportCitation"("organizationId");

-- CreateIndex
CREATE INDEX "ReportReview_reportId_createdAt_idx" ON "ReportReview"("reportId", "createdAt");

-- CreateIndex
CREATE INDEX "ReportApproval_reportId_createdAt_idx" ON "ReportApproval"("reportId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_targetType_targetId_createdAt_idx" ON "Comment"("targetType", "targetId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_investigationId_createdAt_idx" ON "Comment"("investigationId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_organizationId_idx" ON "Comment"("organizationId");

-- CreateIndex
CREATE INDEX "CommentReply_commentId_createdAt_idx" ON "CommentReply"("commentId", "createdAt");

-- CreateIndex
CREATE INDEX "CommentReply_organizationId_idx" ON "CommentReply"("organizationId");

-- CreateIndex
CREATE INDEX "Mention_userId_readAt_idx" ON "Mention"("userId", "readAt");

-- CreateIndex
CREATE INDEX "Mention_organizationId_idx" ON "Mention"("organizationId");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_createdAt_idx" ON "Notification"("userId", "readAt", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_organizationId_createdAt_idx" ON "Notification"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "PresenceSession_resourceId_lastSeenAt_idx" ON "PresenceSession"("resourceId", "lastSeenAt");

-- CreateIndex
CREATE INDEX "PresenceSession_organizationId_idx" ON "PresenceSession"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "PresenceSession_resourceType_resourceId_sessionKey_key" ON "PresenceSession"("resourceType", "resourceId", "sessionKey");

-- CreateIndex
CREATE INDEX "CollaborationEvent_investigationId_createdAt_idx" ON "CollaborationEvent"("investigationId", "createdAt");

-- CreateIndex
CREATE INDEX "CollaborationEvent_organizationId_createdAt_idx" ON "CollaborationEvent"("organizationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Evidence_storageKey_key" ON "Evidence"("storageKey");

-- CreateIndex
CREATE INDEX "Evidence_organizationId_classification_status_idx" ON "Evidence"("organizationId", "classification", "status");

-- CreateIndex
CREATE INDEX "Evidence_organizationId_title_idx" ON "Evidence"("organizationId", "title");

-- CreateIndex
CREATE INDEX "Report_organizationId_status_createdAt_idx" ON "Report"("organizationId", "status", "createdAt");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ReportTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceVersion" ADD CONSTRAINT "EvidenceVersion_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceVersion" ADD CONSTRAINT "EvidenceVersion_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceVersion" ADD CONSTRAINT "EvidenceVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceAccessEvent" ADD CONSTRAINT "EvidenceAccessEvent_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceAccessEvent" ADD CONSTRAINT "EvidenceAccessEvent_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "EvidenceVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceAccessEvent" ADD CONSTRAINT "EvidenceAccessEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceAccessEvent" ADD CONSTRAINT "EvidenceAccessEvent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceAnnotation" ADD CONSTRAINT "EvidenceAnnotation_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceAnnotation" ADD CONSTRAINT "EvidenceAnnotation_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "EvidenceVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceAnnotation" ADD CONSTRAINT "EvidenceAnnotation_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceAnnotation" ADD CONSTRAINT "EvidenceAnnotation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceProcessingJob" ADD CONSTRAINT "EvidenceProcessingJob_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceProcessingJob" ADD CONSTRAINT "EvidenceProcessingJob_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceProcessingJob" ADD CONSTRAINT "EvidenceProcessingJob_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceLink" ADD CONSTRAINT "EvidenceLink_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceLink" ADD CONSTRAINT "EvidenceLink_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceLink" ADD CONSTRAINT "EvidenceLink_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BackgroundJob" ADD CONSTRAINT "BackgroundJob_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BackgroundJob" ADD CONSTRAINT "BackgroundJob_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BackgroundJob" ADD CONSTRAINT "BackgroundJob_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportTemplate" ADD CONSTRAINT "ReportTemplate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportTemplate" ADD CONSTRAINT "ReportTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportVersion" ADD CONSTRAINT "ReportVersion_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportVersion" ADD CONSTRAINT "ReportVersion_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportVersion" ADD CONSTRAINT "ReportVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportSection" ADD CONSTRAINT "ReportSection_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportBlock" ADD CONSTRAINT "ReportBlock_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "ReportSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportCitation" ADD CONSTRAINT "ReportCitation_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportCitation" ADD CONSTRAINT "ReportCitation_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "ReportSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportCitation" ADD CONSTRAINT "ReportCitation_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "ReportBlock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportCitation" ADD CONSTRAINT "ReportCitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportCitation" ADD CONSTRAINT "ReportCitation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportReview" ADD CONSTRAINT "ReportReview_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportReview" ADD CONSTRAINT "ReportReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportApproval" ADD CONSTRAINT "ReportApproval_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportApproval" ADD CONSTRAINT "ReportApproval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentReply" ADD CONSTRAINT "CommentReply_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentReply" ADD CONSTRAINT "CommentReply_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "CommentReply"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentReply" ADD CONSTRAINT "CommentReply_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentReply" ADD CONSTRAINT "CommentReply_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mention" ADD CONSTRAINT "Mention_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mention" ADD CONSTRAINT "Mention_mentionedById_fkey" FOREIGN KEY ("mentionedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mention" ADD CONSTRAINT "Mention_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mention" ADD CONSTRAINT "Mention_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mention" ADD CONSTRAINT "Mention_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mention" ADD CONSTRAINT "Mention_replyId_fkey" FOREIGN KEY ("replyId") REFERENCES "CommentReply"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresenceSession" ADD CONSTRAINT "PresenceSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresenceSession" ADD CONSTRAINT "PresenceSession_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaborationEvent" ADD CONSTRAINT "CollaborationEvent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaborationEvent" ADD CONSTRAINT "CollaborationEvent_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaborationEvent" ADD CONSTRAINT "CollaborationEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

