import { Test, TestingModule } from '@nestjs/testing';
import { JwtRepository } from './jwt.repository';

describe('JwtRepositoryService', () => {
	let service: JwtRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [JwtRepository],
		}).compile();

		service = module.get<JwtRepository>(JwtRepository);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
