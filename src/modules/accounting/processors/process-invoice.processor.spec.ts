import { Test, TestingModule } from '@nestjs/testing';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { AccountingRepository } from '../repository/accounting.repository.js';
import { ProcessInvoiceProcessor } from './process-invoice.processor.js';
import { WinstonLoggerService } from '../../../system/logger/logger-service/winston-logger.service.js';
import { UnrecoverableError, Job } from 'bullmq';

export function createValidMockJob(overrides = {}): Job {
	const validDescriptor = {
		jobName: 'process-invoice-job',
		payload: {
			id: '019b902e-d7e5-75d5-92a7-8d257c91c375',
			pattern: 'accounting.invoice.created',
			timestamp: new Date().toISOString(),
			correlationId: 'corr-id-456',
			data: {
				id_technical: '1042',
				reference: 'FAC-2026-001',
				source_system: 'prestashop', // Attention : minuscules obligatoires
				invoice_type: 'invoice', // Enum : "invoice" | "credit_note" | "proforma"
				issue_date: new Date('2026-01-15'),
				due_date: new Date('2026-02-15'),
				currency: 'EUR',
				total_amount_tax_excl: 10000,
				total_amount_tax_incl: 12000,
				vat_amount: 2000,
				discount_amount: 0,
				payment_status: 'paid', // Enum : "paid" | "unpaid" | "draft"
				payment_direction: 'debit', // Enum : "debit" | "credit"
				emitter: {
					id: '019b902e-d7e5-75d5-92a7-8d257c91c375',
				},
				recipient: {
					id: '019b902e-d7e5-75d5-92a7-8d257c91c375',
					id_billing_address: '019b902e-d7e5-75d5-92a7-8d257c91c375',
				},
				order_details: [
					{
						id: 'item-1',
						label: 'Livre - Le Comte de Monte-Cristo',
						description: 'Édition collector',
						quantity: 1,
						unit_price_tax_excl: 10000,
						discount: {
							type: 'percentage',
							value: 10,
							discount_amount_tax_excl: 1000,
						},
						unit_price_tax_excl_discount: 10000,
						unit_price_tax_incl: 12000,
						vat_rate: 2000,
						total_price_tax_excl: 10000,
						total_price_tax_incl: 12000,
					},
				],
			},
		},
	};

	return {
		id: 'job-id-123',
		name: 'accounting.process-invoice',
		queueName: 'accounting.process-invoice',
		data: {
			...validDescriptor,
			...overrides,
		},
	} as unknown as Job;
}
describe('ProcessInvoiceProcessor', () => {
	let processor: ProcessInvoiceProcessor;
	let repository: AccountingRepository;

	const mockAccountingRepository = {
		saveMainInvoiceData: jest.fn(),
		doesInvoiceExist: jest.fn(),
	};
	const mockLogger = {
		log: jest.fn(),
		warn: jest.fn(),
		error: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ProcessInvoiceProcessor,
				{
					provide: AccountingRepository,
					useValue: mockAccountingRepository,
				},
				{
					provide: WinstonLoggerService,
					useValue: mockLogger,
				},
			],
		}).compile();

		processor = module.get(ProcessInvoiceProcessor);
		repository = module.get<AccountingRepository>(AccountingRepository);
	});

	it('devrait lever UnrecoverableError si le payload est invalide', async () => {
		const mockJob = { id: '1', data: { invalid: 'data' } } as any;

		await expect(processor.process(mockJob)).rejects.toThrow(
			UnrecoverableError,
		);
	});

	it("devrait s'arrêter proprement sans erreur si la facture existe déjà", async () => {
		const mockJob = createValidMockJob();
		mockAccountingRepository.saveMainInvoiceData.mockResolvedValue(null); // Conflit ON CONFLICT

		await expect(processor.process(mockJob)).resolves.not.toThrow();
		expect(mockAccountingRepository.saveMainInvoiceData).toHaveBeenCalledTimes(
			1,
		);
	});
});
