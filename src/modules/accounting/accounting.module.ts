import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ProcessInvoiceProcessor } from './processors/process-invoice.processor.js';
import { SystemModule } from '../../system/system.module.js';
import { AccountingCronService } from './cron/cron.service.js';
import { AccountingService } from './services/accounting.service.js';
import { AccountingRepository } from './repository/accounting.repository.js';

@Module({
	providers: [
		AccountingCronService,
		AccountingService,
		AccountingRepository,
		ProcessInvoiceProcessor,
	],
	imports: [
		SystemModule,
		BullModule.registerQueue({
			name: 'accounting.process-invoice',
		}),
		BullBoardModule.forFeature({
			name: 'accounting.process-invoice',
			adapter: BullMQAdapter,
		}),
	],
	exports: [AccountingService, AccountingCronService],
})
export class AccountingModule {}
