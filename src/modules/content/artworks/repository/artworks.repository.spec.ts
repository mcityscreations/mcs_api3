import { Test, TestingModule } from '@nestjs/testing';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { ArtworksRepository } from './artworks.repository.js';
import { PostgreSQLService } from '../../../../system/database/postgresql/postgresql.service.js';

describe('ArtworksRepository', () => {
	let service: ArtworksRepository;
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
				ArtworksRepository,
				{
					provide: PostgreSQLService,
					useValue: mockDbService,
				},
			],
		}).compile();

		service = module.get<ArtworksRepository>(ArtworksRepository);
		dbService = module.get<PostgreSQLService>(PostgreSQLService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
		expect(dbService).toBeDefined();
	});
});
