import { Test, TestingModule } from '@nestjs/testing';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { PeopleRepository } from './people.repository.js';
import { PostgreSQLService } from '../../../../system/database/postgresql/postgresql.service.js';

describe('PeopleRepository', () => {
	let service: PeopleRepository;
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
				PeopleRepository,
				{
					provide: PostgreSQLService,
					useValue: mockDbService,
				},
			],
		}).compile();

		service = module.get<PeopleRepository>(PeopleRepository);
		dbService = module.get<PostgreSQLService>(PostgreSQLService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
		expect(dbService).toBeDefined();
	});
});
