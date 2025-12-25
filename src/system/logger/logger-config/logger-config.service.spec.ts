// src/system/logger/logger-config/logger-config.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerConfigService } from './logger-config.service';
import { ConfigService } from '@nestjs/config';

const mockConfigService = {
	get: jest.fn(),
};

describe('LoggerConfigService', () => {
	let service: LoggerConfigService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				LoggerConfigService,
				{ provide: ConfigService, useValue: mockConfigService },
			],
		}).compile();

		service = module.get<LoggerConfigService>(LoggerConfigService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
