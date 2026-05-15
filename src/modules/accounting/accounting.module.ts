import { Module } from '@nestjs/common';
import { AccountingCronService } from './cron/cron.service.js';
import { AccountingService } from './services/accounting.service.js';
import { AccountingRepository } from './repository/accounting.repository.js';

@Module({
	providers: [AccountingCronService, AccountingService, AccountingRepository],
})
export class AccountingModule {}
