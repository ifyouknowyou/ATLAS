import { Injectable } from '@nestjs/common';
import type { ReportSection } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';
import { ReportAccessService } from './report-access.service';
import { ReportBuilderService } from './report-builder.service';
import { AiService } from '../ai/ai.service';

/**
 * AI-assisted report generation + review (§27, §47).
 *
 * All AI output is marked aiGenerated and aiStatus='REVIEW_REQUIRED'; the
 * report is flagged and can never be published until a human verifies it.
 * Review suggestions are advisory — a human makes the final call.
 */
@Injectable()
export class AiReportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ReportAccessService,
    private readonly builder: ReportBuilderService,
    private readonly ai: AiService,
  ) {}

  async generate(
    principal: AuthenticatedPrincipal,
    reportId: string,
    sectionKey?: string,
    prompt?: string,
  ) {
    await this.access.requireReport(principal, reportId, 'edit');
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
      include: { sections: { orderBy: { position: 'asc' } } },
    });
    if (!report) throw new Error('Report not found');

    const context = await this.buildContext(principal, reportId);
    const userPrompt =
      prompt ??
      (sectionKey
        ? `Write the "${sectionKey}" section of an intelligence report for this investigation.`
        : 'Write an executive summary for this intelligence report.');

    const reply = await this.ai.chat(principal, {
      message: userPrompt,
      investigationId: report.investigationId ?? undefined,
    });
    await this.ensureSectionAndBlock(principal, reportId, sectionKey, report, reply.reply);

    await this.prisma.report.update({
      where: { id: reportId },
      data: { aiGenerated: true, aiStatus: 'REVIEW_REQUIRED' },
    });
    return { blockType: 'AI_SUMMARY', aiStatus: 'REVIEW_REQUIRED', text: reply.reply, context };
  }

  async reviewReport(principal: AuthenticatedPrincipal, reportId: string) {
    await this.access.requireReport(principal, reportId, 'read');
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
      include: { sections: { include: { blocks: true } }, citations: true },
    });
    if (!report) throw new Error('Report not found');

    const flags: Array<{
      code: string;
      message: string;
      blockId?: string;
      suggestion?: string;
    }> = [];
    // Heuristics: missing citations, unverified AI, broken references, and
    // obvious gaps the model can detect. A human makes the final decision.
    for (const section of report.sections) {
      for (const block of section.blocks) {
        if (block.aiGenerated && block.aiStatus === 'REVIEW_REQUIRED') {
          flags.push({
            code: 'UNVERIFIED_AI',
            message: `AI-generated content in "${section.title}" is not yet verified`,
            blockId: block.id,
            suggestion: 'Review and verify before publishing',
          });
        }
        const content = (block.content ?? {}) as Record<string, unknown>;
        const text = String(content.text ?? content.heading ?? '');
        if (text.length > 0 && /\d{4}-\d{2}-\d{2}/.test(text) && !block.dataRef) {
          flags.push({
            code: 'MISSING_EVIDENCE_REF',
            message: `Section "${section.title}" references a date without a linked source`,
            blockId: block.id,
          });
        }
      }
    }
    if (report.citations.length === 0 && report.sections.length > 2) {
      flags.push({
        code: 'MISSING_CITATION',
        message: 'Report has no citations',
        suggestion: 'Attach evidence/entity citations before publishing',
      });
    }
    return flags;
  }

  private async buildContext(
    principal: AuthenticatedPrincipal,
    reportId: string,
  ): Promise<string> {
    return reportId;
  }

  private async ensureSectionAndBlock(
    principal: AuthenticatedPrincipal,
    reportId: string,
    sectionKey: string | undefined,
    report: { sections: ReportSection[] },
    text: string,
  ): Promise<void> {
    const target =
      report.sections.find((s) => s.key === sectionKey) ??
      report.sections.find((s) => s.key === 'executive-summary') ??
      report.sections[0];
    if (!target) {
      // No sections yet — fall back to create one.
      const created = await this.builder.addSection(principal, reportId, {
        key: sectionKey ?? 'ai-analysis',
        title: sectionKey ?? 'AI Analysis',
        isRequired: false,
      });
      await this.builder.addBlock(principal, reportId, created.id, {
        type: 'AI_SUMMARY',
        content: { text },
        aiGenerated: true,
      });
      return;
    }
    await this.builder.addBlock(principal, reportId, target.id, {
      type: 'AI_SUMMARY',
      content: { text },
      aiGenerated: true,
    });
  }
}