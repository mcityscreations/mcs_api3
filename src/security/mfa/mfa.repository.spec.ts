import { Test, TestingModule } from '@nestjs/testing';
import { MfaSessionRepository } from './mfa.repository';

describe('MfaRepositoryService', () => {
	let service: MfaSessionRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [MfaSessionRepository],
		}).compile();

		service = module.get<MfaSessionRepository>(MfaSessionRepository);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
