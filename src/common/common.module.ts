import { Module } from '@nestjs/common';
import { DateService } from './dates/datesService';

@Module({
	providers: [DateService],
	exports: [DateService],
})
export class CommonModule {}
