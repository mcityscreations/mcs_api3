import { Test, TestingModule } from '@nestjs/testing';
import { TechniquesRepository } from './techniques.repository.js';

describe('TechniquesRepositoryService', () => {
	let service: TechniquesRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [TechniquesRepository],
		}).compile();

		service = module.get<TechniquesRepository>(TechniquesRepository);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
