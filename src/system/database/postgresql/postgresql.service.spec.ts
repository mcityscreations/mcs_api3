import { Test, TestingModule } from '@nestjs/testing';
import { PostgreSQLService } from './postgresql.service.js';
import { jest } from '@jest/globals';

describe('PostgreSQLService', () => {
	let service: PostgreSQLService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PostgreSQLService,
				{
					provide: 'PG_STANDARD_CONFIG',
					useValue: {
						log: jest.fn(),
						error: jest.fn(),
						warn: jest.fn(),
						debug: jest.fn(),
					},
				},
				{
					provide: 'PG_SECURITY_CONFIG',
					useValue: {
						log: jest.fn(),
						error: jest.fn(),
						warn: jest.fn(),
						debug: jest.fn(),
					},
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
		})
			.compile();

		service = module.get<PostgreSQLService>(PostgreSQLService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
