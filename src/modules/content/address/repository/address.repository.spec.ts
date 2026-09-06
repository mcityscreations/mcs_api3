import { Test, TestingModule } from '@nestjs/testing';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { AddressRepository } from './address.repository.js';
import { PostgreSQLService } from '../../../../system/database/postgresql/postgresql.service.js';

describe('AddressRepository', () => {
	let service: AddressRepository;
	let dbService: any;
	const mockDbService = {
		execute: jest.fn(),
		beginTransaction: jest.fn(),
		commit: jest.fn(),
		rollback: jest.fn(),
	};
	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AddressRepository,
				{
					provide: PostgreSQLService,
					useValue: mockDbService,
				},
			],
		}).compile();

		service = module.get<AddressRepository>(AddressRepository);
		dbService = module.get<PostgreSQLService>(PostgreSQLService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
		expect(dbService).toBeDefined();
	});
});
