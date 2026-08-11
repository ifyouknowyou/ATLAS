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

  'report.read',
  'report.create',
  'report.publish',

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
export interface StreamMessage {
  id: number;
  type: 'graph' | 'timeline' | 'activity' | 'heartbeat';
  investigationId?: string | null;
  delta?: GraphDelta;
  message?: string;
  createdAt: string;
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