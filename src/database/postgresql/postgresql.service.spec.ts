import { Test, TestingModule } from '@nestjs/testing';
import { PostgreSQLService } from './postgresql.service.js';

describe('PostgreSQLService', () => {
	let service: PostgreSQLService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [PostgreSQLService],
		}).compile();

		service = module.get<PostgreSQLService>(PostgreSQLService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
