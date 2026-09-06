import { Test, TestingModule } from '@nestjs/testing';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { AccountingRepository } from './accounting.repository.js';
import { PostgreSQLService } from '../../../system/database/postgresql/postgresql.service.js';

describe('AccountingRepository', () => {
	let repository: AccountingRepository;
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
				AccountingRepository,
				{
					provide: PostgreSQLService,
					useValue: mockDbService,
				},
			],
		}).compile();

		repository = module.get<AccountingRepository>(AccountingRepository);
		dbService = module.get<PostgreSQLService>(PostgreSQLService);
	});

	it('should be defined', () => {
		expect(repository).toBeDefined();
		expect(dbService).toBeDefined();
	});
});
