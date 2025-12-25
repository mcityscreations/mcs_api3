import { Test, TestingModule } from '@nestjs/testing';
import { winstonLoggerFactory } from './winston-logger.factory';

describe('winstonLoggerFactory', () => {
	let service: typeof winstonLoggerFactory;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [winstonLoggerFactory],
		}).compile();

		service = module.get<typeof winstonLoggerFactory>(winstonLoggerFactory);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
