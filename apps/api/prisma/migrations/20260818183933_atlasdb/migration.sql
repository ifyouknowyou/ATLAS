/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `ConnectorIngestion` table. All the data in the column will be lost.
  - The primary key for the `DistributedLock` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `updatedAt` on the `GraphAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `IntelligenceBriefing` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `IntelligenceFinding` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `IntelligenceFinding` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `IntelligenceQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `IntelligenceQuestion` table. All the data in the column will be lost.
  - The `priority` column on the `IntelligenceQuestion` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `createdAt` on the `IntelligenceRule` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `IntelligenceRule` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `IntelligenceWorkflow` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `IntelligenceWorkflow` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Watchlist` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Watchlist` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[key]` on the table `DistributedLock` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organizationId,name]` on the table `IntelligenceWorkflow` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[runId,stepIndex]` on the table `WorkflowApproval` will be added. If there are existing duplicate values, this will fail.
  - Made the column `errors` on table `ConnectorIngestion` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `connectorType` on the `DataSource` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - The required column `id` was added to the `DistributedLock` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `updatedAt` to the `DistributedLock` table without a default value. This is not possible if the table is not empty.
  - Made the column `sources` on table `Watchlist` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Alert" DROP CONSTRAINT "fk_alert_org";

-- DropForeignKey
ALTER TABLE "AnalyticsSnapshot" DROP CONSTRAINT "fk_snapshot_org";

-- DropForeignKey
ALTER TABLE "Anomaly" DROP CONSTRAINT "fk_anomaly_org";

-- DropForeignKey
ALTER TABLE "ConnectorIngestion" DROP CONSTRAINT "fk_ingestion_org";

-- DropForeignKey
ALTER TABLE "DataSource" DROP CONSTRAINT "fk_datasource_org";

-- DropForeignKey
ALTER TABLE "DataSource" DROP CONSTRAINT "fk_datasource_user";

-- DropForeignKey
ALTER TABLE "EntityMatchCandidate" DROP CONSTRAINT "fk_match_org";

-- DropForeignKey
ALTER TABLE "GraphAnalysis" DROP CONSTRAINT "fk_graphanalysis_org";

-- DropForeignKey
ALTER TABLE "GraphAnalysis" DROP CONSTRAINT "fk_graphanalysis_user";

-- DropForeignKey
ALTER TABLE "IntelligenceBriefing" DROP CONSTRAINT "fk_briefing_org";

-- DropForeignKey
ALTER TABLE "IntelligenceBriefing" DROP CONSTRAINT "fk_briefing_user";

-- DropForeignKey
ALTER TABLE "IntelligenceFinding" DROP CONSTRAINT "fk_finding_org";

-- DropForeignKey
ALTER TABLE "IntelligenceFinding" DROP CONSTRAINT "fk_finding_user";

-- DropForeignKey
ALTER TABLE "IntelligenceQuestion" DROP CONSTRAINT "fk_question_org";

-- DropForeignKey
ALTER TABLE "IntelligenceQuestion" DROP CONSTRAINT "fk_question_user";

-- DropForeignKey
ALTER TABLE "IntelligenceRule" DROP CONSTRAINT "fk_rule_org";

-- DropForeignKey
ALTER TABLE "IntelligenceRule" DROP CONSTRAINT "fk_rule_user";

-- DropForeignKey
ALTER TABLE "IntelligenceWorkflow" DROP CONSTRAINT "fk_workflow_org";

-- DropForeignKey
ALTER TABLE "IntelligenceWorkflow" DROP CONSTRAINT "fk_workflow_user";

-- DropForeignKey
ALTER TABLE "Watchlist" DROP CONSTRAINT "fk_watchlist_org";

-- DropForeignKey
ALTER TABLE "Watchlist" DROP CONSTRAINT "fk_watchlist_user";

-- DropForeignKey
ALTER TABLE "WorkflowRun" DROP CONSTRAINT "fk_workflowrun_org";

-- DropForeignKey
ALTER TABLE "WorkflowRun" DROP CONSTRAINT "fk_workflowrun_workflow";

-- DropIndex
DROP INDEX "ix_anomaly_inv";

-- DropIndex
DROP INDEX "ux_question_run";

-- AlterTable
ALTER TABLE "Alert" RENAME CONSTRAINT "pk_alert" TO "Alert_pkey";
ALTER TABLE "Alert" ALTER COLUMN "acknowledgedAt" SET DATA TYPE TIMESTAMP(3);
ALTER TABLE "Alert" ALTER COLUMN "resolvedAt" SET DATA TYPE TIMESTAMP(3);
ALTER TABLE "Alert" ALTER COLUMN "dismissedAt" SET DATA TYPE TIMESTAMP(3);
ALTER TABLE "Alert" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);
ALTER TABLE "Alert" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "Alert" ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "AnalyticsSnapshot" RENAME CONSTRAINT "pk_analyticssnapshot" TO "AnalyticsSnapshot_pkey";
ALTER TABLE "AnalyticsSnapshot" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Anomaly" RENAME CONSTRAINT "pk_anomaly" TO "Anomaly_pkey";
ALTER TABLE "Anomaly" ADD COLUMN     "reviewedAt" TIMESTAMP(3);
ALTER TABLE "Anomaly" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);
ALTER TABLE "Anomaly" ALTER COLUMN "resolvedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ConnectorIngestion" RENAME CONSTRAINT "pk_connectoringestion" TO "ConnectorIngestion_pkey";
ALTER TABLE "ConnectorIngestion" DROP COLUMN "updatedAt";
ALTER TABLE "ConnectorIngestion" ALTER COLUMN "errors" SET NOT NULL;
ALTER TABLE "ConnectorIngestion" ALTER COLUMN "startedAt" SET DATA TYPE TIMESTAMP(3);
ALTER TABLE "ConnectorIngestion" ALTER COLUMN "completedAt" SET DATA TYPE TIMESTAMP(3);
ALTER TABLE "ConnectorIngestion" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "DataSource" RENAME CONSTRAINT "pk_datasource" TO "DataSource_pkey";
ALTER TABLE "DataSource" DROP COLUMN "connectorType";
ALTER TABLE "DataSource" ADD COLUMN     "connectorType" TEXT NOT NULL;
ALTER TABLE "DataSource" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);
ALTER TABLE "DataSource" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "DataSource" ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "DistributedLock" DROP CONSTRAINT "DistributedLock_pkey";
ALTER TABLE "DistributedLock" ADD COLUMN     "id" TEXT NOT NULL;
ALTER TABLE "DistributedLock" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
ALTER TABLE "DistributedLock" ALTER COLUMN "expiresAt" SET DATA TYPE TIMESTAMP(3);
ALTER TABLE "DistributedLock" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);
ALTER TABLE "DistributedLock" ADD CONSTRAINT "DistributedLock_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "EntityMatchCandidate" RENAME CONSTRAINT "pk_entitymatch" TO "EntityMatchCandidate_pkey";
ALTER TABLE "EntityMatchCandidate" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);
ALTER TABLE "EntityMatchCandidate" ALTER COLUMN "reviewStartedAt" SET DATA TYPE TIMESTAMP(3);
ALTER TABLE "EntityMatchCandidate" ALTER COLUMN "completedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "GraphAnalysis" RENAME CONSTRAINT "pk_graphanalysis" TO "GraphAnalysis_pkey";
ALTER TABLE "GraphAnalysis" DROP COLUMN "updatedAt";
ALTER TABLE "GraphAnalysis" ALTER COLUMN "startedAt" SET DATA TYPE TIMESTAMP(3);
ALTER TABLE "GraphAnalysis" ALTER COLUMN "completedAt" SET DATA TYPE TIMESTAMP(3);
ALTER TABLE "GraphAnalysis" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "IngestionRecord" RENAME CONSTRAINT "pk_ingestionrecord" TO "IngestionRecord_pkey";
ALTER TABLE "IngestionRecord" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "IntelligenceBriefing" RENAME CONSTRAINT "pk_intelbriefing" TO "IntelligenceBriefing_pkey";
ALTER TABLE "IntelligenceBriefing" DROP COLUMN "updatedAt";
ALTER TABLE "IntelligenceBriefing" ALTER COLUMN "generatedAt" SET DATA TYPE TIMESTAMP(3);
ALTER TABLE "IntelligenceBriefing" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "IntelligenceFinding" RENAME CONSTRAINT "pk_intelfinding" TO "IntelligenceFinding_pkey";
ALTER TABLE "IntelligenceFinding" DROP COLUMN "createdAt";
ALTER TABLE "IntelligenceFinding" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "IntelligenceQuestion" RENAME CONSTRAINT "pk_intelquestion" TO "IntelligenceQuestion_pkey";
ALTER TABLE "IntelligenceQuestion" DROP COLUMN "createdAt";
ALTER TABLE "IntelligenceQuestion" DROP COLUMN "updatedAt";
ALTER TABLE "IntelligenceQuestion" DROP COLUMN "priority";
ALTER TABLE "IntelligenceQuestion" ADD COLUMN "priority" "InvestigationPriority" NOT NULL DEFAULT 'MEDIUM';

-- AlterTable
ALTER TABLE "IntelligenceRule" RENAME CONSTRAINT "pk_intelrule" TO "IntelligenceRule_pkey";
ALTER TABLE "IntelligenceRule" DROP COLUMN "createdAt";
ALTER TABLE "IntelligenceRule" DROP COLUMN "updatedAt";
ALTER TABLE "IntelligenceRule" ALTER COLUMN "lastTriggeredAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "IntelligenceWorkflow" RENAME CONSTRAINT "pk_workflow" TO "IntelligenceWorkflow_pkey";
ALTER TABLE "IntelligenceWorkflow" DROP COLUMN "createdAt";
ALTER TABLE "IntelligenceWorkflow" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Watchlist" RENAME CONSTRAINT "pk_watchlist" TO "Watchlist_pkey";
ALTER TABLE "Watchlist" DROP COLUMN "createdAt";
ALTER TABLE "Watchlist" DROP COLUMN "updatedAt";
ALTER TABLE "Watchlist" ALTER COLUMN "sources" SET NOT NULL;

-- AlterTable
ALTER TABLE "WatchlistItem" RENAME CONSTRAINT "pk_watchlistitem" TO "WatchlistItem_pkey";
ALTER TABLE "WatchlistItem" ALTER COLUMN "expiresAt" SET DATA TYPE TIMESTAMP(3);
ALTER TABLE "WatchlistItem" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);
ALTER TABLE "WatchlistItem" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "WatchlistItem" ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "WorkflowApproval" RENAME CONSTRAINT "pk_workflowapproval" TO "WorkflowApproval_pkey";
ALTER TABLE "WorkflowApproval" ALTER COLUMN "expiresAt" SET DATA TYPE TIMESTAMP(3);
ALTER TABLE "WorkflowApproval" ALTER COLUMN "approvedAt" SET DATA TYPE TIMESTAMP(3);
ALTER TABLE "WorkflowApproval" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "WorkflowRun" RENAME CONSTRAINT "pk_workflowrun" TO "WorkflowRun_pkey";
ALTER TABLE "WorkflowRun" ALTER COLUMN "context" DROP DEFAULT;
ALTER TABLE "WorkflowRun" ALTER COLUMN "startedAt" SET DATA TYPE TIMESTAMP(3);
ALTER TABLE "WorkflowRun" ALTER COLUMN "completedAt" SET DATA TYPE TIMESTAMP(3);
ALTER TABLE "WorkflowRun" ALTER COLUMN "failedAt" SET DATA TYPE TIMESTAMP(3);
ALTER TABLE "WorkflowRun" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);
ALTER TABLE "WorkflowRun" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "WorkflowRun" ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "WorkflowRunStep" RENAME CONSTRAINT "pk_workflowrunstep" TO "WorkflowRunStep_pkey";
ALTER TABLE "WorkflowRunStep" ALTER COLUMN "executedAt" SET DATA TYPE TIMESTAMP(3);
ALTER TABLE "WorkflowRunStep" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);
ALTER TABLE "WorkflowRunStep" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "WorkflowRunStep" ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIOrchestrationSchedule" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "investigationId" TEXT,
    "name" TEXT NOT NULL,
    "scheduleCron" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "tools" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,

    CONSTRAINT "AIOrchestrationSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_createdAt_idx" ON "AuditLog"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "AIOrchestrationSchedule_organizationId_isActive_nextRunAt_idx" ON "AIOrchestrationSchedule"("organizationId", "isActive", "nextRunAt");

-- CreateIndex
CREATE INDEX "Alert_assignedToId_status_idx" ON "Alert"("assignedToId", "status");

-- CreateIndex
CREATE INDEX "Anomaly_investigationId_severity_idx" ON "Anomaly"("investigationId", "severity");

-- CreateIndex
CREATE INDEX "Anomaly_status_createdAt_idx" ON "Anomaly"("status", "createdAt");

-- CreateIndex
CREATE INDEX "DataSource_organizationId_createdAt_idx" ON "DataSource"("organizationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DistributedLock_key_key" ON "DistributedLock"("key");

-- CreateIndex
CREATE INDEX "DistributedLock_key_idx" ON "DistributedLock"("key");

-- CreateIndex
CREATE INDEX "EntityMatchCandidate_baseEntityId_idx" ON "EntityMatchCandidate"("baseEntityId");

-- CreateIndex
CREATE INDEX "EntityMatchCandidate_matchEntityId_idx" ON "EntityMatchCandidate"("matchEntityId");

-- CreateIndex
CREATE INDEX "IngestionRecord_matchedEntityId_idx" ON "IngestionRecord"("matchedEntityId");

-- CreateIndex
CREATE INDEX "IntelligenceBriefing_organizationId_status_createdAt_idx" ON "IntelligenceBriefing"("organizationId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "IntelligenceBriefing_investigationId_createdAt_idx" ON "IntelligenceBriefing"("investigationId", "createdAt");

-- CreateIndex
CREATE INDEX "IntelligenceFinding_investigationId_idx" ON "IntelligenceFinding"("investigationId");

-- CreateIndex
CREATE INDEX "IntelligenceQuestion_investigationId_idx" ON "IntelligenceQuestion"("investigationId");

-- CreateIndex
CREATE INDEX "IntelligenceRule_organizationId_isActive_idx" ON "IntelligenceRule"("organizationId", "isActive");

-- CreateIndex
CREATE INDEX "IntelligenceWorkflow_organizationId_isActive_idx" ON "IntelligenceWorkflow"("organizationId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "IntelligenceWorkflow_organizationId_name_key" ON "IntelligenceWorkflow"("organizationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowApproval_runId_stepIndex_key" ON "WorkflowApproval"("runId", "stepIndex");

-- AddForeignKey
ALTER TABLE "GraphAnalysis" ADD CONSTRAINT "GraphAnalysis_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraphAnalysis" ADD CONSTRAINT "GraphAnalysis_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraphAnalysis" ADD CONSTRAINT "GraphAnalysis_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityMatchCandidate" ADD CONSTRAINT "EntityMatchCandidate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityMatchCandidate" ADD CONSTRAINT "EntityMatchCandidate_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anomaly" ADD CONSTRAINT "Anomaly_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anomaly" ADD CONSTRAINT "Anomaly_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anomaly" ADD CONSTRAINT "Anomaly_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntelligenceRule" ADD CONSTRAINT "IntelligenceRule_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntelligenceRule" ADD CONSTRAINT "IntelligenceRule_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntelligenceWorkflow" ADD CONSTRAINT "IntelligenceWorkflow_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntelligenceWorkflow" ADD CONSTRAINT "IntelligenceWorkflow_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowRun" ADD CONSTRAINT "WorkflowRun_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowRun" ADD CONSTRAINT "WorkflowRun_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "IntelligenceWorkflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowRun" ADD CONSTRAINT "WorkflowRun_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowRunStep" ADD CONSTRAINT "WorkflowRunStep_runId_fkey" FOREIGN KEY ("runId") REFERENCES "WorkflowRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowApproval" ADD CONSTRAINT "WorkflowApproval_runId_fkey" FOREIGN KEY ("runId") REFERENCES "WorkflowRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchlistItem" ADD CONSTRAINT "WatchlistItem_watchlistId_fkey" FOREIGN KEY ("watchlistId") REFERENCES "Watchlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataSource" ADD CONSTRAINT "DataSource_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataSource" ADD CONSTRAINT "DataSource_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectorIngestion" ADD CONSTRAINT "ConnectorIngestion_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngestionRecord" ADD CONSTRAINT "IngestionRecord_ingestionId_fkey" FOREIGN KEY ("ingestionId") REFERENCES "ConnectorIngestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntelligenceBriefing" ADD CONSTRAINT "IntelligenceBriefing_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntelligenceBriefing" ADD CONSTRAINT "IntelligenceBriefing_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntelligenceQuestion" ADD CONSTRAINT "IntelligenceQuestion_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntelligenceQuestion" ADD CONSTRAINT "IntelligenceQuestion_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntelligenceFinding" ADD CONSTRAINT "IntelligenceFinding_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntelligenceFinding" ADD CONSTRAINT "IntelligenceFinding_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntelligenceFinding" ADD CONSTRAINT "IntelligenceFinding_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "IntelligenceQuestion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsSnapshot" ADD CONSTRAINT "AnalyticsSnapshot_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsSnapshot" ADD CONSTRAINT "AnalyticsSnapshot_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIOrchestrationSchedule" ADD CONSTRAINT "AIOrchestrationSchedule_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIOrchestrationSchedule" ADD CONSTRAINT "AIOrchestrationSchedule_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "ix_alert_inv" RENAME TO "Alert_investigationId_status_idx";

-- RenameIndex
ALTER INDEX "ix_alert_org" RENAME TO "Alert_organizationId_status_severity_createdAt_idx";

-- RenameIndex
ALTER INDEX "ix_analytics_snapshot" RENAME TO "AnalyticsSnapshot_organizationId_investigationId_label_crea_idx";

-- RenameIndex
ALTER INDEX "ix_anomaly_org_status" RENAME TO "Anomaly_organizationId_status_severity_idx";

-- RenameIndex
ALTER INDEX "ix_ingestion_datasource" RENAME TO "ConnectorIngestion_dataSourceId_createdAt_idx";

-- RenameIndex
ALTER INDEX "ix_ingestion_org" RENAME TO "ConnectorIngestion_organizationId_status_createdAt_idx";

-- RenameIndex
ALTER INDEX "ix_datasource_org" RENAME TO "DataSource_organizationId_isActive_idx";

-- RenameIndex
ALTER INDEX "DistributedLock_expiresAt" RENAME TO "DistributedLock_expiresAt_idx";

-- RenameIndex
ALTER INDEX "ix_match_org_status" RENAME TO "EntityMatchCandidate_organizationId_status_idx";

-- RenameIndex
ALTER INDEX "ux_match_candidate" RENAME TO "EntityMatchCandidate_organizationId_baseEntityId_matchEntit_key";

-- RenameIndex
ALTER INDEX "ix_graphanalysis_inv" RENAME TO "GraphAnalysis_investigationId_idx";

-- RenameIndex
ALTER INDEX "ix_graphanalysis_org" RENAME TO "GraphAnalysis_organizationId_analysisType_createdAt_idx";

-- RenameIndex
ALTER INDEX "ix_graphanalysis_status" RENAME TO "GraphAnalysis_status_createdAt_idx";

-- RenameIndex
ALTER INDEX "ix_ingestionrecord_ing" RENAME TO "IngestionRecord_ingestionId_status_idx";

-- RenameIndex
ALTER INDEX "ix_intelfinding_org" RENAME TO "IntelligenceFinding_organizationId_status_idx";

-- RenameIndex
ALTER INDEX "ix_intelquestion_org" RENAME TO "IntelligenceQuestion_organizationId_status_idx";

-- RenameIndex
ALTER INDEX "ux_intelrule_org_name" RENAME TO "IntelligenceRule_organizationId_name_key";

-- RenameIndex
ALTER INDEX "ix_watchlist_org" RENAME TO "Watchlist_organizationId_isActive_idx";

-- RenameIndex
ALTER INDEX "ux_watchlist_org_name" RENAME TO "Watchlist_organizationId_name_key";

-- RenameIndex
ALTER INDEX "ix_watchlistitem_list" RENAME TO "WatchlistItem_watchlistId_targetType_idx";

-- RenameIndex
ALTER INDEX "ux_watchlistitem" RENAME TO "WatchlistItem_watchlistId_targetType_targetId_key";

-- RenameIndex
ALTER INDEX "ix_approval_status" RENAME TO "WorkflowApproval_status_expiresAt_idx";

-- RenameIndex
ALTER INDEX "ix_workflowrun_org" RENAME TO "WorkflowRun_organizationId_status_createdAt_idx";

-- RenameIndex
ALTER INDEX "ix_workflowrun_workflow" RENAME TO "WorkflowRun_workflowId_createdAt_idx";

-- RenameIndex
ALTER INDEX "ix_workflowrunstep_run" RENAME TO "WorkflowRunStep_runId_idx";

-- RenameIndex
ALTER INDEX "ux_workflowrunstep" RENAME TO "WorkflowRunStep_runId_stepIndex_key";
