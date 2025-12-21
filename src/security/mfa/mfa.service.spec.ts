import { Test, TestingModule } from '@nestjs/testing';
import { MfaSessionService } from './mfa.service';

describe('MfaService', () => {
	let service: MfaSessionService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [MfaSessionService],
		}).compile();

		service = module.get<MfaSessionService>(MfaSessionService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
