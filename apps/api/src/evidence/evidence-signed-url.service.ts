import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface SignedUrlPayload {
  scope: 'evidence-download';
  evidenceId: string;
  versionId?: string | null;
  /** Requester identity — re-validated at delivery time. */
  sub: string;
  oid: string;
  sid: string;
  exp: number;
}

/**
 * Short-lived signed download URLs (§62, §64).
 *
 * Evidence is never exposed through permanent public storage URLs. Browsers
 * often can't attach Authorization headers for <img>/<object>/iframe, so a
 * bearer-authenticated caller can mint a ~120s JWT scoped to one evidence
 * (and optionally one version) to open those media elements. The download
 * endpoint ALWAYS re-validates live membership/classification/status at
 * delivery — a signed URL is a hint, never a bypass; revoking access takes
 * effect immediately even if a previously-minted URL is replayed.
 */
@Injectable()
export class EvidenceSignedUrlService {
  constructor(private readonly jwt: JwtService) {}

  mint(input: {
    evidenceId: string;
    versionId?: string | null;
    sub: string;
    oid: string;
    sid: string;
    ttlS: number;
  }): string {
    return this.jwt.sign(
      {
        scope: 'evidence-download',
        evidenceId: input.evidenceId,
        versionId: input.versionId ?? null,
        sub: input.sub,
        oid: input.oid,
        sid: input.sid,
      },
      { expiresIn: input.ttlS },
    );
  }

  verify(token: string): { evidenceId: string; versionId?: string | null; sub: string; oid: string; sid: string } {
    try {
      const payload = this.jwt.verify<SignedUrlPayload>(token);
      if (payload.scope !== 'evidence-download' || !payload.evidenceId || !payload.sub) {
        throw new UnauthorizedException('Invalid download token');
      }
      return {
        evidenceId: payload.evidenceId,
        versionId: payload.versionId ?? null,
        sub: payload.sub,
        oid: payload.oid,
        sid: payload.sid,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired download token');
    }
  }
}
