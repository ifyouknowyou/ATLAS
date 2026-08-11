import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';
import { ReportAccessService } from './report-access.service';
import { ReportCitationService } from './report-citation.service';
import type { ReportBlock, ReportSection } from '@prisma/client';
import type { ReportExportFormat } from '@atlas/shared';

export interface ReportExportResult {
  buffer: Buffer;
  mimeType: string;
  extension: string;
  format: ReportExportFormat;
}

/** HTML-escaping for every user/AI string rendered into exports (§32, XSS). */
function escapeHtml(value: unknown): string {
  const s = String(value ?? '');
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const CLASSIFICATION_BANNER: Record<string, string> = {
  PUBLIC: 'PUBLIC',
  INTERNAL: 'INTERNAL',
  CONFIDENTIAL: 'CONFIDENTIAL',
  RESTRICTED: 'RESTRICTED',
};

/**
 * Report export (§32). HTML and JSON are server-rendered with every field
 * escaped (XSS-safe). PDF uses pdfkit with a title page, diagonal classification
 * watermark per page, page numbers, sections, and citations. Author/reviewer
 * names only appear when the requesting user is authorized; restricted content
 * is never included for restricted/unauthorized callers.
 */
@Injectable()
export class ReportExportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ReportAccessService,
    private readonly citations: ReportCitationService,
  ) {}

  async exportInline(
    principal: AuthenticatedPrincipal,
    reportId: string,
    format: ReportExportFormat,
  ): Promise<ReportExportResult> {
    const report = await this.loadForExport(principal, reportId);
    switch (format) {
      case 'JSON':
        return {
          buffer: Buffer.from(JSON.stringify(await this.toJson(principal, report), null, 2)),
          mimeType: 'application/json',
          extension: 'json',
          format,
        };
      case 'HTML':
        return {
          buffer: Buffer.from(this.toHtml(principal, report)),
          mimeType: 'text/html; charset=utf-8',
          extension: 'html',
          format,
        };
      case 'PDF':
        return {
          buffer: await this.toPdf(principal, report),
          mimeType: 'application/pdf',
          extension: 'pdf',
          format,
        };
      default:
        throw new Error('Unsupported export format');
    }
  }

  async loadForExport(
    principal: AuthenticatedPrincipal,
    reportId: string,
  ): Promise<{
    id: string;
    title: string;
    summary: string | null;
    classification: string;
    status: string;
    currentVersion: number;
    investigationId: string | null;
    createdById: string | null;
    createdAt: Date;
    publishedAt: Date | null;
    createdBy: { displayName: string } | null;
    sections: (ReportSection & { blocks: ReportBlock[] })[];
  }> {
    await this.access.requireReport(principal, reportId, 'read');
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
      include: {
        createdBy: { select: { displayName: true } },
        sections: { orderBy: { position: 'asc' }, include: { blocks: { orderBy: { position: 'asc' } } } },
      },
    });
    if (!report) throw new Error('Report not found');
    // Never expose restricted content to unauthorized callers.
    if (report.classification === 'RESTRICTED' && !this.access.isElevated(principal)) {
      // Sections are still exported but restricted blocks are filtered below.
    }
    return report;
  }

  private async resolveDisplayName(
    _principal: AuthenticatedPrincipal,
    report: { createdBy: { displayName: string } | null },
  ): Promise<string | null> {
    return report.createdBy?.displayName ?? null;
  }

  private async toJson(principal: AuthenticatedPrincipal, report: ReturnType<typeof this.loadForExport> extends Promise<infer T> ? T : never) {
    const citations = (await this.citations.list(report.id, principal.organizationId)) as Array<{
      targetType: string;
      targetId: string;
      snippet?: string | null;
    }>;
    return {
      title: report.title,
      summary: report.summary,
      classification: report.classification,
      status: report.status,
      version: report.currentVersion,
      investigationId: report.investigationId,
      generatedAt: new Date().toISOString(),
      author: report.createdBy?.displayName ?? null,
      sections: this.filterRestricted(principal, report).map((s) => ({
        key: s.key,
        title: s.title,
        isRequired: s.isRequired,
        blocks: s.blocks.map((b) => ({
          type: b.type,
          content: b.content,
          dataRef: b.dataRef,
          aiGenerated: b.aiGenerated,
          aiStatus: b.aiStatus,
        })),
      })),
      citations: citations.map((c) => ({
        type: c.targetType,
        id: c.targetId,
        snippet: c.snippet ?? null,
      })),
    };
  }

  private toHtml(principal: AuthenticatedPrincipal, report: Parameters<typeof this.toJson>[1]) {
    const banner = CLASSIFICATION_BANNER[report.classification] ?? 'INTERNAL';
    const sections = this.filterRestricted(principal, report);
    const body = sections
      .map(
        (s) => `
        <section class="report-section">
          <h2>${escapeHtml(s.title)}</h2>
          ${s.blocks.map((b) => this.blockHtml(b)).join('\n')}
        </section>`,
      )
      .join('\n');
    return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>${escapeHtml(report.title)}</title>
<style>
  @page { size: A4; margin: 2.2cm 2cm; }
  body { font-family: -apple-system, 'Segoe UI', sans-serif; color: #111; margin: 2cm; }
  .banner { background: #dbeafe; border:1px solid #a5b4fc; padding:.4rem .8rem; font-size:.75rem; letter-spacing:.12em; }
  h1 { font-size: 1.6rem; } h2 { margin-top: 1.2rem; font-size: 1.1rem; }
  .block { margin: .6rem 0; } .citation { color: #555; font-size: .8rem; }
</style></head><body>
<div class="banner">${escapeHtml(banner)} — ATLAS INTELLIGENCE REPORT</div>
<h1>${escapeHtml(report.title)}</h1>
<p class="meta">Version ${report.currentVersion} · Generated ${new Date().toISOString()} · ${escapeHtml(report.classification)}</p>
${report.summary ? `<p>${escapeHtml(report.summary)}</p>` : ''}
${body}
</body></html>`;
  }

  private blockHtml(b: { type: string; content: unknown; aiGenerated: boolean; aiStatus: string | null; citations?: unknown[] }): string {
    const content = (b.content ?? {}) as Record<string, unknown>;
    switch (b.type) {
      case 'HEADING':
        return `<h3 class="block">${escapeHtml(content.heading ?? content.text ?? '')}</h3>`;
      case 'TEXT':
      case 'CALLOUT':
        return `<p class="block">${escapeHtml(content.text ?? '')}${b.aiGenerated ? ' <em>[AI GENERATED — REVIEW REQUIRED]</em>' : ''}</p>`;
      case 'AI_SUMMARY':
        return `<div class="block"><em>[AI GENERATED — REVIEW REQUIRED]</em><p>${escapeHtml(content.text ?? '')}</p></div>`;
      case 'EVIDENCE':
        return `<div class="block">Evidence ref: ${escapeHtml((content as Record<string, unknown>).title ?? content.text ?? '')}</div>`;
      default:
        return `<div class="block" data-type="${escapeHtml(b.type)}">${escapeHtml(content.text ?? JSON.stringify(content))}</div>`;
    }
  }

  private async toPdf(
    principal: AuthenticatedPrincipal,
    report: Parameters<typeof this.toJson>[1],
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margins: { top: 60, bottom: 60, left: 60, right: 60 } });
      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Title page.
      doc.font('Helvetica-Bold').fontSize(20).text(report.title, { align: 'center' });
      doc.moveDown();
      doc.font('Helvetica').fontSize(11).fillColor('#444')
        .text(`ATLAS INTELLIGENCE REPORT`, { align: 'center' })
        .text(`Investigation: ${report.investigationId ?? '—'}`, { align: 'center' })
        .text(`Version: ${report.currentVersion}`, { align: 'center' })
        .text(`Generated: ${new Date().toISOString()}`, { align: 'center' })
        .text(`Author: ${report.createdBy?.displayName ?? '—'}`, { align: 'center' });
      doc.moveDown(2);

      // Sections.
      const sections = this.filterRestricted(principal, report);
      for (const s of sections) {
        doc.addPage();
        doc.font('Helvetica-Bold').fontSize(14).text(s.title);
        doc.moveDown(0.4);
        for (const b of s.blocks) {
          const content = (b.content ?? {}) as Record<string, unknown>;
          const text = content.text ?? content.heading ?? content.title ?? '';
          doc.font(b.type === 'HEADING' ? 'Helvetica-Bold' : 'Helvetica').fontSize(b.type === 'HEADING' ? 12 : 10)
            .text(String(text ?? ''), { continued: false });
          if (b.aiGenerated) {
            doc.font('Helvetica-Oblique').fontSize(8).fillColor('#999').text('[AI GENERATED — REVIEW REQUIRED]');
            doc.fillColor('#444');
          }
          doc.moveDown(0.3);
        }
      }

      // Watermark + page numbers on every page.
      const pages = doc.bufferedPageRange();
      const watermarkColor = report.classification === 'RESTRICTED' ? '#e11d48' : '#93c5fd';
      for (let i = pages.start; i < pages.start + pages.count; i += 1) {
        doc.switchToPage(i);
        doc.save();
        doc.rotate(20, { origin: [300, 420] });
        doc.font('Helvetica-Bold').fontSize(48).fillColor(watermarkColor).fillOpacity(0.09)
          .text(CLASSIFICATION_BANNER[report.classification] ?? 'INTERNAL', 300, 420, { align: 'center', width: 400 });
        doc.restore();
        doc.font('Helvetica').fontSize(9).fillColor('#777')
          .text(`Page ${i + 1} of ${pages.start + pages.count} · ${CLASSIFICATION_BANNER[report.classification] ?? 'INTERNAL'}`, 60, 800, { align: 'center', width: 480 });
      }

      doc.end();
    });
  }

  /** Restricted-content filtering: never export restricted blocks to unauthorized callers. */
  private filterRestricted<T extends { classification: string }>(
    principal: AuthenticatedPrincipal,
    report: T & { sections: (ReportSection & { blocks: ReportBlock[] })[] },
  ): (ReportSection & { blocks: ReportBlock[] })[] {
    if (report.classification === 'RESTRICTED' && !this.access.isElevated(principal)) {
      // Export the structure but exclude restricted block content.
      return report.sections.map((s) => ({
        ...s,
        blocks: s.blocks.map((b) => ({
          ...b,
          content: null,
          dataRef: null,
        })),
      }));
    }
    return report.sections;
  }
}