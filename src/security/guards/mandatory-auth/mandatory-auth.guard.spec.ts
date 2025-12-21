import { Test, TestingModule } from '@nestjs/testing';
import { MandatoryAuthGuard } from './mandatory-auth.guard';
import { JwtRepository } from '../../jwt/jwt.repository';

describe('MandatoryAuthGuard', () => {
	let jwtRepository: JwtRepository;
	let mandatoryAuthGuard: MandatoryAuthGuard;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [JwtRepository, MandatoryAuthGuard],
		}).compile();

		jwtRepository = module.get<JwtRepository>(JwtRepository);
		mandatoryAuthGuard = module.get<MandatoryAuthGuard>(MandatoryAuthGuard);
	});
	it('should be defined', () => {
		expect(jwtRepository).toBeDefined();
	});
	it('should be defined', () => {
		expect(mandatoryAuthGuard).toBeDefined();
	});
});
