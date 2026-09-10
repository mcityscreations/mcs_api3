import { Test, TestingModule } from '@nestjs/testing';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { AccountingService } from './accounting.service.js';
import { WinstonLoggerService } from '../../../system/logger/logger-service/winston-logger.service.js';
import { AccountingRepository } from '../repository/accounting.repository.js';

describe('AccountingService', () => {
	let service: AccountingService;
	const mockLogger = {
		log: jest.fn(),
		warn: jest.fn(),
		error: jest.fn(),
	};
	const mockAccountingRepository = {
		saveInvoice: jest.fn(),
		doesInvoiceExist: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AccountingService,
				{
					provide: WinstonLoggerService,
					useValue: mockLogger,
				},
				{
					provide: AccountingRepository,
					useValue: mockAccountingRepository,
				},
			], 
		}).compile();

		service = module.get<AccountingService>(AccountingService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
