/**
 * ATLAS Phase 2 demo seed — DEVELOPMENT ONLY.
 *
 * Builds on the Phase 1 demo universe with richer investigation intelligence:
 * classified investigations with owners, confidence-scored entities,
 * typed/directed relationships, evidence metadata + integrity fields, notes
 * with visibility, investigation members, tasks, and activity history.
 *
 * Every name/datum below is fictional. No real people's private information.
 *
 * Run: npm run prisma:seed --workspace @atlas/api
 */
import {
  Classification,
  EvidenceStatus,
  EvidenceType,
  InvestigationMemberRole,
  InvestigationPriority,
  InvestigationStatus,
  PrismaClient,
  RelationshipDirection,
  RelationshipType,
  Role,
  TaskStatus,
} from '@prisma/client';
import { hashSync } from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_ORG_SLUG = 'atlas-demo';
const DEMO_PASSWORD = process.env.DEMO_OWNER_PASSWORD ?? 'AtlasDemo#2026';
const BCRYPT_ROUNDS = Number(process.env.AUTH_BCRYPT_ROUNDS ?? 12);
const PASSWORD_HASH = hashSync(DEMO_PASSWORD, BCRYPT_ROUNDS);

const ADMIN_EMAIL = 'admin@atlas.demo';
const ANALYST_EMAIL = 'analyst@atlas.demo';

/** Fictional intel universe — every name/datum below is invented. */
const FICTIONAL_USERS: Array<{ email: string; displayName: string; role: Role }> =
  [
    { email: ADMIN_EMAIL, displayName: 'D. Reyes (Demo Owner)', role: 'OWNER' },
    { email: ANALYST_EMAIL, displayName: 'A. Chen (Demo Analyst)', role: 'ANALYST' },
    { email: 'investigator@atlas.demo', displayName: 'M. Okafor (Demo Investigator)', role: 'INVESTIGATOR' },
    { email: 'viewer@atlas.demo', displayName: 'S. Lindqvist (Demo Viewer)', role: 'VIEWER' },
  ];

const DEMO_WORKSPACE = {
  name: 'Global Operations',
  description: 'Primary demo workspace for the ATLAS Demo Organization',
};

interface SeedInvestigation {
  title: string;
  description: string;
  status: InvestigationStatus;
  priority: InvestigationPriority;
  classification: Classification;
}

const INVESTIGATIONS: SeedInvestigation[] = [
  {
    title: 'Investigation Alpha — Meridian network',
    description: 'Fictional investigation into a shell-adjacent holdings network.',
    status: 'ACTIVE',
    priority: 'HIGH',
    classification: 'CONFIDENTIAL',
  },
  {
    title: 'Investigation Beta — Domain infrastructure',
    description: 'Fictional infrastructure mapping across an example domain cluster.',
    status: 'ACTIVE',
    priority: 'MEDIUM',
    classification: 'INTERNAL',
  },
  {
    title: 'Investigation Gamma — Signal analysis',
    description: 'Fictional communications-signal analysis workspace.',
    status: 'DRAFT',
    priority: 'LOW',
    classification: 'INTERNAL',
  },
];

interface SeedEntity {
  type:
    | 'PERSON'
    | 'ORGANIZATION'
    | 'DOMAIN'
    | 'IP_ADDRESS'
    | 'LOCATION'
    | 'DEVICE'
    | 'ACCOUNT'
    | 'DOCUMENT'
    | 'EVENT'
    | 'OTHER';
  name: string;
  description: string;
  confidence: number;
  uri?: string;
  tags: string[];
  latitude?: number;
  longitude?: number;
}

const ENTITIES_ALPHA: SeedEntity[] = [
  { type: 'PERSON', name: 'K. Varga', description: 'Fictional suspected coordinator', confidence: 88, tags: ['person', 'fictional'], latitude: 47.4979, longitude: 19.0402 },
  { type: 'PERSON', name: 'L. Moreau', description: 'Fictional intermediary contact', confidence: 62, tags: ['person', 'fictional'], latitude: 48.8566, longitude: 2.3522 },
  { type: 'PERSON', name: 'E. Novak', description: 'Fictional secondary contact', confidence: 51, tags: ['person', 'fictional'], latitude: 52.2297, longitude: 21.0122 },
  { type: 'PERSON', name: 'A. Fischer', description: 'Fictional logistics figure', confidence: 44, tags: ['person', 'fictional'], latitude: 50.1109, longitude: 8.6821 },
  { type: 'ORGANIZATION', name: 'Meridian Ventures Ltd', description: 'Fictional shell-adjacent holding', confidence: 79, tags: ['org', 'fictional'], latitude: 51.5072, longitude: -0.1276 },
  { type: 'ORGANIZATION', name: 'Ostrow Transport Group', description: 'Fictional freight/logistics front', confidence: 58, tags: ['org', 'fictional'], latitude: 54.352, longitude: 18.6466 },
  { type: 'DOMAIN', name: 'meridian-ventures.example', description: 'Fictional domain', confidence: 91, uri: 'https://meridian-ventures.example', tags: ['infra', 'fictional'] },
  { type: 'DOMAIN', name: 'ostrow-freight.example', description: 'Fictional domain', confidence: 73, uri: 'https://ostrow-freight.example', tags: ['infra', 'fictional'] },
  { type: 'IP_ADDRESS', name: '203.0.113.86', description: 'Fictional (RFC 5737) address', confidence: 82, tags: ['infra', 'fictional'] },
  { type: 'IP_ADDRESS', name: '198.51.100.22', description: 'Fictional (RFC 5737) address', confidence: 60, tags: ['infra', 'fictional'] },
  { type: 'DEVICE', name: 'Comms-Node 7', description: 'Fictional comms equipment marker', confidence: 55, tags: ['device', 'fictional'] },
  { type: 'LOCATION', name: 'Harbour View Office Complex', description: 'Fictional meeting location', confidence: 84, tags: ['geo', 'fictional'], latitude: 52.52, longitude: 13.405 },
  { type: 'ACCOUNT', name: 'kvarga@securemail.example', description: 'Fictional mailbox', confidence: 76, tags: ['account', 'fictional'] },
  { type: 'ACCOUNT', name: 'finance@ostrow.example', description: 'Fictional mailbox', confidence: 49, tags: ['account', 'fictional'] },
];

const ENTITIES_BETA: SeedEntity[] = [
  { type: 'DOMAIN', name: 'meridian-ventures.example', description: 'Fictional domain', confidence: 91, uri: 'https://meridian-ventures.example', tags: ['infra', 'fictional'] },
  { type: 'DOMAIN', name: 'ostrow-freight.example', description: 'Fictional domain', confidence: 73, uri: 'https://ostrow-freight.example', tags: ['infra', 'fictional'] },
  { type: 'IP_ADDRESS', name: '203.0.113.86', description: 'Fictional (RFC 5737) address', confidence: 82, tags: ['infra', 'fictional'] },
  { type: 'IP_ADDRESS', name: '198.51.100.22', description: 'Fictional (RFC 5737) address', confidence: 60, tags: ['infra', 'fictional'] },
  { type: 'IP_ADDRESS', name: '198.51.100.44', description: 'Fictional (RFC 5737) address', confidence: 47, tags: ['infra', 'fictional'] },
  { type: 'ORGANIZATION', name: 'Meridian Ventures Ltd', description: 'Fictional shell-adjacent holding', confidence: 79, tags: ['org', 'fictional'], latitude: 51.5072, longitude: -0.1276 },
  { type: 'ORGANIZATION', name: 'Ostrow Transport Group', description: 'Fictional freight/logistics front', confidence: 58, tags: ['org', 'fictional'], latitude: 54.352, longitude: 18.6466 },
  { type: 'DOCUMENT', name: 'Invoice_1042.pdf', description: 'Fictional invoice artifact', confidence: 65, tags: ['document', 'fictional'] },
  { type: 'EVENT', name: 'Harbour View handoff', description: 'Fictional observed meet', confidence: 71, tags: ['event', 'fictional'] },
  { type: 'EVENT', name: 'Registry filing anomaly', description: 'Fictional incorporation event', confidence: 40, tags: ['event', 'fictional'] },
];

interface SeedRelationship {
  type: RelationshipType;
  direction: RelationshipDirection;
  confidence: number;
  description: string;
  source: string;
  target: string;
}

const RELATIONSHIPS: SeedRelationship[] = [
  { type: 'ASSOCIATED_WITH', direction: 'UNDIRECTED', confidence: 66, description: 'Fictional contact channel', source: 'L. Moreau', target: 'K. Varga' },
  { type: 'WORKS_FOR', direction: 'DIRECTED', confidence: 74, description: 'Fictional employment link', source: 'K. Varga', target: 'Meridian Ventures Ltd' },
  { type: 'OWNS', direction: 'DIRECTED', confidence: 81, description: 'Fictional domain ownership', source: 'Meridian Ventures Ltd', target: 'meridian-ventures.example' },
  { type: 'CONTROLS', direction: 'DIRECTED', confidence: 70, description: 'Fictional account control', source: 'Meridian Ventures Ltd', target: 'kvarga@securemail.example' },
  { type: 'USES', direction: 'DIRECTED', confidence: 63, description: 'Fictional infra usage', source: 'K. Varga', target: '203.0.113.86' },
  { type: 'LOCATED_AT', direction: 'UNDIRECTED', confidence: 77, description: 'Fictional geolocation', source: 'K. Varga', target: 'Harbour View Office Complex' },
  { type: 'OBSERVED_WITH', direction: 'UNDIRECTED', confidence: 55, description: 'Fictional co-observation', source: 'E. Novak', target: 'L. Moreau' },
  { type: 'CONNECTED_TO', direction: 'UNDIRECTED', confidence: 48, description: 'Fictional comms link', source: 'Comms-Node 7', target: '198.51.100.22' },
  { type: 'ASSOCIATED_WITH', direction: 'UNDIRECTED', confidence: 52, description: 'Fictional association', source: 'Ostrow Transport Group', target: 'Meridian Ventures Ltd' },
  { type: 'OWNS', direction: 'DIRECTED', confidence: 64, description: 'Fictional domain ownership', source: 'Ostrow Transport Group', target: 'ostrow-freight.example' },
  { type: 'WORKS_FOR', direction: 'DIRECTED', confidence: 46, description: 'Fictional employment link', source: 'A. Fischer', target: 'Ostrow Transport Group' },
  { type: 'CONTROLS', direction: 'DIRECTED', confidence: 58, description: 'Fictional account control', source: 'Ostrow Transport Group', target: 'finance@ostrow.example' },
  { type: 'USES', direction: 'DIRECTED', confidence: 43, description: 'Fictional infra usage', source: 'A. Fischer', target: '198.51.100.22' },
  { type: 'ASSOCIATED_WITH', direction: 'UNDIRECTED', confidence: 39, description: 'Fictional weak association', source: 'E. Novak', target: 'K. Varga' },
  { type: 'ASSOCIATED_WITH', direction: 'UNDIRECTED', confidence: 61, description: 'Fictional contact channel', source: 'A. Fischer', target: 'L. Moreau' },
  { type: 'CONNECTED_TO', direction: 'UNDIRECTED', confidence: 54, description: 'Fictional network link', source: '203.0.113.86', target: '198.51.100.44' },
  { type: 'MEMBER_OF', direction: 'DIRECTED', confidence: 50, description: 'Fictional membership link', source: 'A. Fischer', target: 'Ostrow Transport Group' },
  { type: 'OBSERVED_WITH', direction: 'UNDIRECTED', confidence: 57, description: 'Fictional co-observation', source: 'K. Varga', target: 'Harbour View handoff' },
  { type: 'RELATED_TO', direction: 'UNDIRECTED', confidence: 33, description: 'Fictional loose link', source: 'Invoice_1042.pdf', target: 'Meridian Ventures Ltd' },
  { type: 'LOCATED_AT', direction: 'UNDIRECTED', confidence: 45, description: 'Fictional geolocation', source: 'Registry filing anomaly', target: 'Ostrow Transport Group' },
];

interface SeedEvidence {
  title: string;
  description?: string;
  source?: string;
  type: EvidenceType;
  status: EvidenceStatus;
  classification: Classification;
  hash?: string;
  mimeType?: string;
  size?: number;
  reference?: string;
  investigationIndex: number;
}

const EVIDENCE: SeedEvidence[] = [
  { title: 'Beacon traffic log (demo)', description: 'Fictional network beacon log', source: 'pcap', type: 'LOG', status: 'AVAILABLE', classification: 'CONFIDENTIAL', hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08', mimeType: 'text/plain', size: 145_920, reference: 'obs-2026-0401', investigationIndex: 0 },
  { title: 'Meridian invoice artifact (demo)', description: 'Fictional invoice PDF artifact', source: 'web', type: 'WEB_ARTIFACT', status: 'AVAILABLE', classification: 'INTERNAL', hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', mimeType: 'application/pdf', size: 84_210, reference: 'https://meridian-ventures.example/invoice/1042', investigationIndex: 0 },
  { title: 'Ostrow freight manifest (demo)', description: 'Fictional shipping manifest', source: 'email', type: 'DOCUMENT', status: 'AVAILABLE', classification: 'INTERNAL', hash: '5d41402abc4b2a76b9719d911017c592', mimeType: 'application/pdf', size: 12_044, reference: 'MAN-OST-882', investigationIndex: 1 },
  { title: 'Harbour View observation log (demo)', description: 'Fictional surveillance log excerpt', source: 'field', type: 'OTHER', status: 'AVAILABLE', classification: 'CONFIDENTIAL', reference: 'OBS-2026-0330', investigationIndex: 0 },
  { title: 'Registry filing snapshot (demo)', description: 'Fictional corporate registry capture', source: 'web', type: 'WEB_ARTIFACT', status: 'RESTRICTED', classification: 'RESTRICTED', hash: '098f6bcd4621d373cade4e832627b4f6', mimeType: 'text/html', size: 32_768, reference: 'REG-OST-2026', investigationIndex: 1 },
  { title: 'Signal baseband capture (demo)', description: 'Fictional RF sample metadata', source: 'sensor', type: 'DATASET', status: 'PENDING', classification: 'CONFIDENTIAL', mimeType: 'application/octet-stream', size: 4_194_304, investigationIndex: 2 },
  { title: 'Comms interception index (demo)', description: 'Fictional index of intercepted metadata', source: 'sensor', type: 'DATASET', status: 'AVAILABLE', classification: 'RESTRICTED', hash: 'a376804e2fea01a8f48a3c2a1c0b6a3b4c0b1a2e4f5d6a7b8c9d0e1f2a3b4c5d6', mimeType: 'application/json', size: 2048, investigationIndex: 0 },
  { title: 'Domains WHOIS archive (demo)', description: 'Fictional WHOIS snapshot', source: 'web', type: 'LOG', status: 'AVAILABLE', classification: 'INTERNAL', reference: 'whois-2026-0412', investigationIndex: 1 },
  { title: 'Email envelope capture (demo)', description: 'Fictional email metadata', source: 'tool', type: 'LOG', status: 'RESTRICTED', classification: 'RESTRICTED', hash: 'b1f94a4fbb207d7269798a1ec7f8bba1', mimeType: 'text/plain', investigationIndex: 0 },
  { title: 'Camera frame set (demo)', description: 'Fictional location imagery IDs', source: 'field', type: 'IMAGE', status: 'PENDING', classification: 'CONFIDENTIAL', mimeType: 'image/jpeg', size: 2_097_152, reference: 'FRAME-0330', investigationIndex: 0 },
  { title: 'Peering notes (demo)', description: 'Analyst working notes on host pairings', source: 'analyst', type: 'OTHER', status: 'AVAILABLE', classification: 'INTERNAL', investigationIndex: 1 },
  { title: 'Cross-check ledger (demo)', description: 'Fictional reconciliation dataset', source: 'tool', type: 'DATASET', status: 'AVAILABLE', classification: 'INTERNAL', hash: 'c7f8f5a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1', mimeType: 'text/csv', size: 65_536, investigationIndex: 0 },
];

interface SeedNote {
  title: string;
  content: string;
  visibility: 'INVESTIGATION' | 'PRIVATE';
  investigationIndex: number;
  authoredByEmail: string;
}

const NOTES: SeedNote[] = [
  { title: 'Initial network hypothesis', content: 'Fictional note: Meridian-related actors re-use the same example infrastructure markers.', visibility: 'INVESTIGATION', investigationIndex: 0, authoredByEmail: ADMIN_EMAIL },
  { title: 'Varga pattern-of-life sketch', content: 'Fictional: movement overlapping harbour district windows.', visibility: 'PRIVATE', investigationIndex: 0, authoredByEmail: ANALYST_EMAIL },
  { title: 'Timeline anchor', content: 'Fictional note: Harbour View handoff observed in window 2026-03-29/31.', visibility: 'INVESTIGATION', investigationIndex: 0, authoredByEmail: ADMIN_EMAIL },
  { title: 'Ostrow freight questions', content: 'Fictional: which shippers route through Gdansk.', visibility: 'INVESTIGATION', investigationIndex: 1, authoredByEmail: 'investigator@atlas.demo' },
  { title: 'Domain registration pattern', content: 'Fictional: domains registered in tight cycle, then parked.', visibility: 'INVESTIGATION', investigationIndex: 1, authoredByEmail: ANALYST_EMAIL },
  { title: 'Private stash — raw leads', content: 'Fictional private working leads.', visibility: 'PRIVATE', investigationIndex: 1, authoredByEmail: 'investigator@atlas.demo' },
  { title: 'Signal collection plan', content: 'Fictional: baseline collection plan for comms node.', visibility: 'INVESTIGATION', investigationIndex: 2, authoredByEmail: ANALYST_EMAIL },
  { title: 'Scope review', content: 'Fictional: reconfirm lawful scope before further collection.', visibility: 'INVESTIGATION', investigationIndex: 2, authoredByEmail: ADMIN_EMAIL },
  { title: 'Contact level assessment', content: 'Fictional: Moreau confidence revised after new material.', visibility: 'INVESTIGATION', investigationIndex: 0, authoredByEmail: ANALYST_EMAIL },
  { title: 'Fischer profile notes', content: 'Fictional: profile drafted for Ostrow logistics figure.', visibility: 'PRIVATE', investigationIndex: 1, authoredByEmail: ADMIN_EMAIL },
  { title: 'Registry filing follow-up', content: 'Fictional: filing anomaly needs registry pull.', visibility: 'INVESTIGATION', investigationIndex: 1, authoredByEmail: 'investigator@atlas.demo' },
  { title: 'Signal tasking', content: 'Fictional: task assigned to prepare collection matrix.', visibility: 'INVESTIGATION', investigationIndex: 2, authoredByEmail: ANALYST_EMAIL },
];

interface SeedTask {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: InvestigationPriority;
  assigneeEmail: string;
  dueAtOffsetDays: number;
  investigationIndex: number;
}

const TASKS: SeedTask[] = [
  { title: 'Pull WHOIS for all example domains', description: 'Fictional: capture registration snapshots.', status: 'DONE', priority: 'HIGH', assigneeEmail: 'investigator@atlas.demo', dueAtOffsetDays: -12, investigationIndex: 1 },
  { title: 'Correlate beacon timestamps', description: 'Fictional: align with transport manifests.', status: 'IN_PROGRESS', priority: 'HIGH', assigneeEmail: ANALYST_EMAIL, dueAtOffsetDays: 3, investigationIndex: 0 },
  { title: 'Draft Varga profile', description: 'Fictional: consolidate open-source leads.', status: 'IN_PROGRESS', priority: 'MEDIUM', assigneeEmail: ADMIN_EMAIL, dueAtOffsetDays: 6, investigationIndex: 0 },
  { title: 'Registry pull for Ostrow', description: 'Fictional: request registry snapshot.', status: 'TODO', priority: 'MEDIUM', assigneeEmail: 'investigator@atlas.demo', dueAtOffsetDays: 9, investigationIndex: 1 },
  { title: 'Signal collection matrix', description: 'Fictional: prep collection plan.', status: 'BLOCKED', priority: 'LOW', assigneeEmail: ANALYST_EMAIL, dueAtOffsetDays: 14, investigationIndex: 2 },
  { title: 'Validate invoice hash', description: 'Fictional: independent hash verification.', status: 'DONE', priority: 'MEDIUM', assigneeEmail: ANALYST_EMAIL, dueAtOffsetDays: -4, investigationIndex: 0 },
  { title: 'Cost-of-traffic model', description: 'Fictional: estimate shipping corridor use.', status: 'TODO', priority: 'LOW', assigneeEmail: ADMIN_EMAIL, dueAtOffsetDays: 11, investigationIndex: 1 },
  { title: 'Review scope memo', description: 'Fictional: confirm lawful basis.', status: 'DONE', priority: 'CRITICAL', assigneeEmail: ADMIN_EMAIL, dueAtOffsetDays: -2, investigationIndex: 2 },
  { title: 'Chronology rebuild', description: 'Fictional: assemble event order.', status: 'IN_PROGRESS', priority: 'MEDIUM', assigneeEmail: 'investigator@atlas.demo', dueAtOffsetDays: 5, investigationIndex: 0 },
  { title: 'Alt comms-node attribution', description: 'Fictional: tie node to operator.', status: 'TODO', priority: 'MEDIUM', assigneeEmail: 'investigator@atlas.demo', dueAtOffsetDays: 8, investigationIndex: 0 },
  { title: 'Domain parking check', description: 'Fictional: verify parking state.', status: 'DONE', priority: 'LOW', assigneeEmail: ANALYST_EMAIL, dueAtOffsetDays: -7, investigationIndex: 1 },
  { title: 'Signal sample QC', description: 'Fictional: validate capture integrity.', status: 'TODO', priority: 'LOW', assigneeEmail: ANALYST_EMAIL, dueAtOffsetDays: 12, investigationIndex: 2 },
];

interface EntityRef {
  id: string;
  investigationId: string;
}

const userIdByEmail = new Map<string, string>();

async function main(): Promise<void> {
  const org = await prisma.organization.upsert({
    where: { slug: DEMO_ORG_SLUG },
    update: { name: 'ATLAS Demo Organization', isDemo: true },
    create: {
      name: 'ATLAS Demo Organization',
      slug: DEMO_ORG_SLUG,
      isDemo: true,
      settings: { demo: true, region: 'EU-1' },
    },
  });

  await clearDemoChildren(org.id);
  await seedUsers(org.id);

  const workspace = await prisma.workspace.create({
    data: {
      name: DEMO_WORKSPACE.name,
      description: DEMO_WORKSPACE.description,
      organizationId: org.id,
      createdById: userId(ADMIN_EMAIL),
    },
  });

  const adminId = userId(ADMIN_EMAIL);
  const analystId = userId(ANALYST_EMAIL);

  // Investigations + members + activity
  const investigationIds: string[] = [];
  for (const inv of INVESTIGATIONS) {
    const record = await prisma.investigation.create({
      data: {
        title: inv.title,
        description: inv.description,
        status: inv.status,
        priority: inv.priority,
        classification: inv.classification,
        organizationId: org.id,
        workspaceId: workspace.id,
        ownerId: adminId,
        createdById: adminId,
      },
    });
    investigationIds.push(record.id);

    const memberRoles: Array<[string, InvestigationMemberRole]> = [
      [ADMIN_EMAIL, 'LEAD'],
      [ANALYST_EMAIL, 'ANALYST'],
      ['investigator@atlas.demo', 'CONTRIBUTOR'],
      ['viewer@atlas.demo', 'VIEWER'],
    ];
    for (const [email, role] of memberRoles) {
      await prisma.investigationMember.create({
        data: {
          investigationId: record.id,
          userId: userId(email),
          role,
          createdById: adminId,
        },
      });
    }

    await prisma.activityEvent.create({
      data: {
        type: 'INVESTIGATION_CREATED',
        message: `Investigation "${record.title}" created`,
        investigationId: record.id,
        workspaceId: workspace.id,
        organizationId: org.id,
        userId: adminId,
        metadata: { demo: true },
      },
    });
  }

  // Entities (Alpha + Beta sets)
  const entityRefs = new Map<string, EntityRef>();
  await seedEntities(org.id, workspace.id, investigationIds[0] ?? '', ENTITIES_ALPHA, analystId, entityRefs);
  await seedEntities(org.id, workspace.id, investigationIds[1] ?? '', ENTITIES_BETA, analystId, entityRefs);

  // Relationships (investigation inferred from endpoints)
  for (const rel of RELATIONSHIPS) {
    const sourceId = resolveEntity(entityRefs, rel.source);
    const targetId = resolveEntity(entityRefs, rel.target);
    if (!sourceId || !targetId) {
      // eslint-disable-next-line no-console
      console.warn(`seed: skipped relationship ${rel.source} -> ${rel.target} (missing entity)`);
      continue;
    }
    const sourceRef = entityRefs.get(rel.source.toLowerCase());
    await prisma.relationship.create({
      data: {
        kind: rel.type,
        direction: rel.direction,
        confidence: rel.confidence,
        description: rel.description,
        organizationId: org.id,
        investigationId: sourceRef?.investigationId ?? null,
        sourceId,
        targetId,
        createdById: analystId,
        metadata: { demo: true },
      },
    });
  }

  // Evidence
  for (const ev of EVIDENCE) {
    await prisma.evidence.create({
      data: {
        name: ev.title,
        description: ev.description,
        source: ev.source,
        kind: ev.type,
        status: ev.status,
        classification: ev.classification,
        hash: ev.hash,
        mimeType: ev.mimeType,
        size: ev.size,
        reference: ev.reference,
        collectedAt: new Date('2026-03-30T10:00:00Z'),
        investigationId: investigationIds[ev.investigationIndex] ?? null,
        organizationId: org.id,
        createdById: analystId,
      },
    });
  }

  // Notes
  for (const note of NOTES) {
    await prisma.note.create({
      data: {
        title: note.title,
        body: note.content,
        visibility: note.visibility,
        investigationId: investigationIds[note.investigationIndex] ?? null,
        organizationId: org.id,
        createdById: userId(note.authoredByEmail),
      },
    });
  }

  // Tasks
  for (const task of TASKS) {
    await prisma.task.create({
      data: {
        investigationId: investigationIds[task.investigationIndex] ?? '',
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assigneeId: userId(task.assigneeEmail),
        createdById: adminId,
        dueAt: new Date(Date.now() + task.dueAtOffsetDays * 86_400_000),
      },
    });
  }

  // A little extra activity color
  await prisma.activityEvent.createMany({
    data: [
      { type: 'ENTITY_CREATED', message: 'Entity "Meridian Ventures Ltd" discovered', investigationId: investigationIds[0] ?? null, workspaceId: workspace.id, organizationId: org.id, userId: analystId, metadata: { demo: true } },
      { type: 'RELATIONSHIP_CREATED', message: 'Relationship "USES" created', investigationId: investigationIds[0] ?? null, workspaceId: workspace.id, organizationId: org.id, userId: analystId, metadata: { demo: true } },
      { type: 'EVIDENCE_ADDED', message: 'Evidence "Beacon traffic log (demo)" added', investigationId: investigationIds[0] ?? null, workspaceId: workspace.id, organizationId: org.id, userId: analystId, metadata: { demo: true } },
    ],
  });

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({
      level: 'info',
      message: 'ATLAS Phase 2 demo seed complete',
      organization: DEMO_ORG_SLUG,
      workspace: workspace.id,
      investigations: investigationIds.length,
      entities: entityRefs.size,
      relationships: RELATIONSHIPS.length,
      evidence: EVIDENCE.length,
      notes: NOTES.length,
      tasks: TASKS.length,
    }),
  );
}

async function seedEntities(
  orgId: string,
  workspaceId: string,
  investigationId: string,
  seeds: SeedEntity[],
  createdById: string,
  refs: Map<string, EntityRef>,
): Promise<void> {
  for (const seed of seeds) {
    const record = await prisma.entity.create({
      data: {
        type: seed.type,
        name: seed.name,
        displayName: seed.name,
        description: seed.description,
        status: 'ACTIVE',
        confidence: seed.confidence,
        uri: seed.uri,
        tags: seed.tags,
        latitude: seed.latitude ?? null,
        longitude: seed.longitude ?? null,
        organizationId: orgId,
        workspaceId,
        investigationId,
        createdById,
      },
    });
    refs.set(seed.name.toLowerCase(), { id: record.id, investigationId });
  }
}

function resolveEntity(refs: Map<string, EntityRef>, name: string): string | undefined {
  const key = name.toLowerCase();
  const direct = refs.get(key);
  if (direct) return direct.id;
  for (const [candidate, entry] of refs) {
    if (candidate.includes(key) || key.includes(candidate)) return entry.id;
  }
  return undefined;
}

async function clearDemoChildren(orgId: string): Promise<void> {
  // Child-first order (FK dependencies removed before parents).
  await prisma.report.deleteMany({ where: { organizationId: orgId } });
  await prisma.timelineEvent.deleteMany({ where: { organizationId: orgId } });
  await prisma.note.deleteMany({ where: { organizationId: orgId } });
  await prisma.evidence.deleteMany({ where: { organizationId: orgId } });
  await prisma.relationship.deleteMany({ where: { organizationId: orgId } });
  await prisma.entity.deleteMany({ where: { organizationId: orgId } });
  await prisma.investigation.deleteMany({ where: { organizationId: orgId } }); // cascades members + tasks
  await prisma.activityEvent.deleteMany({ where: { organizationId: orgId } });
  await prisma.workspace.deleteMany({ where: { organizationId: orgId } });
}

async function seedUsers(orgId: string): Promise<void> {
  for (const u of FICTIONAL_USERS) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { displayName: u.displayName, isActive: true, passwordHash: PASSWORD_HASH },
      create: { email: u.email, displayName: u.displayName, passwordHash: PASSWORD_HASH },
    });
    userIdByEmail.set(u.email, user.id);
    await prisma.membership.upsert({
      where: { userId_organizationId: { userId: user.id, organizationId: orgId } },
      update: { role: u.role },
      create: { userId: user.id, organizationId: orgId, role: u.role },
    });
  }
}

function userId(email: string): string {
  const id = userIdByEmail.get(email);
  if (!id) throw new Error(`Demo user "${email}" not seeded`);
  return id;
}

main()
  .catch((error: unknown) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());