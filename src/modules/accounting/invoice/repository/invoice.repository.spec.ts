import { Test, TestingModule } from '@nestjs/testing';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { InvoiceRepository } from './invoice.repository.js';
import { PostgreSQLService } from '../../../../system/database/postgresql/postgresql.service.js';

describe('InvoiceRepository', () => {
	let repository: InvoiceRepository;
	let dbService: PostgreSQLService;
	const mockDbService = {
		execute: jest.fn(),
		beginTransaction: jest.fn(),
		commit: jest.fn(),
		rollback: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				InvoiceRepository,
				{
					provide: PostgreSQLService,
					useValue: mockDbService,
				},
			],
		}).compile();

		repository = module.get<InvoiceRepository>(InvoiceRepository);
		dbService = module.get<PostgreSQLService>(PostgreSQLService);
	});

	it('should be defined', () => {
		expect(repository).toBeDefined();
		expect(dbService).toBeDefined();
	});
});
