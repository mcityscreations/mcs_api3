import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
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
	],
	exports: [AccountingService, AccountingCronService],
})
export class AccountingModule {}
