import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { SecurityService } from './security.service';

@Injectable()
export class InputValidationPipe implements PipeTransform {
  constructor(private readonly security: SecurityService) {}

  transform(value: any, metadata: ArgumentMetadata) {
    // Skip validation for non-string values (like objects, numbers, etc.)
    if (typeof value !== 'string') {
      return value;
    }

    // Sanitize the string to prevent XSS and other injection attacks
    const sanitized = this.security.sanitizeText(value);

    // If the sanitized value is empty but the original wasn't, it might be an attempt to inject
    if (sanitized === '' && value.length > 0) {
      throw new BadRequestException('Input contains invalid characters');
    }

    return sanitized;
  }
}