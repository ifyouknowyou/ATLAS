import { Module } from '@nestjs/common';
import { SecurityService } from './security.service';
import { InputValidationPipe } from './input-validation.pipe';

@Module({
  providers: [SecurityService, InputValidationPipe],
  exports: [SecurityService, InputValidationPipe],
})
export class SecurityModule {}