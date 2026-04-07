import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DateService } from '../../../common/dates/dates.service.js';
import { WinstonLoggerService } from '../../../system/logger/logger-service/winston-logger.service.js';

@Injectable()
export class AccountingCronServiceService {

    constructor(
        private readonly dateService: DateService, 
        private readonly logger: WinstonLoggerService,
    ) {}

    // This task will execute the 2nd day of every 2 months at midnight
    // Ereporting and einvoicing procedures will start September 1st 2026
    // First execution will be on November 2nd 2026, then January 2nd 2027, etc.
    @Cron('0 0 2 */2 *', { timeZone: 'Europe/Paris' })
    async sendInvoices() {
        const now = new Date();
        const serviceStartDate = new Date(2026, 10, 2) // November 2nd 2026 (months are 0-indexed)
        if (now < serviceStartDate) {
            this.logger.log('Service not started yet. First execution will be on November 2nd 2026.');
            return;
        } else {
            const startOfPeriod = this.dateService.dateOnlyFormatter(new Date(now.getFullYear(), now.getMonth() - 2, 1));
            const endOfPeriod = this.dateService.dateOnlyFormatter(new Date(now.getFullYear(), now.getMonth(), 0));
        }
    }


}