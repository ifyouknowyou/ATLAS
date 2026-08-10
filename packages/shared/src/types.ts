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