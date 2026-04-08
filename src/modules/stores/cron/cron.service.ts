import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DateTime } from 'luxon';
import { DateService } from 'src/common/dates/dates.service.js';
import { PrestashopAdapter } from '../adapters/prestashop.adapter.js';
import { IPrestashopInvoice } from '../schemas/prestashop/invoices.schema.js';
import { WinstonLoggerService } from '../../../system/logger/logger-service/winston-logger.service.js';

@Injectable()
export class PrestashopCronService {

    constructor(
        private readonly dateService: DateService, 
        private readonly prestashopAdapter: PrestashopAdapter,
        private readonly logger: WinstonLoggerService,
    ) {}

    // This task will execute every Monday at 2 AM
    @Cron('0 2 * * 1', { timeZone: 'Europe/Paris' })
    async getWeeklyInvoices() {
        const now = new Date();
        const serviceStartDate = new Date(2026, 10, 2) // November 2nd 2026 (months are 0-indexed)
        if (now < serviceStartDate) {
            this.logger.log('Service not started yet. First execution will be on November 2nd 2026.');
            return;
        } else {
            const nowParis = DateTime.now().setZone('Europe/Paris');
            const rawStartOfPeriod = nowParis.minus({ days: 7 }).startOf('day');
            const rawEndOfPeriod = nowParis.minus({ days: 1 }).endOf('day');
            const startOfPeriod = this.dateService.dateOnlyFormatter(rawStartOfPeriod.toJSDate());
            const endOfPeriod = this.dateService.dateOnlyFormatter(rawEndOfPeriod.toJSDate());
            const invoices: IPrestashopInvoice[] = await this.prestashopAdapter.getInvoicesByDatePeriod({ startDate: startOfPeriod, endDate: endOfPeriod });
            // Next step : save the invoices into the database. 
            // They will then be processed by the Accounting module's cron service on the 2nd day of every 2 months.
            // + change the way startOfPeriod and endOfPeriod are calculated 
            // to match one week instead of 2 months.
        }
    }
}
