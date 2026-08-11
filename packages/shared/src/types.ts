/**
 * Core domain types shared across ATLAS apps.
 * These are compile-time contracts — the API remains the enforcement point.
 */

/** Data-driven roles (Phase 1 RBAC foundation). */
export const ROLES = [
  'OWNER',
  'ADMIN',
  'ANALYST',
  'INVESTIGATOR',
  'VIEWER',
] as const;
export type Role = (typeof ROLES)[number];

/** Permission concepts (kebab-case domains). */
export const PERMISSIONS = [
  'investigation.read',
  'investigation.create',
  'investigation.update',
  'investigation.delete',

  'entity.read',
  'entity.create',
  'entity.update',
  'entity.delete',

  'evidence.read',
  'evidence.create',
  'evidence.update',
  'evidence.delete',
  'evidence.download',
  'evidence.annotate',
  'evidence.process',
  'evidence.classify',

  'report.read',
  'report.create',
  'report.update',
  'report.delete',
  'report.publish',
  'report.review',
  'report.approve',
  'report.export',

  'comment.create',
  'comment.resolve',
  'comment.delete',
  'notification.read',
  'notification.update',
  'collaboration.read',

  'workspace.manage',
  'members.manage',
  'settings.manage',
] as const;
export type Permission = (typeof PERMISSIONS)[number];

/** Supported entity kinds — extensible for later phases. */
export const ENTITY_TYPES = [
  'PERSON',
  'ORGANIZATION',
  'DOMAIN',
  'IP_ADDRESS',
  'LOCATION',
  'DEVICE',
  'ACCOUNT',
  'DOCUMENT',
  'EVENT',
  'OTHER',
] as const;
export type EntityType = (typeof ENTITY_TYPES)[number];

/** Investigation lifecycle states (Phase 2). */
export const INVESTIGATION_STATUSES = [
  'DRAFT',
  'ACTIVE',
  'PAUSED',
  'COMPLETED',
  'ARCHIVED',
] as const;
export type InvestigationStatus = (typeof INVESTIGATION_STATUSES)[number];

export const INVESTIGATION_PRIORITIES = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
] as const;
export type InvestigationPriority = (typeof INVESTIGATION_PRIORITIES)[number];

/** Information classification shared by investigations and evidence. */
export const CLASSIFICATIONS = [
  'PUBLIC',
  'INTERNAL',
  'CONFIDENTIAL',
  'RESTRICTED',
] as const;
export type Classification = (typeof CLASSIFICATIONS)[number];

export const ENTITY_STATUSES = ['ACTIVE', 'ARCHIVED'] as const;
export type EntityStatus = (typeof ENTITY_STATUSES)[number];

export const RELATIONSHIP_TYPES = [
  'ASSOCIATED_WITH',
  'OWNS',
  'WORKS_FOR',
  'LOCATED_AT',
  'USES',
  'CONTROLS',
  'CONNECTED_TO',
  'MEMBER_OF',
  'RELATED_TO',
  'OBSERVED_WITH',
  'CUSTOM',
] as const;
export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

export const RELATIONSHIP_DIRECTIONS = ['DIRECTED', 'UNDIRECTED'] as const;
export type RelationshipDirection = (typeof RELATIONSHIP_DIRECTIONS)[number];

export const EVIDENCE_TYPES = [
  'DOCUMENT',
  'IMAGE',
  'VIDEO',
  'AUDIO',
  'ARCHIVE',
  'WEB_ARTIFACT',
  'LOG',
  'DATASET',
  'OTHER',
] as const;
export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

export const EVIDENCE_STATUSES = [
  'PENDING',
  'AVAILABLE',
  'ARCHIVED',
  'RESTRICTED',
] as const;
export type EvidenceStatus = (typeof EVIDENCE_STATUSES)[number];

export const NOTE_VISIBILITIES = ['INVESTIGATION', 'PRIVATE'] as const;
export type NoteVisibility = (typeof NOTE_VISIBILITIES)[number];

/** Investigation-level member roles. */
export const INVESTIGATION_MEMBER_ROLES = [
  'LEAD',
  'ANALYST',
  'CONTRIBUTOR',
  'VIEWER',
] as const;
export type InvestigationMemberRole = (typeof INVESTIGATION_MEMBER_ROLES)[number];

export const TASK_STATUSES = [
  'TODO',
  'IN_PROGRESS',
  'BLOCKED',
  'DONE',
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

/** Clear marker that a record is part of the fictional demo dataset. */
export const DEMO = 'DEMO' as const;
export type DemoMarker = typeof DEMO;

/**
 * Phase 3 — Graph & Geospatial Intelligence contracts.
 * Compile-time shapes shared between the API and the visual frontend.
 * These are NOT Prisma enums — see enum-parity.spec.ts before adding enums.
 */

/** Layout algorithms the 2D graph engine can render. */
export const GRAPH_LAYOUTS = ['force', 'radial', 'hierarchical', 'grid'] as const;
export type GraphLayout = (typeof GRAPH_LAYOUTS)[number];

/** Event categories shown on the timeline. Extensible without redesign. */
export const TIMELINE_EVENT_KINDS = [
  'ENTITY',
  'RELATIONSHIP',
  'EVIDENCE',
  'NOTE',
  'ACTIVITY',
  'CUSTOM',
] as const;
export type TimelineEventKind = (typeof TIMELINE_EVENT_KINDS)[number];

/** A geographic point (WGS84). */
export interface GeoPoint {
  latitude: number;
  longitude: number;
}

/** A node in the wire graph payload (shaped like the dashboard graph nodes). */
export interface GraphNodePayload {
  id: string;
  name: string;
  type: EntityType;
  confidence: number;
  latitude?: number | null;
  longitude?: number | null;
  investigationId?: string | null;
  tags?: string[];
  properties?: Record<string, unknown> | null;
}

/** An edge in the wire graph payload. */
export interface GraphEdgePayload {
  id: string;
  kind: RelationshipType;
  direction: RelationshipDirection;
  confidence: number;
  sourceId: string;
  targetId: string;
  investigationId?: string | null;
}

/** Full graph payload served by the graph/geo endpoints. */
export interface GraphPayload {
  nodes: GraphNodePayload[];
  edges: GraphEdgePayload[];
  meta: {
    totalEntities: number;
    truncated?: boolean;
  };
}

/** Incremental change applied to a client graph (never rebuild the whole graph). */
export interface GraphDelta {
  addedNodes?: GraphNodePayload[];
  removedNodeIds?: string[];
  updatedNodes?: GraphNodePayload[];
  addedEdges?: GraphEdgePayload[];
  removedEdgeIds?: string[];
}

/** Neighborhood payload (center + 1..depth hops). */
export interface NeighborhoodPayload {
  center: GraphNodePayload;
  nodes: GraphNodePayload[];
  edges: GraphEdgePayload[];
  depth: number;
  truncated?: boolean;
}

/** Shortest-path payload between two entities. */
export interface PathPayload {
  nodes: GraphNodePayload[];
  edges: GraphEdgePayload[];
  found: boolean;
  hops: number;
}

/** A row in a timeline query result. */
export interface TimelineEventItem {
  id: string;
  title: string;
  description?: string | null;
  kind: string;
  occurredAt: string;
  investigationId?: string | null;
  entityId?: string | null;
  createdById?: string | null;
  createdByDisplayName?: string | null;
}

/** A single SSE message pushed to authorized clients. */
export type StreamMessageType =
  | 'graph'
  | 'timeline'
  | 'activity'
  | 'heartbeat'
  | 'evidence'
  | 'report'
  | 'presence'
  | 'comment'
  | 'notification';

export interface StreamMessage {
  id: number;
  type: StreamMessageType;
  investigationId?: string | null;
  delta?: GraphDelta | null;
  message?: string | null;
  createdAt: string;
  /** Phase 5 — which resource kind the event concerns (client-side scoping). */
  resourceType?: 'INVESTIGATION' | 'EVIDENCE' | 'REPORT' | 'ENTITY' | null;
  /** Phase 5 — resource instance id (client-side scoping). */
  resourceId?: string | null;
  /** Phase 5 — user-scoped deliveries (notifications, presence). */
  userId?: string | null;
  /** Phase 5 — presence snapshot (type === 'presence'). */
  presence?: PresencePayload | null;
  /** Phase 5 — report collaboration delta (type === 'report'). */
  report?: ReportDeltaPayload | null;
}

/** Payload of the short-lived realtime ticket. */
export interface SseTicketPayload {
  ticket: string;
  expiresAt: string;
}

/** Result of a radius query. */
export interface RadiusResult {
  items: GeoPoint[];
  meta: {
    center: GeoPoint;
    radiusKm: number;
    count: number;
  };
}

/** Connection arcs between geographically-anchored entities. */
export interface GeoArc {
  source: GeoPoint;
  target: GeoPoint;
  kind: RelationshipType;
  confidence: number;
}

// ---------------------------------------------------------------------------
// Phase 4 — AI Intelligence Engine
// ---------------------------------------------------------------------------

/** Conversation turn roles persisted for AI assistant history. */
export type AiRole = 'USER' | 'ASSISTANT';

/** A source the AI assistant grounded an answer on. */
export interface AiSourceRef {
  kind: 'ENTITY' | 'EVIDENCE' | 'NOTE';
  id: string;
  title: string;
  snippet?: string;
  investigationId?: string | null;
}

/** Request body for the assistant chat endpoint. */
export interface AiChatRequest {
  /** Scope to an investigation (membership enforced server-side). */
  investigationId?: string;
  message: string;
  /** Prior turns for conversation continuity. */
  history?: Array<{ role: AiRole; content: string }>;
}

/** Response from the assistant chat endpoint. */
export interface AiChatReply {
  reply: string;
  sources: AiSourceRef[];
  messageId: string;
}

/** Structured investigation summary (knowledge-graph reasoning). */
export interface AiSummaryPayload {
  overview: string;
  keyEntities: string[];
  keyRelationships: string[];
  evidenceHighlights: string[];
  openQuestions: string[];
}

/** Persisted AI conversation message. */
export interface AiMessageRow {
  id: string;
  role: AiRole;
  content: string;
  sources: AiSourceRef[] | null;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Phase 5 — Evidence Intelligence, Reports & Real-Time Collaboration
// ---------------------------------------------------------------------------

/** Processing lifecycle for evidence extraction jobs (§20). */
export const EVIDENCE_PROCESSING_STATUSES = [
  'QUEUED',
  'PROCESSING',
  'COMPLETED',
  'PARTIAL',
  'FAILED',
] as const;
export type EvidenceProcessingStatus =
  (typeof EVIDENCE_PROCESSING_STATUSES)[number];

/** Generic background job lifecycle (§60). */
export const BACKGROUND_JOB_STATUSES = [
  'QUEUED',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
] as const;
export type BackgroundJobStatus = (typeof BACKGROUND_JOB_STATUSES)[number];

/** Evidence annotation kinds (§15). */
export const EVIDENCE_ANNOTATION_TYPES = [
  'HIGHLIGHT',
  'COMMENT',
  'TAG',
  'REGION',
  'BOOKMARK',
] as const;
export type EvidenceAnnotationType =
  (typeof EVIDENCE_ANNOTATION_TYPES)[number];

/** Everything a comment can attach to (§39). */
export const COMMENT_TARGET_TYPES = [
  'INVESTIGATION',
  'ENTITY',
  'EVIDENCE',
  'TIMELINE_EVENT',
  'REPORT',
  'REPORT_BLOCK',
  'NOTE',
  'RELATIONSHIP',
] as const;
export type CommentTargetType = (typeof COMMENT_TARGET_TYPES)[number];

/** Everything evidence can be linked to (§16). */
export const EVIDENCE_LINK_TARGET_TYPES = [
  'INVESTIGATION',
  'ENTITY',
  'RELATIONSHIP',
  'TIMELINE_EVENT',
  'NOTE',
  'REPORT',
] as const;
export type EvidenceLinkTargetType =
  (typeof EVIDENCE_LINK_TARGET_TYPES)[number];

/** Report lifecycle statuses (§22, §30). */
export const REPORT_STATUSES = [
  'DRAFT',
  'IN_REVIEW',
  'CHANGES_REQUESTED',
  'APPROVED',
  'PUBLISHED',
  'ARCHIVED',
] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

/** Reusable report block kinds (§24). */
export const REPORT_BLOCK_TYPES = [
  'TEXT',
  'HEADING',
  'IMAGE',
  'TABLE',
  'ENTITY',
  'RELATIONSHIP',
  'EVIDENCE',
  'TIMELINE',
  'MAP',
  'GRAPH',
  'AI_SUMMARY',
  'CITATION_LIST',
  'CALLOUT',
  'PAGE_BREAK',
] as const;
export type ReportBlockType = (typeof REPORT_BLOCK_TYPES)[number];

/** Built-in report templates (§26). */
export const REPORT_TEMPLATE_KINDS = [
  'INVESTIGATION_REPORT',
  'EXECUTIVE_INTELLIGENCE_BRIEF',
  'EVIDENCE_SUMMARY',
  'ENTITY_PROFILE',
  'INCIDENT_ANALYSIS',
  'RESEARCH_SUMMARY',
] as const;
export type ReportTemplateKind = (typeof REPORT_TEMPLATE_KINDS)[number];

/** Report review decisions (§30). */
export const REPORT_REVIEW_DECISIONS = [
  'APPROVE',
  'REJECT',
  'REQUEST_CHANGES',
] as const;
export type ReportReviewDecision = (typeof REPORT_REVIEW_DECISIONS)[number];

/** Notification kinds (§41). */
export const NOTIFICATION_KINDS = [
  'COMMENT',
  'MENTION',
  'COMMENT_REPLY',
  'REPORT_STATUS',
  'EVIDENCE_UPDATE',
  'EVIDENCE_PROCESSING_COMPLETED',
  'INVESTIGATION_ASSIGNMENT',
  'TASK_ASSIGNMENT',
  'MEMBER_ADDED',
  'AI_READY',
  'COLLABORATION_ACTIVITY',
] as const;
export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

/** Report export formats (§32). */
export const REPORT_EXPORT_FORMATS = ['PDF', 'HTML', 'JSON'] as const;
export type ReportExportFormat = (typeof REPORT_EXPORT_FORMATS)[number];

// --- Evidence payloads -----------------------------------------------------

/** Evidence list/detail row (Phase 5 additions over the Phase 2 row). */
export interface EvidenceRow {
  id: string;
  name: string;
  kind: EvidenceType;
  title?: string | null;
  description?: string | null;
  source?: string | null;
  classification: Classification;
  hash?: string | null;
  mimeType?: string | null;
  size?: number | null;
  status: EvidenceStatus;
  reference?: string | null;
  originalFilename?: string | null;
  processingStatus?: EvidenceProcessingStatus | null;
  verifiedAt?: string | null;
  collectedAt?: string | null;
  investigationId?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: { id: string; displayName: string } | null;
  _count?: {
    versions?: number;
    annotations?: number;
    accessEvents?: number;
    links?: number;
  };
}

export interface EvidenceVersionRow {
  id: string;
  evidenceId: string;
  versionNumber: number;
  hash: string;
  size?: number | null;
  mimeType?: string | null;
  originalFilename?: string | null;
  changeType: string;
  changeSummary?: string | null;
  createdAt: string;
  createdBy?: { id: string; displayName: string } | null;
}

export interface EvidenceAccessEventRow {
  id: string;
  evidenceId: string;
  versionId?: string | null;
  action: string;
  actorType: string;
  actorId?: string | null;
  safeMetadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface EvidenceAnnotationRow {
  id: string;
  evidenceId: string;
  versionId?: string | null;
  type: EvidenceAnnotationType;
  target?: {
    page?: number;
    rect?: { x: number; y: number; w: number; h: number };
    startIndex?: number;
    endIndex?: number;
  } | null;
  content?: string | null;
  tags: string[];
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  author?: { id: string; displayName: string } | null;
}

export interface EvidenceProcessingJobRow {
  id: string;
  evidenceId: string;
  kind: string;
  status: EvidenceProcessingStatus;
  attempts: number;
  maxAttempts: number;
  errorCode?: string | null;
  errorMessage?: string | null;
  result?: Record<string, unknown> | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

export interface EvidenceLinkRow {
  id: string;
  evidenceId: string;
  targetType: EvidenceLinkTargetType;
  targetId: string;
  linkType: string;
  createdAt: string;
  createdBy?: { id: string; displayName: string } | null;
}

// --- Report payloads -------------------------------------------------------

export interface ReportRow {
  id: string;
  title: string;
  description?: string | null;
  summary?: string | null;
  status: ReportStatus;
  classification: Classification;
  aiGenerated: boolean;
  aiStatus?: string | null;
  currentVersion: number;
  templateKind?: ReportTemplateKind | null;
  investigationId?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: { id: string; displayName: string } | null;
  _count?: { sections?: number; versions?: number; citations?: number };
}

export interface ReportVersionRow {
  id: string;
  reportId: string;
  versionNumber: number;
  title?: string | null;
  summary?: string | null;
  changeSummary?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  createdBy?: { id: string; displayName: string } | null;
}

export interface ReportSectionRow {
  id: string;
  reportId: string;
  key: string;
  title: string;
  position: number;
  isRequired: boolean;
  aiGenerated: boolean;
  collapsed: boolean;
  blocks: ReportBlockPayload[];
}

export interface ReportBlockPayload {
  id: string;
  sectionId: string;
  type: ReportBlockType;
  position: number;
  content?: {
    text?: string;
    heading?: string;
    table?: unknown[][];
    imageKey?: string;
    [key: string]: unknown;
  } | null;
  dataRef?: {
    entityId?: string;
    evidenceId?: string;
    relationshipId?: string;
    timelineEventId?: string;
    mapQuery?: string;
    graphQuery?: string;
    [key: string]: unknown;
  } | null;
  aiGenerated: boolean;
  aiStatus?: string | null;
}

export interface ReportCitationRow {
  id: string;
  reportId: string;
  sectionId?: string | null;
  blockId?: string | null;
  targetType:
    | 'EVIDENCE'
    | 'ENTITY'
    | 'RELATIONSHIP'
    | 'TIMELINE_EVENT'
    | 'INVESTIGATION'
    | 'NOTE'
    | 'REPORT';
  targetId: string;
  sourceRef?: string | null;
  snippet?: string | null;
  order: number;
  createdAt: string;
}

export interface ReportReviewRow {
  id: string;
  reportId: string;
  reviewerId: string;
  decision: ReportReviewDecision;
  comment?: string | null;
  status: string;
  createdAt: string;
  reviewer?: { id: string; displayName: string } | null;
}

export interface ReportApprovalRow {
  id: string;
  reportId: string;
  reportVersionId?: string | null;
  approverId: string;
  decision: string;
  comment?: string | null;
  createdAt: string;
  approver?: { id: string; displayName: string } | null;
}

export interface ReportTemplateRow {
  id: string;
  name: string;
  kind: ReportTemplateKind;
  description?: string | null;
  sections: Array<{ key: string; title: string; isRequired: boolean; defaultBlocks: unknown[] }>;
  isSystem: boolean;
}

/** Report validation result — driven by §48 checks on the server. */
export interface ReportQualityIssue {
  code: string;
  message: string;
  severity: 'error' | 'warning';
  sectionKey?: string;
  blockId?: string;
}
export interface ReportQualityResult {
  valid: boolean;
  issues: ReportQualityIssue[];
}

/** Delta pushed to report collaborators that are editing that report (§38). */
export interface ReportDeltaPayload {
  reportId: string;
  version: number;
  sectionId?: string | null;
  blockId?: string | null;
  op: 'upsert' | 'delete' | 'reorder';
  data?: unknown;
  conflict?: boolean;
}

// --- Collaboration payloads ------------------------------------------------

export interface CommentRow {
  id: string;
  authorId: string;
  investigationId?: string | null;
  targetType: CommentTargetType;
  targetId: string;
  body: string;
  mentions: MentionRow[];
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  author?: { id: string; displayName: string } | null;
  replyCount?: number;
  replies?: CommentReplyRow[];
}

export interface CommentReplyRow {
  id: string;
  commentId: string;
  parentId?: string | null;
  authorId: string;
  body: string;
  mentions: MentionRow[];
  createdAt: string;
  updatedAt: string;
  author?: { id: string; displayName: string } | null;
}

export interface MentionRow {
  id: string;
  userId: string;
  readAt?: string | null;
  createdAt: string;
  user?: { id: string; displayName: string } | null;
}

export interface NotificationRow {
  id: string;
  kind: NotificationKind;
  title: string;
  body?: string | null;
  targetType?: CommentTargetType | null;
  targetId?: string | null;
  investigationId?: string | null;
  readAt?: string | null;
  createdAt: string;
  actor?: { id: string; displayName: string } | null;
}

/** Presence snapshot for a resource (§36). */
export interface PresencePayload {
  userId: string;
  displayName: string;
  resourceType: 'INVESTIGATION' | 'EVIDENCE' | 'REPORT';
  resourceId: string;
  status: 'ACTIVE' | 'IDLE' | 'AWAY' | 'OFFLINE';
  lastSeenAt: string;
}

/** AI report review flag (§47). */
export const AI_REVIEW_FLAG_CODES = [
  'UNSUPPORTED_CLAIM',
  'MISSING_CITATION',
  'CONFLICTING_SOURCE',
  'AMBIGUOUS_WORDING',
  'MISSING_EVIDENCE_REF',
  'UNCLEAR_CONCLUSION',
] as const;
export type AiReviewFlagCode = (typeof AI_REVIEW_FLAG_CODES)[number];
export interface AiReviewFlag {
  code: AiReviewFlagCode;
  message: string;
  blockId?: string;
  suggestion?: string;
}