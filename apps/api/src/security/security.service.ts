import { Injectable, ForbiddenException, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { AuthenticatedPrincipal } from '../auth/principal';

@Injectable()
export class SecurityService {
  constructor(
    private readonly config: ConfigService,
    @Optional() private readonly principal: AuthenticatedPrincipal,
  ) {}

  // Input validation and sanitization
  sanitizeText(text: string): string {
    if (!text) return '';
    // Remove HTML tags and script content
    return text
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  validatePromptInput(prompt: string): { safe: boolean; reason?: string } {
    const lower = prompt.toLowerCase();
    const injectionPatterns = [
      'ignore previous instructions',
      'ignore all previous',
      'system:',
      'you are now',
      'pretend to be',
      'act as',
      'disregard',
      'override',
    ];
    for (const pattern of injectionPatterns) {
      if (lower.includes(pattern)) {
        return { safe: false, reason: `Prompt injection pattern detected: ${pattern}` };
      }
    }
    // Length limit
    if (prompt.length > 10000) {
      return { safe: false, reason: 'Prompt too long' };
    }
    return { safe: true };
  }

  validateMimeType(filename: string, mime: string): boolean {
    const allowed: Record<string, string[]> = {
      'jpg': ['image/jpeg'],
      'jpeg': ['image/jpeg'],
      'png': ['image/png'],
      'gif': ['image/gif'],
      'pdf': ['application/pdf'],
      'txt': ['text/plain'],
      'csv': ['text/csv'],
      'json': ['application/json'],
    };
    const ext = filename.split('.').pop()?.toLowerCase();
    if (!ext) return false;
    const allowedMimes = allowed[ext] || [];
    return allowedMimes.includes(mime);
  }

  computeEvidenceHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  // Classification enforcement
  enforceClassificationScope(userClassification: string, resourceClassification: string): boolean {
    // Simplified: higher classification can access lower
    const levels = ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'SECRET', 'TOP_SECRET'];
    const userLevel = levels.indexOf(userClassification);
    const resourceLevel = levels.indexOf(resourceClassification);
    if (userLevel === -1 || resourceLevel === -1) return false;
    return userLevel >= resourceLevel;
  }

  validateExportScope(resourceType: string, classification: string): boolean {
    // For now, allow all exports if classification allows
    const allowed = ['PUBLIC', 'INTERNAL'];
    return allowed.includes(classification);
  }

  // Rate limiting helpers
  getRateLimitKey(type: string, id?: string): string {
    const orgId = this.principal.organizationId ?? 'global';
    const userId = this.principal.userId ?? 'anonymous';
    return `${type}:${orgId}:${userId}:${id ?? ''}`;
  }

  // Password hashing (if needed)
  hashPassword(password: string): string {
    const salt = this.config.get<string>('HASH_SALT') || 'default-salt';
    return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  }

  comparePassword(password: string, hash: string): boolean {
    const hashToCompare = this.hashPassword(password);
    return hashToCompare === hash;
  }
}