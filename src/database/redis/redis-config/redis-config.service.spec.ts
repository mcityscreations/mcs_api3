// src/database/redis/redis-config/redis-config.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { RedisConfigService } from './redis-config.service';
import { ConfigService } from '@nestjs/config';

const mockConfigService = {
	get: jest.fn(),
};

describe('RedisConfigService', () => {
	let service: RedisConfigService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				RedisConfigService,
				{ provide: ConfigService, useValue: mockConfigService },
			],
		}).compile();

		service = module.get<RedisConfigService>(RedisConfigService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
