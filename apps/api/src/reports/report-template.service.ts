import { Injectable } from '@nestjs/common';
import type { ReportTemplateKind } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';
import { ReportAccessService } from './report-access.service';

interface TemplateSectionSeed {
  key: string;
  title: string;
  isRequired: boolean;
}

interface TemplateSeed {
  kind: ReportTemplateKind;
  name: string;
  description: string;
  sections: TemplateSectionSeed[];
}

/**
 * Built-in report templates (§26). Seeded as system/public templates accessible
 * to every tenant; orgs can clone or extend them. Templates define sections,
 * block kinds, required sections, and default styling hints.
 */
const SYSTEM_TEMPLATES: TemplateSeed[] = [
  {
    kind: 'INVESTIGATION_REPORT',
    name: 'Investigation Report',
    description: 'Full investigation write-up with evidence, timeline and findings.',
    sections: [
      { key: 'cover', title: 'Cover', isRequired: true },
      { key: 'executive-summary', title: 'Executive Summary', isRequired: true },
      { key: 'overview', title: 'Investigation Overview', isRequired: true },
      { key: 'entities', title: 'Entities', isRequired: false },
      { key: 'relationships', title: 'Relationships', isRequired: false },
      { key: 'evidence', title: 'Evidence', isRequired: true },
      { key: 'timeline', title: 'Timeline', isRequired: false },
      { key: 'geographic', title: 'Geographic Analysis', isRequired: false },
      { key: 'findings', title: 'Findings', isRequired: true },
      { key: 'ai-analysis', title: 'AI Analysis', isRequired: false },
      { key: 'limitations', title: 'Limitations', isRequired: false },
      { key: 'sources', title: 'Sources', isRequired: true },
    ],
  },
  {
    kind: 'EXECUTIVE_INTELLIGENCE_BRIEF',
    name: 'Executive Intelligence Brief',
    description: 'Condensed high-level brief for leadership.',
    sections: [
      { key: 'cover', title: 'Cover', isRequired: true },
      { key: 'key-judgments', title: 'Key Judgments', isRequired: true },
      { key: 'situation', title: 'Situation', isRequired: true },
      { key: 'evidence', title: 'Evidence Highlights', isRequired: false },
      { key: 'open-questions', title: 'Open Questions', isRequired: false },
      { key: 'sources', title: 'Sources', isRequired: true },
    ],
  },
  {
    kind: 'EVIDENCE_SUMMARY',
    name: 'Evidence Summary',
    description: 'Formal summary of evidence holdings and integrity.',
    sections: [
      { key: 'cover', title: 'Cover', isRequired: true },
      { key: 'summary', title: 'Summary', isRequired: true },
      { key: 'evidence', title: 'Evidence', isRequired: true },
      { key: 'integrity', title: 'Integrity & Chain of Custody', isRequired: false },
      { key: 'sources', title: 'Sources', isRequired: true },
    ],
  },
  {
    kind: 'ENTITY_PROFILE',
    name: 'Entity Profile',
    description: 'A single-entity intelligence profile.',
    sections: [
      { key: 'cover', title: 'Cover', isRequired: true },
      { key: 'entity-summary', title: 'Entity Summary', isRequired: true },
      { key: 'attributes', title: 'Attributes', isRequired: false },
      { key: 'relationships', title: 'Relationships', isRequired: false },
      { key: 'activity', title: 'Activity Timeline', isRequired: false },
      { key: 'assessment', title: 'Assessment', isRequired: false },
      { key: 'sources', title: 'Sources', isRequired: true },
    ],
  },
  {
    kind: 'INCIDENT_ANALYSIS',
    name: 'Incident Analysis',
    description: 'Root-cause and timeline analysis of an incident.',
    sections: [
      { key: 'cover', title: 'Cover', isRequired: true },
      { key: 'incident-overview', title: 'Incident Overview', isRequired: true },
      { key: 'timeline', title: 'Timeline', isRequired: true },
      { key: 'impact', title: 'Impact', isRequired: false },
      { key: 'evidence', title: 'Evidence', isRequired: true },
      { key: 'root-cause', title: 'Root Cause', isRequired: false },
      { key: 'recommendations', title: 'Recommendations', isRequired: false },
      { key: 'sources', title: 'Sources', isRequired: true },
    ],
  },
  {
    kind: 'RESEARCH_SUMMARY',
    name: 'Research Summary',
    description: 'Open-source / research findings summary.',
    sections: [
      { key: 'cover', title: 'Cover', isRequired: true },
      { key: 'research-questions', title: 'Research Questions', isRequired: false },
      { key: 'methodology', title: 'Methodology', isRequired: false },
      { key: 'findings', title: 'Findings', isRequired: true },
      { key: 'limitations', title: 'Limitations', isRequired: false },
      { key: 'sources', title: 'Sources', isRequired: true },
    ],
  },
];

@Injectable()
export class ReportTemplateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ReportAccessService,
  ) {}

  /** Ensures system templates exist for a tenant (org-scoped, isSystem=true). */
  async ensureSystemTemplates(organizationId: string): Promise<void> {
    const existing = await this.prisma.reportTemplate.findMany({
      where: { organizationId, isSystem: true },
      select: { kind: true },
    });
    const have = new Set(existing.map((e) => e.kind));
    const missing = SYSTEM_TEMPLATES.filter((t) => !have.has(t.kind));
    for (const t of missing) {
      await this.prisma.reportTemplate.create({
        data: {
          name: t.name,
          kind: t.kind,
          description: t.description,
          sections: t.sections as never,
          isSystem: true,
          organizationId,
        },
      });
    }
  }

  async list(organizationId: string): Promise<unknown[]> {
    // Ensure system templates exist for the tenant on first access.
    await this.ensureSystemTemplates(organizationId);
    return this.prisma.reportTemplate.findMany({
      where: { organizationId },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    });
  }

  async get(organizationId: string, id: string): Promise<unknown> {
    return this.prisma.reportTemplate.findFirst({ where: { id, organizationId } });
  }

  /** Creates a report + its sections from a template (§26). */
  async hydrateReport(
    principal: AuthenticatedPrincipal,
    reportId: string,
    templateId: string,
  ): Promise<void> {
    await this.access.requireReport(principal, reportId, 'edit');
    const template = await this.prisma.reportTemplate.findFirst({
      where: { id: templateId, organizationId: principal.organizationId },
    });
    if (!template) throw new Error('Template not found');

    const sections = (template.sections as unknown as TemplateSectionSeed[] | null) ?? [];
    for (let i = 0; i < sections.length; i += 1) {
      const s = sections[i];
      await this.prisma.reportSection.create({
        data: {
          reportId,
          key: s.key,
          title: s.title,
          position: i,
          isRequired: s.isRequired,
        },
      });
    }
    await this.prisma.report.update({
      where: { id: reportId },
      data: {
        templateId,
        templateKind: template.kind,
      },
    });
  }
}