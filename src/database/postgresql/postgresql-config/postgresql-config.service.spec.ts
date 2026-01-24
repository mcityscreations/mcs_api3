import { Test, TestingModule } from '@nestjs/testing';
import { PostgresqlConfigService } from './postgresql-config.service.js';

describe('PostgresqlConfigService', () => {
	let service: PostgresqlConfigService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [PostgresqlConfigService],
		}).compile();

		service = module.get<PostgresqlConfigService>(PostgresqlConfigService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
