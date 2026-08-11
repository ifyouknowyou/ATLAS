import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class ChatHistoryItemDto {
  @IsIn(['USER', 'ASSISTANT'])
  role!: 'USER' | 'ASSISTANT';

  @IsString()
  @MaxLength(8000)
  content!: string;
}

export class ChatDto {
  @IsOptional()
  @IsUUID()
  investigationId?: string;

  @IsString()
  @MaxLength(8000)
  message!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(40)
  @ValidateNested({ each: true })
  @Type(() => ChatHistoryItemDto)
  history?: ChatHistoryItemDto[];
}

export class SummarizeDto {
  @IsOptional()
  @IsUUID()
  investigationId?: string;
}

export class AiMessagesQueryDto {
  @IsOptional()
  @IsUUID()
  investigationId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}