import { Test, TestingModule } from '@nestjs/testing';
import { EntitiesRepository } from './entities.repository.js';

describe('EntitiesRepository', () => {
	let service: EntitiesRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [EntitiesRepository],
		}).compile();

		service = module.get<EntitiesRepository>(EntitiesRepository);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
