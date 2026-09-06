import { Test, TestingModule } from '@nestjs/testing';
import { AccountingRepository } from './accounting.repository.js';
import { PostgreSQLService } from '../../../system/database/postgresql/postgresql.service.js';

describe('AccountingRepository', () => {
	let service: AccountingRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AccountingRepository,
				{
					provide: PostgreSQLService,
					useValue: {
						execute: jest.fn(),
						beginTransaction: jest.fn(),
						commit: jest.fn(),
						rollback: jest.fn(),
					},
				},
			],
		}).compile();

		service = module.get<AccountingRepository>(AccountingRepository);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
