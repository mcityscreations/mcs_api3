import { Global, Module } from '@nestjs/common';
import { DateService } from './dates/dates.service.js';

@Global()
@Module({
	providers: [DateService],
	exports: [DateService],
})
export class CommonModule {}
