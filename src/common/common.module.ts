import { Module } from '@nestjs/common';
import { DateService } from './dates/dates.service.js';
import { ZodValidationPipe } from './pipes/zod-validation.pipe.js';

@Module({
	providers: [DateService, ZodValidationPipe],
	exports: [DateService, ZodValidationPipe],
})
export class CommonModule {}
