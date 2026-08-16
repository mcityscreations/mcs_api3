import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SystemModule } from '../../system/system.module.js';
import { AccountingCronService } from './cron/cron.service.js';
import { AccountingService } from './services/accounting.service.js';
import { AccountingRepository } from './repository/accounting.repository.js';

@Module({
	providers: [AccountingCronService, AccountingService, AccountingRepository],
	imports: [
		SystemModule,
		BullModule.registerQueue({
			name: 'accounting.save-invoice',
		}),
	],
	exports: [AccountingService, AccountingRepository, AccountingCronService],
})
export class AccountingModule {}
