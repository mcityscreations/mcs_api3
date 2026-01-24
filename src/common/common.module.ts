import { Module } from '@nestjs/common';
import { DateService } from './dates/dates.service.js';

@Module({
	providers: [DateService],
	exports: [DateService],
})
export class CommonModule {}
