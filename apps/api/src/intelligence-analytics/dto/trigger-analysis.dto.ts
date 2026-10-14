import { IsOptional, IsIn } from 'class-validator';
import { Prisma } from '@prisma/client';

export const GRAPH_ANALYSIS_TYPES = [
  'CENTRALITY',
  'COMMUNITY',
  'PATH',
  'CLUSTERING',
  'CHANGE_DETECTION',
  'TEMPORAL',
  'GEOSPATIAL',
] as const;

export class TriggerAnalysisDto {
  @IsOptional()
  @IsIn(GRAPH_ANALYSIS_TYPES)
  analysisType: (typeof GRAPH_ANALYSIS_TYPES)[number];

  @IsOptional()
  investigationId?: string;

  @IsOptional()
  params?: Prisma.InputJsonValue;
}