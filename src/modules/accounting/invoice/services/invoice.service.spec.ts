import { Test, TestingModule } from '@nestjs/testing';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { InvoiceService } from './invoice.service.js';
import { WinstonLoggerService } from '../../../../system/logger/logger-service/winston-logger.service.js';
import { InvoiceRepository } from '../repository/invoice.repository.js';

describe('InvoiceService', () => {
	let service: InvoiceService;
	const mockLogger = {
		log: jest.fn(),
		warn: jest.fn(),
		error: jest.fn(),
	};
	const mockInvoiceRepository = {
		saveInvoice: jest.fn(),
		doesInvoiceExist: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				InvoiceService,
				{
					provide: WinstonLoggerService,
					useValue: mockLogger,
				},
				{
					provide: InvoiceRepository,
					useValue: mockInvoiceRepository,
				},
			],
		}).compile();

		service = module.get<InvoiceService>(InvoiceService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
