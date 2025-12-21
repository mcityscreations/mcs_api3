import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationFlowService } from './authentication-flow.service';

describe('AuthenticationFlowService', () => {
	let service: AuthenticationFlowService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [AuthenticationFlowService],
		}).compile();

		service = module.get<AuthenticationFlowService>(AuthenticationFlowService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
