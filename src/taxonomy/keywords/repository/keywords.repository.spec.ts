import { Test, TestingModule } from '@nestjs/testing';
import { KeywordsRepository } from './keywords.repository.js';

describe('KeywordsRepository', () => {
	let service: KeywordsRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [KeywordsRepository],
		}).compile();

		service = module.get<KeywordsRepository>(KeywordsRepository);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
