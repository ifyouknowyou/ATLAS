import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Classification, EvidenceStatus, EvidenceType } from '@prisma/client';
import { PageQueryDto } from '../../common/pagination.dto';

const SHA256_PATTERN = /^[a-fA-F0-9]{64}$/;

export class CreateEvidenceDto {
  /** Display title of the evidence item. */
  @IsString()
  @MinLength(2)
  @MaxLength(300)
  title!: string;

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
  @IsEnum(EvidenceStatus)
  status?: EvidenceStatus;

  @IsOptional()
  @IsEnum(Classification)
  classification?: Classification;

  /** SHA-256 hex digest when supplied (format validated, no fake crypto). */
  @IsOptional()
  @IsString()
  @Matches(SHA256_PATTERN, { message: 'hash must be a 64-char SHA-256 hex digest' })
  hash?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  mimeType?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(9_007_199_254_740_991)
  size?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reference?: string;

  @IsOptional()
  @IsDateString()
  collectedAt?: string;

  @IsOptional()
  @IsUUID()
  investigationId?: string;
}

export class UpdateEvidenceDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
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
  @IsEnum(EvidenceStatus)
  status?: EvidenceStatus;

  @IsOptional()
  @IsEnum(Classification)
  classification?: Classification;

  @IsOptional()
  @IsString()
  @Matches(SHA256_PATTERN, { message: 'hash must be a 64-char SHA-256 hex digest' })
  hash?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  mimeType?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  size?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reference?: string;

  @IsOptional()
  @IsDateString()
  collectedAt?: string;
}

export class ListEvidenceQueryDto extends PageQueryDto {
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
  @Type(() => String)
  @IsString()
  @MaxLength(100)
  q?: string;
}