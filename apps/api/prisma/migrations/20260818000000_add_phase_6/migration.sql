-- Phase 6 — Intelligence Analytics & Automation models

-- Enums
CREATE TYPE "GraphAnalysisType" AS ENUM (
  'CENTRALITY','COMMUNITY','PATH','CLUSTERING','CHANGE_DETECTION','TEMPORAL','GEOSPATIAL'
);

CREATE TYPE "GraphAnalysisStatus" AS ENUM (
  'QUEUED','RUNNING','COMPLETED','FAILED'
);

CREATE TYPE "EntityMatchStatus" AS ENUM (
  'PENDING','CONFIRMED_MERGE','REJECTED','IGNORED'
);

CREATE TYPE "AnomalyType" AS ENUM (
  'TEMPORAL_SPIKE','TEMPORAL_DROP','RELATIONSHIP_DENSITY','DEGREE_ANOMALY',
  'CLUSTERING_COEFFICIENT','PATTERN_DEVIATION','GEOSPATIAL_OUTLIER','ATTRIBUTE_DRIFT'
);

CREATE TYPE "AnomalySeverity" AS ENUM (
  'LOW','MEDIUM','HIGH','CRITICAL'
);

CREATE TYPE "AnomalyStatus" AS ENUM (
  'NEW','UNDER_REVIEW','CONFIRMED','FALSE_POSITIVE','RESOLVED'
);

CREATE TYPE "RuleConditionType" AS ENUM (
  'ENTITY_COUNT','RELATIONSHIP_COUNT','ANOMALY_DETECTED','EVIDENCE_UPLOADED',
  'ENTITY_CREATED','RELATIONSHIP_CREATED','TIME_WINDOW','CLASSIFICATION_CHANGE',
  'CONFIDENCE_THRESHOLD','GEOSPATIAL_PROXIMITY','TAG_MATCH','CUSTOM_QUERY'
);

CREATE TYPE "RuleOperator" AS ENUM (
  'EQUALS','NOT_EQUALS','GREATER_THAN','GREATER_THAN_OR_EQUAL','LESS_THAN',
  'LESS_THAN_OR_EQUAL','CONTAINS','NOT_CONTAINS','IN','NOT_IN','REGEX_MATCH',
  'EXISTS','NOT_EXISTS'
);

CREATE TYPE "RuleActionType" AS ENUM (
  'CREATE_ALERT','SEND_NOTIFICATION','CREATE_TASK','ADD_TO_WATCHLIST',
  'TRIGGER_WORKFLOW','RUN_ANALYSIS','UPDATE_CLASSIFICATION','TAG_ENTITY',
  'WEBHOOK','CUSTOM'
);

CREATE TYPE "AlertSeverity" AS ENUM (
  'INFO','LOW','MEDIUM','HIGH','CRITICAL'
);

CREATE TYPE "AlertStatus" AS ENUM (
  'OPEN','ACKNOWLEDGED','INVESTIGATING','RESOLVED','DISMISSED'
);

CREATE TYPE "WorkflowStatus" AS ENUM ('DRAFT','ACTIVE','PAUSED','ARCHIVED');
CREATE TYPE "WorkflowRunStatus" AS ENUM (
  'PENDING','RUNNING','WAITING_APPROVAL','COMPLETED','FAILED','CANCELLED'
);

CREATE TYPE "WorkflowStepType" AS ENUM (
  'CONDITION','ACTION','APPROVAL','DELAY','PARALLEL','HUMAN_TASK','AI_ANALYSIS','CONNECTOR_SYNC'
);

CREATE TYPE "WorkflowStepStatus" AS ENUM (
  'PENDING','RUNNING','COMPLETED','FAILED','SKIPPED','WAITING_APPROVAL'
);

CREATE TYPE "ApprovalStatus" AS ENUM (
  'PENDING','APPROVED','REJECTED','EXPIRED'
);

CREATE TYPE "ConnectorType" AS ENUM (
  'RSS','API','DATABASE','FILE_SYSTEM','EMAIL','WEBHOOK','THREAT_FEED','SOCIAL_MEDIA','CUSTOM'
);

CREATE TYPE "IngestionJobStatus" AS ENUM (
  'QUEUED','RUNNING','COMPLETED','FAILED','PARTIAL'
);

CREATE TYPE "IngestionRecordStatus" AS ENUM (
  'NEW','PROCESSED','MATCHED','CREATED','UPDATED','SKIPPED','ERROR'
);

CREATE TYPE "WatchlistTrigger" AS ENUM (
  'ON_CREATE','ON_UPDATE','ON_DELETE','ON_CLASSIFICATION_CHANGE','ON_CONFIDENCE_CHANGE',
  'ON_RELATIONSHIP_CHANGE','ON_EVIDENCE_ADDED','ON_ANOMALY','SCHEDULED'
);

CREATE TYPE "FindingType" AS ENUM (
  'PATTERN','CORRELATION','ANOMALY','PREDICTION','ATTRIBUTION','THREAT_ACTOR',
  'CAMPAIGN','INFRASTRUCTURE','PERSON_OF_INTEREST','RELATIONSHIP_GAP'
);

CREATE TYPE "FindingStatus" AS ENUM ('DRAFT','PROPOSED','CONFIRMED','REJECTED','ARCHIVED');
CREATE TYPE "FindingConfidence" AS ENUM ('LOW','MEDIUM','HIGH','VERY_HIGH');
CREATE TYPE "BriefingStatus" AS ENUM ('DRAFT','GENERATED','REVIEWED','APPROVED','PUBLISHED');
CREATE TYPE "IntelligenceQuestionStatus" AS ENUM (
  'OPEN','IN_PROGRESS','ANSWERED','DEFERRED','CLOSED'
);

-- Analytics tables
CREATE TABLE "GraphAnalysis" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "investigationId" TEXT,
  "analysisType" "GraphAnalysisType" NOT NULL,
  "status" "GraphAnalysisStatus" NOT NULL DEFAULT 'QUEUED',
  "parameters" JSONB,
  "result" JSONB,
  "snapshotId" TEXT,
  "startedAt" TIMESTAMPTZ,
  "completedAt" TIMESTAMPTZ,
  "createdById" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "EntityMatchCandidate" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "baseEntityId" TEXT NOT NULL,
  "matchEntityId" TEXT NOT NULL,
  "similarityScore" DOUBLE PRECISION NOT NULL,
  "matchFactors" JSONB NOT NULL,
  "status" "EntityMatchStatus" NOT NULL DEFAULT 'PENDING',
  "reviewedById" TEXT,
  "mergedEntityId" TEXT,
  "decisionComment" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "reviewStartedAt" TIMESTAMPTZ,
  "completedAt" TIMESTAMPTZ
);

CREATE TABLE "Anomaly" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "investigationId" TEXT,
  "anomalyType" "AnomalyType" NOT NULL,
  "severity" "AnomalySeverity" NOT NULL,
  "status" "AnomalyStatus" NOT NULL DEFAULT 'NEW',
  "baseline" JSONB NOT NULL,
  "observedValue" JSONB NOT NULL,
  "explanation" TEXT,
  "score" DOUBLE PRECISION,
  "sourceIds" TEXT[],
  "context" JSONB,
  "reviewedById" TEXT,
  "resolutionNotes" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "resolvedAt" TIMESTAMPTZ
);

-- Rules & Alerts
CREATE TABLE "IntelligenceRule" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "conditions" JSONB NOT NULL,
  "actions" JSONB NOT NULL,
  "toolBudget" INTEGER,
  "runCount" INTEGER NOT NULL DEFAULT 0,
  "lastTriggeredAt" TIMESTAMPTZ,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "Alert" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "investigationId" TEXT,
  "ruleId" TEXT,
  "severity" "AlertSeverity" NOT NULL,
  "status" "AlertStatus" NOT NULL DEFAULT 'OPEN',
  "title" TEXT NOT NULL,
  "description" TEXT,
  "entityId" TEXT,
  "targetType" TEXT,
  "targetId" TEXT,
  "assignedToId" TEXT,
  "sourceEvents" TEXT[],
  "context" JSONB,
  "acknowledgedAt" TIMESTAMPTZ,
  "resolvedAt" TIMESTAMPTZ,
  "dismissedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Workflows
CREATE TABLE "IntelligenceWorkflow" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "kind" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "steps" JSONB NOT NULL,
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "WorkflowRun" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "workflowId" TEXT NOT NULL,
  "status" "WorkflowRunStatus" NOT NULL DEFAULT 'PENDING',
  "triggeredById" TEXT NOT NULL,
  "triggeredByType" TEXT NOT NULL,
  "investigationId" TEXT,
  "context" JSONB NOT NULL DEFAULT '{}',
  "currentStepIndex" INTEGER NOT NULL DEFAULT 0,
  "runToken" TEXT,
  "startedAt" TIMESTAMPTZ,
  "completedAt" TIMESTAMPTZ,
  "failedAt" TIMESTAMPTZ,
  "errorMessage" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "WorkflowRunStep" (
  "id" TEXT NOT NULL,
  "runId" TEXT NOT NULL,
  "stepIndex" INTEGER NOT NULL,
  "status" "WorkflowStepStatus" NOT NULL DEFAULT 'PENDING',
  "input" JSONB,
  "output" JSONB,
  "errorMessage" TEXT,
  "executedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "WorkflowApproval" (
  "id" TEXT NOT NULL,
  "runId" TEXT NOT NULL,
  "stepIndex" INTEGER NOT NULL,
  "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
  "approverId" TEXT NOT NULL,
  "comment" TEXT,
  "expiresAt" TIMESTAMPTZ,
  "approvedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Data Sources & Connectors
CREATE TABLE "DataSource" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "connectorType" "ConnectorType" NOT NULL,
  "name" TEXT NOT NULL,
  "config" JSONB NOT NULL,
  "scheduleCron" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "ConnectorIngestion" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "dataSourceId" TEXT NOT NULL,
  "status" "IngestionJobStatus" NOT NULL DEFAULT 'QUEUED',
  "recordsDiscovered" INTEGER NOT NULL DEFAULT 0,
  "recordsProcessed" INTEGER NOT NULL DEFAULT 0,
  "recordsFailed" INTEGER NOT NULL DEFAULT 0,
  "errors" JSONB,
  "startedAt" TIMESTAMPTZ,
  "completedAt" TIMESTAMPTZ,
  "createdById" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "IngestionRecord" (
  "id" TEXT NOT NULL,
  "ingestionId" TEXT NOT NULL,
  "status" "IngestionRecordStatus" NOT NULL DEFAULT 'NEW',
  "externalId" TEXT,
  "payload" JSONB NOT NULL,
  "normalized" JSONB,
  "matchedEntityId" TEXT,
  "errorReason" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Watchlists
CREATE TABLE "Watchlist" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "sources" JSONB,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "WatchlistItem" (
  "id" TEXT NOT NULL,
  "watchlistId" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "metadata" JSONB,
  "expiresAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Intelligence artifacts
CREATE TABLE "IntelligenceQuestion" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "investigationId" TEXT,
  "question" TEXT NOT NULL,
  "status" "IntelligenceQuestionStatus" NOT NULL DEFAULT 'OPEN',
  "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "IntelligenceFinding" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "investigationId" TEXT,
  "questionId" TEXT,
  "findingType" "FindingType" NOT NULL,
  "status" "FindingStatus" NOT NULL DEFAULT 'DRAFT',
  "confidence" "FindingConfidence" NOT NULL DEFAULT 'MEDIUM',
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "keyEntities" TEXT[],
  "sources" JSONB NOT NULL,
  "suggestedActions" JSONB,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "IntelligenceBriefing" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "investigationId" TEXT,
  "title" TEXT NOT NULL,
  "summary" TEXT,
  "status" "BriefingStatus" NOT NULL DEFAULT 'DRAFT',
  "content" JSONB,
  "citations" JSONB,
  "tokenUsage" INTEGER,
  "generatedAt" TIMESTAMPTZ,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "AnalyticsSnapshot" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "investigationId" TEXT,
  "label" TEXT NOT NULL,
  "data" JSONB NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Primary keys and unique constraints
ALTER TABLE "GraphAnalysis" ADD CONSTRAINT "pk_graphanalysis" PRIMARY KEY ("id");
ALTER TABLE "EntityMatchCandidate" ADD CONSTRAINT "pk_entitymatch" PRIMARY KEY ("id");
ALTER TABLE "Anomaly" ADD CONSTRAINT "pk_anomaly" PRIMARY KEY ("id");
ALTER TABLE "IntelligenceRule" ADD CONSTRAINT "pk_intelrule" PRIMARY KEY ("id");
ALTER TABLE "Alert" ADD CONSTRAINT "pk_alert" PRIMARY KEY ("id");
ALTER TABLE "IntelligenceWorkflow" ADD CONSTRAINT "pk_workflow" PRIMARY KEY ("id");
ALTER TABLE "WorkflowRun" ADD CONSTRAINT "pk_workflowrun" PRIMARY KEY ("id");
ALTER TABLE "WorkflowRunStep" ADD CONSTRAINT "pk_workflowrunstep" PRIMARY KEY ("id");
ALTER TABLE "WorkflowApproval" ADD CONSTRAINT "pk_workflowapproval" PRIMARY KEY ("id");
ALTER TABLE "DataSource" ADD CONSTRAINT "pk_datasource" PRIMARY KEY ("id");
ALTER TABLE "ConnectorIngestion" ADD CONSTRAINT "pk_connectoringestion" PRIMARY KEY ("id");
ALTER TABLE "IngestionRecord" ADD CONSTRAINT "pk_ingestionrecord" PRIMARY KEY ("id");
ALTER TABLE "Watchlist" ADD CONSTRAINT "pk_watchlist" PRIMARY KEY ("id");
ALTER TABLE "WatchlistItem" ADD CONSTRAINT "pk_watchlistitem" PRIMARY KEY ("id");
ALTER TABLE "IntelligenceQuestion" ADD CONSTRAINT "pk_intelquestion" PRIMARY KEY ("id");
ALTER TABLE "IntelligenceFinding" ADD CONSTRAINT "pk_intelfinding" PRIMARY KEY ("id");
ALTER TABLE "IntelligenceBriefing" ADD CONSTRAINT "pk_intelbriefing" PRIMARY KEY ("id");
ALTER TABLE "AnalyticsSnapshot" ADD CONSTRAINT "pk_analyticssnapshot" PRIMARY KEY ("id");

-- Indexes
CREATE UNIQUE INDEX "ux_intelrule_org_name" ON "IntelligenceRule"("organizationId","name");
CREATE INDEX "ix_graphanalysis_org" ON "GraphAnalysis"("organizationId","analysisType","createdAt");
CREATE INDEX "ix_graphanalysis_inv" ON "GraphAnalysis"("investigationId");
CREATE INDEX "ix_graphanalysis_status" ON "GraphAnalysis"("status","createdAt");
CREATE UNIQUE INDEX "ux_match_candidate" ON "EntityMatchCandidate"("organizationId","baseEntityId","matchEntityId");
CREATE INDEX "ix_match_org_status" ON "EntityMatchCandidate"("organizationId","status");
CREATE INDEX "ix_anomaly_org_status" ON "Anomaly"("organizationId","status","severity");
CREATE INDEX "ix_anomaly_inv" ON "Anomaly"("investigationId");
CREATE INDEX "ix_alert_org" ON "Alert"("organizationId","status","severity","createdAt");
CREATE INDEX "ix_alert_inv" ON "Alert"("investigationId","status");
CREATE INDEX "ix_workflowrun_org" ON "WorkflowRun"("organizationId","status","createdAt");
CREATE INDEX "ix_workflowrun_workflow" ON "WorkflowRun"("workflowId","createdAt");
CREATE INDEX "ix_workflowrunstep_run" ON "WorkflowRunStep"("runId");
CREATE UNIQUE INDEX "ux_workflowrunstep" ON "WorkflowRunStep"("runId","stepIndex");
CREATE INDEX "ix_approval_status" ON "WorkflowApproval"("status","expiresAt");
CREATE INDEX "ix_datasource_org" ON "DataSource"("organizationId","isActive");
CREATE INDEX "ix_ingestion_org" ON "ConnectorIngestion"("organizationId","status","createdAt");
CREATE INDEX "ix_ingestion_datasource" ON "ConnectorIngestion"("dataSourceId","createdAt");
CREATE INDEX "ix_ingestionrecord_ing" ON "IngestionRecord"("ingestionId","status");
CREATE UNIQUE INDEX "ux_watchlist_org_name" ON "Watchlist"("organizationId","name");
CREATE INDEX "ix_watchlist_org" ON "Watchlist"("organizationId","isActive");
CREATE INDEX "ix_watchlistitem_list" ON "WatchlistItem"("watchlistId","targetType");
CREATE UNIQUE INDEX "ux_watchlistitem" ON "WatchlistItem"("watchlistId","targetType","targetId");
CREATE INDEX "ix_intelquestion_org" ON "IntelligenceQuestion"("organizationId","status");
CREATE INDEX "ix_intelfinding_org" ON "IntelligenceFinding"("organizationId","status");
CREATE UNIQUE INDEX "ux_question_run" ON "WorkflowRun"("runToken");
CREATE INDEX "ix_analytics_snapshot" ON "AnalyticsSnapshot"("organizationId","investigationId","label","createdAt");

-- Foreign keys to Organization
ALTER TABLE "GraphAnalysis" ADD COLUMN IF NOT EXISTS "organizationId" TEXT NOT NULL DEFAULT 'temp';
ALTER TABLE "GraphAnalysis" ADD CONSTRAINT "fk_graphanalysis_org"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE;

ALTER TABLE "EntityMatchCandidate" ADD CONSTRAINT "fk_match_org"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE;

ALTER TABLE "Anomaly" ADD CONSTRAINT "fk_anomaly_org"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE;

ALTER TABLE "IntelligenceRule" ADD CONSTRAINT "fk_rule_org"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE;

ALTER TABLE "Alert" ADD CONSTRAINT "fk_alert_org"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE;

ALTER TABLE "IntelligenceWorkflow" ADD CONSTRAINT "fk_workflow_org"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE;

ALTER TABLE "WorkflowRun" ADD CONSTRAINT "fk_workflowrun_org"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE;

ALTER TABLE "DataSource" ADD CONSTRAINT "fk_datasource_org"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE;

ALTER TABLE "ConnectorIngestion" ADD CONSTRAINT "fk_ingestion_org"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE;

ALTER TABLE "Watchlist" ADD CONSTRAINT "fk_watchlist_org"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE;

ALTER TABLE "IntelligenceQuestion" ADD CONSTRAINT "fk_question_org"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE;

ALTER TABLE "IntelligenceFinding" ADD CONSTRAINT "fk_finding_org"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE;

ALTER TABLE "IntelligenceBriefing" ADD CONSTRAINT "fk_briefing_org"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE;

ALTER TABLE "AnalyticsSnapshot" ADD CONSTRAINT "fk_snapshot_org"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE;

-- Foreign keys to User
ALTER TABLE "GraphAnalysis" ADD COLUMN IF NOT EXISTS "createdById" TEXT;
ALTER TABLE "GraphAnalysis" ADD CONSTRAINT "fk_graphanalysis_user"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL;

ALTER TABLE "IntelligenceRule" ADD CONSTRAINT "fk_rule_user"
  FOREIGN KEY ("createdById") REFERENCES "User"("id");

ALTER TABLE "IntelligenceWorkflow" ADD CONSTRAINT "fk_workflow_user"
  FOREIGN KEY ("createdById") REFERENCES "User"("id");

ALTER TABLE "WorkflowRun" ADD CONSTRAINT "fk_workflowrun_workflow"
  FOREIGN KEY ("workflowId") REFERENCES "IntelligenceWorkflow"("id") ON DELETE CASCADE;

ALTER TABLE "DataSource" ADD CONSTRAINT "fk_datasource_user"
  FOREIGN KEY ("createdById") REFERENCES "User"("id");

ALTER TABLE "Watchlist" ADD CONSTRAINT "fk_watchlist_user"
  FOREIGN KEY ("createdById") REFERENCES "User"("id");

ALTER TABLE "IntelligenceQuestion" ADD CONSTRAINT "fk_question_user"
  FOREIGN KEY ("createdById") REFERENCES "User"("id");

ALTER TABLE "IntelligenceFinding" ADD CONSTRAINT "fk_finding_user"
  FOREIGN KEY ("createdById") REFERENCES "User"("id");

ALTER TABLE "IntelligenceBriefing" ADD CONSTRAINT "fk_briefing_user"
  FOREIGN KEY ("createdById") REFERENCES "User"("id");

-- Fix default for orgId if temp inserted
UPDATE "GraphAnalysis" SET "organizationId" = '00000000-0000-0000-0000-000000000000'
  WHERE "organizationId" = 'temp';