import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { SystemModule } from '../../system/system.module.js';
// Invoice
import { InvoiceCronService } from './invoice/cron/cron.service.js';
import { InvoiceService } from './invoice/services/invoice.service.js';
import { InvoiceRepository } from './invoice/repository/invoice.repository.js';
import { ProcessInvoiceProcessor } from './invoice/processors/process-invoice.processor.js';
// Payment
import { PaymentService } from './payment/services/payment.service.js';
import { PaymentRepository } from './payment/repository/payment.repository.js';
import { ProcessPaymentProcessor } from './payment/processors/process-payment.processor.js';
// Currency
import { CurrencyService } from './currency/service/currency.service.js';
import { CurrencyRepository } from './currency/repository/currency.repository.js';

@Module({
	providers: [
		InvoiceCronService,
		InvoiceService,
		InvoiceRepository,
		ProcessInvoiceProcessor,
		PaymentService,
		PaymentRepository,
		ProcessPaymentProcessor,
		CurrencyService,
		CurrencyRepository,
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
		BullModule.registerQueue({
			name: 'accounting.process-payment',
		}),
		BullBoardModule.forFeature({
			name: 'accounting.process-payment',
			adapter: BullMQAdapter,
		}),
	],
	exports: [InvoiceService, CurrencyService, PaymentService],
})
export class AccountingModule {}
