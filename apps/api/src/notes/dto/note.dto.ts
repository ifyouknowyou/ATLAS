import { Type } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { NoteVisibility } from '@prisma/client';
import { PageQueryDto } from '../../common/pagination.dto';

export class CreateNoteDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MaxLength(20_000)
  content!: string;

  @IsOptional()
  @IsEnum(NoteVisibility)
  visibility?: NoteVisibility;

  @IsUUID()
  investigationId!: string;

  @IsOptional()
  @IsUUID()
  entityId?: string;
}

export class UpdateNoteDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20_000)
  content?: string;

  @IsOptional()
  @IsEnum(NoteVisibility)
  visibility?: NoteVisibility;
}

export class ListNotesQueryDto extends PageQueryDto {
  @IsUUID()
  investigationId!: string;

  @IsOptional()
  @Type(() => String)
  @IsString()
  @MaxLength(100)
  q?: string;
}