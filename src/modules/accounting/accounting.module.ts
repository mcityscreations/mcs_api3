import { Module } from '@nestjs/common';
import { AccountingCronServiceService } from './cron/cron.service.js';
import { AccountingService } from './services/accounting.service.js';

@Module({
  providers: [AccountingCronServiceService, AccountingService]
})
export class AccountingModule {}
