import { Module } from '@nestjs/common';
import { AccountingCronServiceService } from './cron/cron.service.js';

@Module({
  providers: [AccountingCronServiceService]
})
export class AccountingModule {}
