import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class PaginationPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type === 'param' && (metadata.data === 'limit' || metadata.data === 'cursor')) {
      if (typeof value !== 'string') return value;
      const parsed = parseInt(value, 10);
      if (metadata.data === 'limit') {
        if (isNaN(parsed) || parsed < 1 || parsed > 200) {
          throw new BadRequestException('Limit must be between 1 and 200');
        }
        return parsed;
      }
      if (metadata.data === 'cursor') {
        if (isNaN(parsed) || parsed < 0) {
          throw new BadRequestException('Cursor must be a non-negative number');
        }
        return parsed;
      }
    }
    return value;
  }
}