/**
 * Guards against drift between the shared app contracts (@atlas/shared) and the
 * Prisma persistence enums. If a value is added to one side but not the other,
 * this test fails so the change can be reconciled deliberately.
 */
import {
  Classification,
  EntityStatus,
  EntityType,
  EvidenceStatus,
  EvidenceType,
  InvestigationMemberRole,
  InvestigationPriority,
  InvestigationStatus,
  NoteVisibility,
  RelationshipDirection,
  RelationshipType,
  Role,
  TaskStatus,
  BackgroundJobStatus,
  CommentTargetType,
  EvidenceAnnotationType,
  EvidenceLinkTargetType,
  EvidenceProcessingStatus,
  ReportBlockType,
  ReportReviewDecision,
  ReportStatus,
  ReportTemplateKind,
} from '@prisma/client';
import {
  BACKGROUND_JOB_STATUSES,
  CLASSIFICATIONS,
  Classification as SharedClassification,
  COMMENT_TARGET_TYPES,
  ENTITY_STATUSES,
  ENTITY_TYPES,
  EVIDENCE_ANNOTATION_TYPES,
  EVIDENCE_LINK_TARGET_TYPES,
  EVIDENCE_PROCESSING_STATUSES,
  EVIDENCE_STATUSES,
  EVIDENCE_TYPES,
  INVESTIGATION_MEMBER_ROLES,
  INVESTIGATION_PRIORITIES,
  INVESTIGATION_STATUSES,
  NOTE_VISIBILITIES,
  RELATIONSHIP_DIRECTIONS,
  RELATIONSHIP_TYPES,
  REPORT_BLOCK_TYPES,
  REPORT_REVIEW_DECISIONS,
  REPORT_STATUSES,
  REPORT_TEMPLATE_KINDS,
  ROLES,
  TASK_STATUSES,
} from '@atlas/shared';

function asSet(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

function enumValues(record: Record<string, string>): string[] {
  return Object.values(record);
}

describe('Prisma enum parity with @atlas/shared', () => {
  it('Role matches shared ROLES', () => {
    expect(asSet(enumValues(Role))).toEqual(asSet(ROLES));
  });

  it('EntityType matches shared ENTITY_TYPES', () => {
    expect(asSet(enumValues(EntityType))).toEqual(asSet(ENTITY_TYPES));
    const sample: SharedClassification = 'INTERNAL';
    expect(sample).toBe('INTERNAL');
  });

  it('InvestigationStatus matches shared INVESTIGATION_STATUSES', () => {
    expect(asSet(enumValues(InvestigationStatus))).toEqual(
      asSet(INVESTIGATION_STATUSES),
    );
  });

  it('InvestigationPriority matches shared INVESTIGATION_PRIORITIES', () => {
    expect(asSet(enumValues(InvestigationPriority))).toEqual(
      asSet(INVESTIGATION_PRIORITIES),
    );
  });

  it('Classification matches shared CLASSIFICATIONS', () => {
    expect(asSet(enumValues(Classification))).toEqual(asSet(CLASSIFICATIONS));
  });

  it('EntityStatus matches shared ENTITY_STATUSES', () => {
    expect(asSet(enumValues(EntityStatus))).toEqual(asSet(ENTITY_STATUSES));
  });

  it('RelationshipType matches shared RELATIONSHIP_TYPES', () => {
    expect(asSet(enumValues(RelationshipType))).toEqual(
      asSet(RELATIONSHIP_TYPES),
    );
  });

  it('RelationshipDirection matches shared RELATIONSHIP_DIRECTIONS', () => {
    expect(asSet(enumValues(RelationshipDirection))).toEqual(
      asSet(RELATIONSHIP_DIRECTIONS),
    );
  });

  it('EvidenceType matches shared EVIDENCE_TYPES', () => {
    expect(asSet(enumValues(EvidenceType))).toEqual(asSet(EVIDENCE_TYPES));
  });

  it('EvidenceStatus matches shared EVIDENCE_STATUSES', () => {
    expect(asSet(enumValues(EvidenceStatus))).toEqual(asSet(EVIDENCE_STATUSES));
  });

  it('NoteVisibility matches shared NOTE_VISIBILITIES', () => {
    expect(asSet(enumValues(NoteVisibility))).toEqual(asSet(NOTE_VISIBILITIES));
  });

  it('InvestigationMemberRole matches shared INVESTIGATION_MEMBER_ROLES', () => {
    expect(asSet(enumValues(InvestigationMemberRole))).toEqual(
      asSet(INVESTIGATION_MEMBER_ROLES),
    );
  });

  it('TaskStatus matches shared TASK_STATUSES', () => {
    expect(asSet(enumValues(TaskStatus))).toEqual(asSet(TASK_STATUSES));
  });

  it('ReportStatus matches shared REPORT_STATUSES', () => {
    expect(asSet(enumValues(ReportStatus))).toEqual(asSet(REPORT_STATUSES));
  });

  it('EvidenceProcessingStatus matches shared EVIDENCE_PROCESSING_STATUSES', () => {
    expect(asSet(enumValues(EvidenceProcessingStatus))).toEqual(
      asSet(EVIDENCE_PROCESSING_STATUSES),
    );
  });

  it('BackgroundJobStatus matches shared BACKGROUND_JOB_STATUSES', () => {
    expect(asSet(enumValues(BackgroundJobStatus))).toEqual(
      asSet(BACKGROUND_JOB_STATUSES),
    );
  });

  it('EvidenceAnnotationType matches shared EVIDENCE_ANNOTATION_TYPES', () => {
    expect(asSet(enumValues(EvidenceAnnotationType))).toEqual(
      asSet(EVIDENCE_ANNOTATION_TYPES),
    );
  });

  it('CommentTargetType matches shared COMMENT_TARGET_TYPES', () => {
    expect(asSet(enumValues(CommentTargetType))).toEqual(
      asSet(COMMENT_TARGET_TYPES),
    );
  });

  it('EvidenceLinkTargetType matches shared EVIDENCE_LINK_TARGET_TYPES', () => {
    expect(asSet(enumValues(EvidenceLinkTargetType))).toEqual(
      asSet(EVIDENCE_LINK_TARGET_TYPES),
    );
  });

  it('ReportBlockType matches shared REPORT_BLOCK_TYPES', () => {
    expect(asSet(enumValues(ReportBlockType))).toEqual(
      asSet(REPORT_BLOCK_TYPES),
    );
  });

  it('ReportTemplateKind matches shared REPORT_TEMPLATE_KINDS', () => {
    expect(asSet(enumValues(ReportTemplateKind))).toEqual(
      asSet(REPORT_TEMPLATE_KINDS),
    );
  });

  it('ReportReviewDecision matches shared REPORT_REVIEW_DECISIONS', () => {
    expect(asSet(enumValues(ReportReviewDecision))).toEqual(
      asSet(REPORT_REVIEW_DECISIONS),
    );
  });
});