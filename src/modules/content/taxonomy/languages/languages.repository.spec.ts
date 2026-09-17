import { Test, TestingModule } from '@nestjs/testing';
import { LanguagesRepository } from './languages.repository.js';

describe('LanguagesRepository', () => {
	let service: LanguagesRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [LanguagesRepository],
		}).compile();

		service = module.get<LanguagesRepository>(LanguagesRepository);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
