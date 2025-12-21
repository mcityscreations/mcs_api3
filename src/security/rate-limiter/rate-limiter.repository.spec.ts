import { Test, TestingModule } from '@nestjs/testing';
import { RateLimiterRepository } from './rate-limiter.repository';

describe('RateLimiterRepositoryService', () => {
	let service: RateLimiterRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [RateLimiterRepository],
		}).compile();

		service = module.get<RateLimiterRepository>(RateLimiterRepository);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
