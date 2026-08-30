import { Test, TestingModule } from '@nestjs/testing';
import { PostgreSQLService } from './postgresql.service.js';

describe('PostgreSQLService', () => {
	let service: PostgreSQLService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PostgreSQLService,
				{
					provide: 'PG_STANDARD_CONFIG',
					useValue: {},
				},
				{
					provide: 'PG_SECURITY_CONFIG',
					useValue: {},
				},
				{
					provide: 'WinstonLoggerService',
					useValue: {
						log: jest.fn(),
						error: jest.fn(),
						warn: jest.fn(),
						debug: jest.fn(),
					},
				},
			],
		}).compile();

		service = module.get<PostgreSQLService>(PostgreSQLService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
