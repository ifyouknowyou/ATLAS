import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Classification, ReportBlockType, ReportStatus, ReportTemplateKind } from '@prisma/client';
import { PageQueryDto } from '../../common/pagination.dto';

export class CreateReportDto {
  @IsString()
  @MinLength(2)
  @MaxLength(300)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @IsOptional()
  @IsUUID()
  investigationId?: string;

  @IsOptional()
  @IsUUID()
  workspaceId?: string;

  @IsOptional()
  @IsEnum(Classification)
  classification?: Classification;

  @IsOptional()
  @IsEnum(ReportTemplateKind)
  templateKind?: ReportTemplateKind;

  @IsOptional()
  @IsUUID()
  templateId?: string;
}

export class UpdateReportDto {
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
  @MaxLength(8000)
  summary?: string;

  @IsOptional()
  @IsEnum(Classification)
  classification?: Classification;
}

export class ListReportsQueryDto extends PageQueryDto {
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @IsOptional()
  @IsUUID()
  investigationId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;
}

export class AddSectionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  key!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;
}

export class UpdateSectionDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsBoolean()
  collapsed?: boolean;
}

export class AddBlockDto {
  @IsEnum(ReportBlockType)
  type!: ReportBlockType;

  @IsOptional()
  content?: Record<string, unknown>;

  @IsOptional()
  dataRef?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  aiGenerated?: boolean;
}

export class UpdateBlockDto {
  @IsOptional()
  content?: Record<string, unknown>;

  @IsOptional()
  dataRef?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(ReportBlockType)
  type?: ReportBlockType;
}

export class MoveSectionDto {
  @IsInt()
  @Min(0)
  newPosition!: number;
}

export class MoveBlockDto {
  @IsUUID()
  toSectionId!: string;

  @IsInt()
  @Min(0)
  newPosition!: number;
}

export class CreateReportVersionDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  changeSummary?: string;
}

export class CreateCitationDto {
  @IsEnum([
    'EVIDENCE',
    'ENTITY',
    'RELATIONSHIP',
    'TIMELINE_EVENT',
    'INVESTIGATION',
    'NOTE',
    'REPORT',
  ])
  targetType!: 'EVIDENCE' | 'ENTITY' | 'RELATIONSHIP' | 'TIMELINE_EVENT' | 'INVESTIGATION' | 'NOTE' | 'REPORT';

  @IsUUID()
  targetId!: string;

  @IsOptional()
  @IsUUID()
  blockId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  snippet?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  sourceRef?: string;
}

export class ReviewReportDto {
  @IsEnum(['APPROVE', 'REJECT', 'REQUEST_CHANGES'])
  decision!: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES';

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  comment?: string;
}

export class ApproveReportDto {
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  comment?: string;
}

export class ExportQueryDto {
  @IsEnum(['PDF', 'HTML', 'JSON'])
  format!: 'PDF' | 'HTML' | 'JSON';
}

/** Hydration options when creating a report from a template. */
export class CreateFromTemplateDto {
  @IsUUID()
  templateId!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(300)
  title!: string;

  @IsOptional()
  @IsUUID()
  investigationId?: string;

  @IsOptional()
  @IsUUID()
  workspaceId?: string;
}
