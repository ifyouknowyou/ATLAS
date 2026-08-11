import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import {
  Classification,
  EvidenceAnnotationType,
  EvidenceLinkTargetType,
  EvidenceStatus,
  EvidenceType,
} from '@prisma/client';

/**
 * Form fields accompanying the multipart evidence upload.
 * The file itself is handled by the FileInterceptor; these are the metadata
 * fields submitted alongside it.
 */
export class UploadEvidenceBodyDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  source?: string;

  @IsOptional()
  @IsEnum(EvidenceType)
  type?: EvidenceType;

  @IsOptional()
  @IsEnum(Classification)
  classification?: Classification;

  @IsOptional()
  @IsEnum(EvidenceStatus)
  status?: EvidenceStatus;

  @IsOptional()
  @IsUUID()
  investigationId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reference?: string;
}

/** PATCH payload for evidence metadata (Phase 5 extensions). */
export class UpdateEvidenceExtendedDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  source?: string;

  @IsOptional()
  @IsEnum(EvidenceType)
  kind?: EvidenceType;

  @IsOptional()
  @IsEnum(Classification)
  classification?: Classification;

  @IsOptional()
  @IsEnum(EvidenceStatus)
  status?: EvidenceStatus;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reference?: string;

  @IsOptional()
  @IsUUID()
  investigationId?: string;
}

/** Search query params for /evidence/search. */
export class SearchEvidenceQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @IsEnum(EvidenceType)
  type?: EvidenceType;

  @IsOptional()
  @IsEnum(EvidenceStatus)
  status?: EvidenceStatus;

  @IsOptional()
  @IsEnum(Classification)
  classification?: Classification;

  @IsOptional()
  @IsUUID()
  investigationId?: string;

  @IsOptional()
  @IsUUID()
  uploaderId?: string;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  hash?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}

/** Annotation create payload (§15). */
export class CreateAnnotationDto {
  @IsEnum(EvidenceAnnotationType)
  type!: EvidenceAnnotationType;

  @IsOptional()
  @IsUUID()
  versionId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  content?: string;

  @IsOptional()
  target?: {
    page?: number;
    rect?: { x: number; y: number; w: number; h: number };
    startIndex?: number;
    endIndex?: number;
  };

  @IsOptional()
  tags?: string[];
}

/** Link create payload (§16). */
export class CreateEvidenceLinkDto {
  @IsEnum(EvidenceLinkTargetType)
  targetType!: EvidenceLinkTargetType;

  @IsUUID()
  targetId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  linkType?: string;
}
