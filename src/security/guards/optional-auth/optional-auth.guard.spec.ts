import { Test, TestingModule } from '@nestjs/testing';
import { OptionalAuthGuard } from './optional-auth.guard';
import { JwtRepository } from '../../jwt/jwt.repository';

describe('OptionalAuthGuard', () => {
	let jwtRepository: JwtRepository;
	let optionalAuthGuard: OptionalAuthGuard;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [JwtRepository, OptionalAuthGuard],
		}).compile();

		jwtRepository = module.get<JwtRepository>(JwtRepository);
		optionalAuthGuard = module.get<OptionalAuthGuard>(OptionalAuthGuard);
	});
	it('should be defined', () => {
		expect(jwtRepository).toBeDefined();
	});
	it('should be defined', () => {
		expect(optionalAuthGuard).toBeDefined();
	});
});
